import React from "react";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Accordion,
  AccordionItem,
  Chip,
  addToast,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Checks, FileLock, Key, Lock } from "@phosphor-icons/react";

import {
  useRevokeBoardAccess,
  useGrantBoardAccess,
} from "../api/board-access.api";
import { boardAccessService } from "../services/boardAccess.service";
import { useOrganizationMembers } from "../api/index";

import apiClient from "@/libs/axios/interceptor";

interface BoardAccessManagementProps {
  organizationId: string;
}

export const BoardAccessManagement: React.FC<BoardAccessManagementProps> = ({
  organizationId,
}) => {
  const grantBoardAccess = useGrantBoardAccess({
    onSuccess: () => {
      addToast({
        title: "Access Updated",
        description: "Board access updated successfully!",
        color: "success",
      });
    },
  });
  const revokeAccess = useRevokeBoardAccess({
    onSuccess: () => {
      addToast({
        title: "Access Updated",
        description: "Board access updated successfully!",
        color: "success",
      });
    },
  });
  // Fetch all boards for the organization
  const { data: boardsData, isLoading: boardsLoading } = useQuery({
    queryKey: ["orgBoards", organizationId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/board/organization/${organizationId}`
      );

      return data.boards;
    },
    enabled: !!organizationId,
  });

  // Fetch organization members to get the owner
  const { data: membersData } = useOrganizationMembers(organizationId);
  const owner = membersData?.members?.find(
    (m: any) => m.role === "ADMIN" && m.isOwner
  );
  const ownerId = owner?.user?.id;

  // Fetch access lists for all boards
  const { data: accessLists, isLoading: accessLoading } = useQuery({
    queryKey: ["orgBoardAccess", organizationId],
    queryFn: async () => {
      if (!boardsData) return {};
      const results: Record<string, any[]> = {};

      await Promise.all(
        boardsData.map(async (board: any) => {
          const res = await boardAccessService.getBoardAccessList(
            organizationId,
            board.id
          );

          results[board.id] = res.accessList;
        })
      );

      return results;
    },
    enabled: !!boardsData,
  });

  if (boardsLoading || accessLoading) {
    return <Spinner label="Loading board access..." />;
  }

  // Get all organization members excluding the current user (admin)
  const organizationMembers = membersData?.members || [];

  // Filter out the current user/admin from the list
  let users = organizationMembers.map((member) => member.user);
  if (ownerId) {
    users = users.filter((user: any) => user.id !== ownerId);
  }

  return (
    <Card>
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Board Access Management</h3>
        </div>
        <Accordion>
          {users.length > 0 ? (
            users.map((user: any) => (
              <AccordionItem
                key={user.id}
                title={
                  <div className="flex items-center gap-2">
                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-default-400 text-xs">
                      ({user.email})
                    </span>
                  </div>
                }
              >
                <Table aria-label="User Board Access">
                  <TableHeader>
                    <TableColumn>Board</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Access</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {boardsData?.map((board: any) => {
                      const access = accessLists?.[board.id]?.find(
                        (a: any) => a.userId === user.id
                      );

                      return (
                        <TableRow key={board.id}>
                          <TableCell>{board.title}</TableCell>
                          <TableCell>
                            <Chip
                              color={access ? "success" : "default"}
                              size="sm"
                              startContent={access ? <Checks /> : <Lock />}
                              variant="flat"
                            >
                              {access ? "Has Access" : "No Access"}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {access ? (
                              <Button
                                color="danger"
                                size="sm"
                                variant="flat"
                                startContent={<FileLock />}
                                onClick={() =>
                                  revokeAccess.mutate({
                                    organizationId,
                                    boardId: board.id,
                                    userId: user.id,
                                  })
                                }
                              >
                                Revoke Access
                              </Button>
                            ) : (
                              <Button
                                color="primary"
                                size="sm"
                                variant="flat"
                                startContent={<Key />}
                                onClick={() =>
                                  grantBoardAccess.mutate({
                                    organizationId,
                                    boardId: board.id,
                                    userId: user.id,
                                    accessRole: "MEMBER",
                                  })
                                }
                              >
                                Grant Access
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </AccordionItem>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-default-500">No organization members found.</p>
            </div>
          )}
        </Accordion>
      </CardBody>
    </Card>
  );
};

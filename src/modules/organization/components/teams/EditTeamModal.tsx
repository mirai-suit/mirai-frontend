import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Tabs,
  Tab,
  Card,
  CardBody,
  Chip,
  Avatar,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PencilSimple,
  Users,
  Kanban,
  Crown,
  UserMinus,
} from "@phosphor-icons/react";

import { updateTeamSchema, UpdateTeamInput } from "../../validations/team";
import { UpdateTeamRequest, TEAM_COLORS } from "../../types/team";
import {
  useUpdateTeam,
  useAddTeamMembers,
  useRemoveTeamMember,
  useUpdateTeamMemberRole,
  useTeam,
  useAssignBoards,
  useRemoveBoard,
} from "../../api/teams";
import { useOrganizationMembers } from "../../api";
import { useBoards } from "@/modules/board/api";
import { useOrgStore } from "@/store/useOrgStore";
import { useAuthStore } from "@/modules/auth/store";

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string | null;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  onClose,
  teamId,
}) => {
  const [activeTab, setActiveTab] = useState<string>("general");
  const { currentOrg } = useOrgStore();
  const { user } = useAuthStore();

  // Fetch fresh team data
  const { data: team, isLoading } = useTeam(teamId || "");

  const updateTeamMutation = useUpdateTeam();
  const addMembersMutation = useAddTeamMembers();
  const removeMemberMutation = useRemoveTeamMember();
  const updateMemberRoleMutation = useUpdateTeamMemberRole();
  const assignBoardsMutation = useAssignBoards();
  const removeBoardMutation = useRemoveBoard();

  const { data: membersResponse } = useOrganizationMembers(
    team?.organization?.id || ""
  );
  const { data: boardsResponse } = useBoards(currentOrg?.id || "");
  const organizationMembers = membersResponse?.members || [];
  const boards = boardsResponse?.boards || [];

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateTeamInput>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
      color: team?.color || "#3B82F6",
      objectives: team?.objectives || "",
    },
  });

  // Reset form when team changes
  React.useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        description: team.description || "",
        color: team.color,
        objectives: team.objectives || "",
      });
    }
  }, [team, reset]);

  // Member management functions
  const handleAddMember = async (memberId: string) => {
    if (!team) return;
    try {
      await addMembersMutation.mutateAsync({
        teamId: team.id,
        memberIds: [memberId],
        role: "MEMBER",
      });
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return;
    try {
      await removeMemberMutation.mutateAsync({
        teamId: team.id,
        userId: memberId,
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleUpdateMemberRole = async (
    memberId: string,
    role: "MEMBER" | "LEADER"
  ) => {
    if (!team) return;

    // If promoting to leader, show confirmation
    if (role === "LEADER") {
      const currentLeader = team.members.find((m) => m.role === "LEADER");
      if (currentLeader && currentLeader.user.id !== memberId) {
        const confirmed = window.confirm(
          `Are you sure you want to make this person the team leader? ${currentLeader.user.firstName} ${currentLeader.user.lastName} will be demoted to a regular member.`
        );
        if (!confirmed) return;
      }
    }

    try {
      await updateMemberRoleMutation.mutateAsync({
        teamId: team.id,
        userId: memberId,
        role,
      });
    } catch (error) {
      console.error("Failed to update member role:", error);
    }
  };

  // Board access management functions
  const handleAssignBoards = async (boardIds: string[]) => {
    if (!team || !user?.id) return;
    try {
      await assignBoardsMutation.mutateAsync({
        teamId: team.id,
        boardIds,
        grantedBy: user.id,
      });
    } catch (error) {
      console.error("Failed to assign boards:", error);
    }
  };

  const handleRemoveBoard = async (boardId: string) => {
    if (!team) return;
    try {
      await removeBoardMutation.mutateAsync({
        teamId: team.id,
        boardId,
      });
    } catch (error) {
      console.error("Failed to remove board:", error);
    }
  };

  // Get available boards (not already assigned to team)
  const availableBoards = boards.filter(
    (board) =>
      !team?.boardAccess?.some((access) => access.board.id === board.id)
  );

  // Get available members (not already in team)
  const availableMembers = organizationMembers.filter(
    (orgMember) =>
      !team?.members?.some(
        (teamMember) => teamMember.user.id === orgMember.user.id
      )
  );

  const handleClose = () => {
    reset();
    setActiveTab("general");
    onClose();
  };

  const onSubmit = async (data: UpdateTeamInput) => {
    if (!team) return;

    const updateData: UpdateTeamRequest = {
      ...data,
    };

    try {
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        data: updateData,
      });
      handleClose();
    } catch (error) {
      console.error("Failed to update team:", error);
    }
  };

  if (!teamId || !isOpen) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalBody className="flex items-center justify-center py-10">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-2 text-sm text-default-500">Loading team...</p>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (!team) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex items-center gap-2">
            <PencilSimple size={20} />
            Edit Team - {team.name}
          </ModalHeader>

          <ModalBody>
            <Tabs
              aria-label="Team edit options"
              className="w-full"
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
            >
              <Tab
                key="general"
                title={
                  <div className="flex items-center gap-2">
                    <PencilSimple size={16} />
                    <span>General</span>
                  </div>
                }
              >
                <div className="space-y-4 py-4">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Team Name"
                        placeholder="Enter team name"
                        errorMessage={errors.name?.message}
                        isInvalid={!!errors.name}
                      />
                    )}
                  />

                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Description"
                        placeholder="Describe the team's purpose and goals"
                        maxRows={3}
                        errorMessage={errors.description?.message}
                        isInvalid={!!errors.description}
                      />
                    )}
                  />

                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Team Color</span>
                        <div className="flex gap-2 flex-wrap">
                          {TEAM_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-8 h-8 rounded-full border-2 ${
                                field.value === color
                                  ? "border-foreground"
                                  : "border-default-200"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => field.onChange(color)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  />

                  <Controller
                    name="objectives"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Objectives"
                        placeholder="What are the team's main objectives?"
                        maxRows={3}
                        errorMessage={errors.objectives?.message}
                        isInvalid={!!errors.objectives}
                      />
                    )}
                  />
                </div>
              </Tab>

              <Tab
                key="members"
                title={
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>Members</span>
                  </div>
                }
              >
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Team Members</h3>
                    <Chip size="sm" variant="flat">
                      {team.members.length} member
                      {team.members.length !== 1 ? "s" : ""}
                    </Chip>
                  </div>

                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <Card
                        key={member.id}
                        className={`${
                          member.role === "LEADER"
                            ? "bg-warning-50 border-warning"
                            : "bg-default-50"
                        }`}
                      >
                        <CardBody className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium">
                                  {member.user.firstName} {member.user.lastName}
                                </p>
                                <p className="text-sm text-default-500">
                                  {member.user.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Chip
                                size="sm"
                                color={
                                  member.role === "LEADER"
                                    ? "warning"
                                    : "default"
                                }
                                variant="flat"
                              >
                                {member.role}
                              </Chip>
                              {member.role !== "LEADER" && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="light"
                                    color="warning"
                                    isIconOnly
                                    title="Make Leader"
                                    onPress={() =>
                                      handleUpdateMemberRole(
                                        member.user.id,
                                        "LEADER"
                                      )
                                    }
                                    isLoading={
                                      updateMemberRoleMutation.isPending
                                    }
                                  >
                                    <Crown size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    isIconOnly
                                    title="Remove Member"
                                    onPress={() =>
                                      handleRemoveMember(member.user.id)
                                    }
                                    isLoading={removeMemberMutation.isPending}
                                  >
                                    <UserMinus size={16} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>

                  <div className="pt-4">
                    {availableMembers.length > 0 ? (
                      <Select
                        label="Add Team Member"
                        placeholder="Select a member to add"
                        className="max-w-xs"
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string;
                          if (selectedKey) {
                            handleAddMember(selectedKey);
                          }
                        }}
                      >
                        {availableMembers.map((member) => (
                          <SelectItem
                            key={member.user.id}
                            textValue={`${member.user.firstName} ${member.user.lastName}`}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar
                                src={member.user.avatar || undefined}
                                name={`${member.user.firstName} ${member.user.lastName}`}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium">
                                  {member.user.firstName} {member.user.lastName}
                                </p>
                                <p className="text-sm text-default-500">
                                  {member.user.email}
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-default-500">
                          All organization members are already part of this
                          team.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Tab>

              <Tab
                key="boards"
                title={
                  <div className="flex items-center gap-2">
                    <Kanban size={16} />
                    <span>Board Access</span>
                  </div>
                }
              >
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Board Access</h3>
                    <Chip size="sm" variant="flat">
                      {team.boardAccess.length} board
                      {team.boardAccess.length !== 1 ? "s" : ""}
                    </Chip>
                  </div>

                  <p className="text-sm text-default-500">
                    Manage which boards this team has access to. Team members
                    will inherit these board permissions.
                  </p>

                  {/* Current Board Access */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Current Access</h4>
                    {team.boardAccess.length > 0 ? (
                      <div className="space-y-2">
                        {team.boardAccess.map((access) => (
                          <Card key={access.id} className="bg-default-50">
                            <CardBody className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{
                                      backgroundColor: access.board.color,
                                    }}
                                  />
                                  <div>
                                    <p className="font-medium">
                                      {access.board.title}
                                    </p>
                                    {access.board.description && (
                                      <p className="text-sm text-default-500 line-clamp-1">
                                        {access.board.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="light"
                                  color="danger"
                                  isIconOnly
                                  title="Remove Board Access"
                                  onPress={() =>
                                    handleRemoveBoard(access.board.id)
                                  }
                                  isLoading={removeBoardMutation.isPending}
                                >
                                  <UserMinus size={16} />
                                </Button>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-default-500">
                          This team doesn&apos;t have access to any boards yet.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Add Board Access */}
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Add Board Access</h4>
                    {availableBoards.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-default-500">
                          Select boards to grant access to this team:
                        </p>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {availableBoards.map((board) => (
                            <Card
                              key={board.id}
                              className="cursor-pointer transition-colors hover:bg-default-50"
                              isPressable
                              onPress={() => handleAssignBoards([board.id])}
                            >
                              <CardBody className="p-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: board.color }}
                                  />
                                  <div>
                                    <p className="font-medium">{board.title}</p>
                                    {board.description && (
                                      <p className="text-sm text-default-500 line-clamp-1">
                                        {board.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-default-500">
                          All available boards are already assigned to this
                          team.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Tab>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={updateTeamMutation.isPending}
              isDisabled={!isDirty}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

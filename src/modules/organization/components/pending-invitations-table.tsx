import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Spinner,
  Tooltip,
} from "@heroui/react";
import { Trash, Clock } from "@phosphor-icons/react";

import { useOrganizationInvitations, useRevokeInvitation } from "../api";
import { getRoleColor } from "../validations";
import { RevokeInvitationModal } from "./revoke-invitation-modal";

import type { OrganizationInvitation } from "../types";

interface PendingInvitationsTableProps {
  organizationId: string;
}

export const PendingInvitationsTable: React.FC<
  PendingInvitationsTableProps
> = ({ organizationId }) => {
  const [selectedInvitation, setSelectedInvitation] =
    React.useState<OrganizationInvitation | null>(null);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = React.useState(false);

  const { data: invitationsResponse, isLoading } =
    useOrganizationInvitations(organizationId);
  const revokeInvitationMutation = useRevokeInvitation();

  const invitations = invitationsResponse?.invitations || [];

  const handleOpenRevokeModal = (invitation: OrganizationInvitation) => {
    setSelectedInvitation(invitation);
    setIsRevokeModalOpen(true);
  };

  const handleCloseRevokeModal = () => {
    setSelectedInvitation(null);
    setIsRevokeModalOpen(false);
  };

  const handleConfirmRevoke = async () => {
    if (selectedInvitation) {
      await revokeInvitationMutation.mutateAsync({
        organizationId,
        invitationId: selectedInvitation.id,
      });
      handleCloseRevokeModal();
    }
  };

  const formatExpirationDate = (expiresAt: string) => {
    const date = new Date(expiresAt);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Expired", color: "danger" };
    } else if (diffDays === 0) {
      return { text: "Expires today", color: "warning" };
    } else if (diffDays === 1) {
      return { text: "Expires tomorrow", color: "warning" };
    } else {
      return { text: `${diffDays} days left`, color: "success" };
    }
  };

  return (
    <Card>
      <CardHeader>
        <h4 className="text-md font-semibold">
          Pending Invitations ({invitations.length})
        </h4>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto text-default-300 mb-4" size={48} />
            <h4 className="text-lg font-semibold mb-2">
              No Pending Invitations
            </h4>
            <p className="text-default-500">
              All invitations have been accepted or expired.
            </p>
          </div>
        ) : (
          <Table aria-label="Pending invitations">
            <TableHeader>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>INVITED BY</TableColumn>
              <TableColumn>EXPIRES</TableColumn>
              <TableColumn width={100}>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => {
                const expiration = formatExpirationDate(invitation.expiresAt);

                return (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-xs text-default-500">
                          Invited{" "}
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getRoleColor(invitation.role) as any}
                        size="sm"
                        variant="flat"
                      >
                        {invitation.role}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {invitation.invitedBy.firstName}{" "}
                        {invitation.invitedBy.lastName}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={expiration.color as any}
                        size="sm"
                        variant="flat"
                      >
                        {expiration.text}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Tooltip content="Revoke invitation">
                        <Button
                          isIconOnly
                          aria-label="Revoke invitation"
                          color="danger"
                          isLoading={
                            revokeInvitationMutation.isPending &&
                            revokeInvitationMutation.variables?.invitationId ===
                              invitation.id
                          }
                          size="sm"
                          variant="light"
                          onPress={() => handleOpenRevokeModal(invitation)}
                        >
                          <Trash size={16} />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardBody>
      <RevokeInvitationModal
        isOpen={isRevokeModalOpen}
        onClose={handleCloseRevokeModal}
        invitation={selectedInvitation}
        onConfirm={handleConfirmRevoke}
        isLoading={revokeInvitationMutation.isPending}
      />
    </Card>
  );
};

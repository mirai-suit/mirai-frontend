import type { OrganizationMember } from "../types";

import React from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@heroui/react";
import {
  Plus,
  DotsThree,
  Crown,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";

import {
  useOrganizationMembers,
  useRemoveMember,
  useChangeMemberRole,
} from "../api";
import { getRoleColor } from "../validations";

import { InviteMemberModal } from "./invite-member-modal";
import { PendingInvitationsTable } from "./pending-invitations-table";
import { EditRoleModal } from "./edit-role-modal";
import { RemoveMemberModal } from "./remove-member-modal";

import { useAuthStore } from "@/modules/auth/store";

interface MembersManagementProps {
  organizationId: string;
}

export const MembersManagement: React.FC<MembersManagementProps> = ({
  organizationId,
}) => {
  const { user } = useAuthStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = React.useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] =
    React.useState(false);
  const [selectedMember, setSelectedMember] =
    React.useState<OrganizationMember | null>(null);

  // API hooks
  const { data: membersResponse, isLoading: loadingMembers } =
    useOrganizationMembers(organizationId);
  const removeMemberMutation = useRemoveMember();
  const changeMemberRoleMutation = useChangeMemberRole();

  const members = membersResponse?.members || [];
  const currentUserMember = members.find(
    (member) => member.user.id === user?.id
  );
  const isCurrentUserAdmin = currentUserMember?.role === "ADMIN";

  // Modal handlers
  const handleOpenEditRoleModal = (member: OrganizationMember) => {
    setSelectedMember(member);
    setIsEditRoleModalOpen(true);
  };

  const handleCloseEditRoleModal = () => {
    setSelectedMember(null);
    setIsEditRoleModalOpen(false);
  };

  const handleOpenRemoveMemberModal = (member: OrganizationMember) => {
    setSelectedMember(member);
    setIsRemoveMemberModalOpen(true);
  };

  const handleCloseRemoveMemberModal = () => {
    setSelectedMember(null);
    setIsRemoveMemberModalOpen(false);
  };

  const handleConfirmEditRole = async (newRole: string) => {
    if (selectedMember) {
      await changeMemberRoleMutation.mutateAsync({
        organizationId,
        userId: selectedMember.user.id,
        role: newRole,
      });
      handleCloseEditRoleModal();
    }
  };

  const handleConfirmRemoveMember = async () => {
    if (selectedMember) {
      await removeMemberMutation.mutateAsync({
        organizationId,
        userId: selectedMember.user.id,
      });
      handleCloseRemoveMemberModal();
    }
  };

  const canManageMember = (member: OrganizationMember) => {
    // Can't manage yourself
    if (member.user.id === user?.id) return false;
    // Only admins can manage other members
    if (!isCurrentUserAdmin) return false;

    // Can't remove the organization creator (if they're admin)
    // This would need creator info from the organization data
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold mb-2">Members Management</h3>
          <p className="text-default-500">
            Manage organization members, roles, and invitations.
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={() => setIsInviteModalOpen(true)}
        >
          Invite Member
        </Button>
      </div>

      {/* Current Members */}
      <Card>
        <CardHeader>
          <h4 className="text-md font-semibold">
            Current Members ({members.length})
          </h4>
        </CardHeader>
        <CardBody>
          {loadingMembers ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <Table aria-label="Organization members">
              <TableHeader>
                <TableColumn>MEMBER</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>JOINED</TableColumn>
                <TableColumn width={100}>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${member.user.firstName} ${member.user.lastName}`}
                          size="sm"
                          src={member.user.avatar}
                        />
                        <div>
                          <p className="font-medium">
                            {member.user.firstName} {member.user.lastName}
                            {member.user.id === user?.id && (
                              <span className="text-xs text-default-500 ml-2">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-default-500">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getRoleColor(member.role) as any}
                        size="sm"
                        startContent={
                          member.role === "ADMIN" ? (
                            <Crown size={14} />
                          ) : undefined
                        }
                        variant="flat"
                      >
                        {member.role}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      {canManageMember(member) && (
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              aria-label="Member actions"
                              size="sm"
                              variant="light"
                            >
                              <DotsThree size={18} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Member actions">
                            <DropdownItem
                              key="change-role"
                              startContent={<PencilSimple size={16} />}
                              onPress={() => handleOpenEditRoleModal(member)}
                            >
                              Change Role
                            </DropdownItem>
                            <DropdownItem
                              key="remove"
                              color="danger"
                              startContent={<Trash size={16} />}
                              onPress={() =>
                                handleOpenRemoveMemberModal(member)
                              }
                            >
                              Remove Member
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Divider />

      {/* Pending Invitations */}
      <PendingInvitationsTable organizationId={organizationId} />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        organizationId={organizationId}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Edit Role Modal */}
      <EditRoleModal
        isOpen={isEditRoleModalOpen}
        member={selectedMember}
        onClose={handleCloseEditRoleModal}
        onConfirm={handleConfirmEditRole}
        isLoading={changeMemberRoleMutation.isPending}
      />

      {/* Remove Member Modal */}
      <RemoveMemberModal
        isOpen={isRemoveMemberModalOpen}
        member={selectedMember}
        onClose={handleCloseRemoveMemberModal}
        onConfirm={handleConfirmRemoveMember}
        isLoading={removeMemberMutation.isPending}
      />
    </div>
  );
};

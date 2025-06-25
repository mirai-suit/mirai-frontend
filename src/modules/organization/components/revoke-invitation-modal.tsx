import type { OrganizationInvitation } from "@/modules/organization/types";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
} from "@heroui/react";
import { Warning, Trash } from "@phosphor-icons/react";

import { getRoleColor } from "../validations";

interface RevokeInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: OrganizationInvitation | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const RevokeInvitationModal: React.FC<RevokeInvitationModalProps> = ({
  isOpen,
  onClose,
  invitation,
  onConfirm,
  isLoading = false,
}) => {
  if (!invitation) return null;

  const formatExpirationDate = (expiresAt: string) => {
    const date = new Date(expiresAt);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `${diffDays} days left`;
  };

  return (
    <Modal backdrop="blur" isOpen={isOpen} placement="center" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-danger/10 rounded-full">
              <Warning className="text-danger" size={20} />
            </div>
            <span>Revoke Invitation</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-default-600">
              Are you sure you want to revoke this invitation? This action
              cannot be undone.
            </p>

            <div className="bg-default-50 dark:bg-default-100 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-default-500">Email:</span>
                <span className="font-medium">{invitation.email}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-default-500">Role:</span>
                <Chip
                  color={getRoleColor(invitation.role) as any}
                  size="sm"
                  variant="flat"
                >
                  {invitation.role}
                </Chip>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-default-500">Invited by:</span>
                <span className="text-sm">
                  {invitation.invitedBy.firstName}{" "}
                  {invitation.invitedBy.lastName}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-default-500">Expires:</span>
                <span className="text-sm">
                  {formatExpirationDate(invitation.expiresAt)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-default-500">Invited on:</span>
                <span className="text-sm">
                  {new Date(invitation.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="bg-danger/5 border border-danger/20 rounded-lg p-3">
              <p className="text-sm text-danger">
                <strong>Warning:</strong> The invited user will no longer be
                able to use their invitation link to join the organization.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            startContent={!isLoading && <Trash size={16} />}
            isLoading={isLoading}
            onPress={onConfirm}
          >
            {isLoading ? "Revoking..." : "Revoke Invitation"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

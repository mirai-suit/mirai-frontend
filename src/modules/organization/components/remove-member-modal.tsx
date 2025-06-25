import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Chip,
} from "@heroui/react";
import { Trash, Warning } from "@phosphor-icons/react";

import { getRoleColor } from "../validations";

import type { OrganizationMember } from "@/modules/organization/types";

interface RemoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: OrganizationMember | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const RemoveMemberModal: React.FC<RemoveMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onConfirm,
  isLoading = false,
}) => {
  if (!member) return null;

  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      placement="center"
      size="md"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-danger/10 rounded-full">
              <Warning className="text-danger" size={20} />
            </div>
            <span>Remove Member</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-default-600">
              Are you sure you want to remove this member from the organization?
              This action cannot be undone.
            </p>

            {/* Member Info */}
            <div className="bg-default-50 dark:bg-default-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar
                  className="flex-shrink-0"
                  name={`${member.user.firstName} ${member.user.lastName}`}
                  size="md"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {member.user.firstName} {member.user.lastName}
                  </h4>
                  <p className="text-sm text-default-500">
                    {member.user.email}
                  </p>
                </div>
                <Chip
                  color={getRoleColor(member.role) as any}
                  size="sm"
                  variant="flat"
                >
                  {member.role}
                </Chip>
              </div>

              <div className="text-xs text-default-500 space-y-1">
                <p>Joined: {new Date(member.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-danger/5 border border-danger/20 rounded-lg p-3">
              <p className="text-sm text-danger">
                <strong>Warning:</strong> This member will lose access to all
                organization resources, boards, and projects immediately.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={isLoading} variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="danger"
            isLoading={isLoading}
            startContent={!isLoading && <Trash size={16} />}
            onPress={onConfirm}
          >
            {isLoading ? "Removing..." : "Remove Member"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

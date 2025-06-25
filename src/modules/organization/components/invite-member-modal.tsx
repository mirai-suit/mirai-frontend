import type { SendInvitationInput } from "../validations";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "@phosphor-icons/react";

import { useSendInvitation } from "../api";
import {
  sendInvitationSchema,
  organizationRoles,
  getRoleDescription,
} from "../validations";

import { useOrgStore } from "@/store/useOrgStore";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  organizationId,
}) => {
  const { currentUserRole } = useOrgStore();
  const sendInvitationMutation = useSendInvitation();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<SendInvitationInput>({
    resolver: zodResolver(sendInvitationSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
    mode: "onChange",
  });

  const selectedRole = watch("role");

  // Filter available roles based on current user's role
  const availableRoles = React.useMemo(() => {
    if (currentUserRole === "ADMIN") {
      return organizationRoles;
    } else {
      // Non-admins can only invite members
      return organizationRoles.filter((role) => role.value === "MEMBER");
    }
  }, [currentUserRole]);

  const onSubmit = async (data: SendInvitationInput) => {
    try {
      await sendInvitationMutation.mutateAsync({
        organizationId,
        ...data,
      });

      // Close modal and reset form
      onClose();
      reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Modal isOpen={isOpen} size="lg" onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <UserPlus size={20} />
              <span>Invite Member</span>
            </div>
            <p className="text-sm text-default-500 font-normal">
              Send an invitation to join your organization
            </p>
          </ModalHeader>

          <ModalBody className="gap-4">
            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  errorMessage={errors.email?.message}
                  isInvalid={!!errors.email}
                  label="Email Address"
                  placeholder="Enter email address"
                  variant="flat"
                />
              )}
            />

            {/* Role Selection */}
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  {...field}
                  errorMessage={errors.role?.message}
                  isInvalid={!!errors.role}
                  label="Role"
                  placeholder="Select a role"
                  selectedKeys={field.value ? [field.value] : []}
                  variant="flat"
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;

                    field.onChange(value);
                  }}
                >
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value}>{role.label}</SelectItem>
                  ))}
                </Select>
              )}
            />

            {/* Role Description */}
            {selectedRole && (
              <div className="p-3 bg-default-50 rounded-lg">
                <p className="text-sm text-default-600">
                  <strong>{selectedRole} Role:</strong>{" "}
                  {getRoleDescription(selectedRole)}
                </p>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!isValid}
              isLoading={sendInvitationMutation.isPending}
              type="submit"
            >
              Send Invitation
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

import type { OrganizationMember } from "@/modules/organization/types";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Chip,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Crown } from "@phosphor-icons/react";
import { z } from "zod";

import {
  getRoleColor,
  organizationRoles,
  getRoleDescription,
} from "../validations";

import { useOrgStore } from "@/store/useOrgStore";
import Avatar from "boring-avatars";
import { siteConfig } from "@/config/site";

const editRoleSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "MEMBER"]),
});

type EditRoleFormData = z.infer<typeof editRoleSchema>;

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: OrganizationMember | null;
  onConfirm: (role: string) => void;
  isLoading?: boolean;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  onClose,
  member,
  onConfirm,
  isLoading = false,
}) => {
  const { currentUserRole } = useOrgStore();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditRoleFormData>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      role: "MEMBER",
    },
  });

  const selectedRole = watch("role");

  React.useEffect(() => {
    if (member && isOpen) {
      reset({ role: member.role });
    }
  }, [member, reset, isOpen]);

  const onSubmit = (data: EditRoleFormData) => {
    onConfirm(data.role);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!member) return null;

  // Get available roles based on current user's permissions
  const getAvailableRoles = () => {
    const roleOptions = organizationRoles.map((roleOption) => ({
      value: roleOption.value,
      label: roleOption.label,
      description: getRoleDescription(roleOption.value),
    }));

    // Admins can assign any role
    if (currentUserRole === "ADMIN") {
      return roleOptions;
    }

    // Editors can only assign MEMBER role
    if (currentUserRole === "EDITOR") {
      return roleOptions.filter((roleOption) => roleOption.value === "MEMBER");
    }

    // Members cannot change roles
    return [];
  };

  const availableRoles = getAvailableRoles();

  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      placement="center"
      size="md"
      onClose={handleClose}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Crown className="text-primary" size={20} />
              </div>
              <span>Edit Member Role</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Member Info */}
              <div className="bg-default-50 dark:bg-default-100 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={`${member.user.firstName} ${member.user.lastName}`}
                    size={40}
                    variant="beam"
                    colors={siteConfig.avatarColors?.beam}
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
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="edit-role-select"
                >
                  New Role
                </label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      {...field}
                      errorMessage={errors.role?.message}
                      id="edit-role-select"
                      isInvalid={!!errors.role}
                      label="Select new role"
                      placeholder="Choose a role"
                      selectedKeys={field.value ? [field.value] : []}
                      startContent={<Users size={16} />}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;

                        field.onChange(selectedKey);
                      }}
                    >
                      {availableRoles.map((roleOption) => (
                        <SelectItem key={roleOption.value}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <p className="font-medium">{roleOption.label}</p>
                              <p className="text-xs text-default-500">
                                {roleOption.description}
                              </p>
                            </div>
                            <Chip
                              color={getRoleColor(roleOption.value) as any}
                              size="sm"
                              variant="flat"
                            >
                              {roleOption.value}
                            </Chip>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </div>

              {/* Role Change Warning */}
              {selectedRole !== member.role && (
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                  <p className="text-sm text-warning">
                    <strong>Note:</strong> Changing this member&#39;s role will
                    immediately update their permissions in the organization.
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={isLoading}
              variant="light"
              onPress={handleClose}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={selectedRole === member.role}
              isLoading={isLoading}
              type="submit"
            >
              {isLoading ? "Updating..." : "Update Role"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

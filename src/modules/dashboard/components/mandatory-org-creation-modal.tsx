import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  addToast,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building } from "@phosphor-icons/react";

import { useCreateOrganization } from "../api";
import {
  createOrganizationSchema,
  CreateOrganizationInput,
} from "../validations";

import { useAuthStore } from "@/modules/auth/store";

interface MandatoryOrgCreationModalProps {
  isOpen: boolean;
  onOrgCreated: () => void;
}

export const MandatoryOrgCreationModal: React.FC<
  MandatoryOrgCreationModalProps
> = ({ isOpen, onOrgCreated }) => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const createOrganizationMutation = useCreateOrganization();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleCreateOrganization = async (data: CreateOrganizationInput) => {
    try {
      await createOrganizationMutation.mutateAsync(data);

      // Update user's organization count in store
      if (user) {
        setUser({
          ...user,
          organizationCount: (user.organizationCount || 0) + 1,
        });
      }

      addToast({
        title: "Organization Created",
        description: `Welcome to ${data.name}! You can now start using the dashboard.`,
        color: "success",
      });

      reset();
      onOrgCreated();
    } catch {
      addToast({
        title: "Creation Failed",
        description: "Failed to create organization. Please try again.",
        color: "danger",
      });
    }
  };

  return (
    <Modal
      hideCloseButton
      classNames={{
        backdrop: "bg-overlay/50 backdrop-opacity-disabled",
        wrapper: "z-[999]",
      }}
      isDismissable={false}
      isOpen={isOpen}
      size="md"
    >
      <ModalContent>
        <form onSubmit={handleSubmit(handleCreateOrganization)}>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Building className="text-primary" size={24} />
              <span>Create Your Organization</span>
            </div>
            <p className="text-sm text-default-500 font-normal">
              Welcome! To get started, please create your first organization.
            </p>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-primary">
                  <strong>Why do I need an organization?</strong>
                </p>
                <p className="text-sm text-default-600 mt-1">
                  Organizations help you manage your projects, teams, and
                  workflows. You can always create more organizations later.
                </p>
              </div>

              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    errorMessage={errors.name?.message}
                    isInvalid={!!errors.name}
                    label="Organization Name"
                    placeholder="Enter your organization name"
                    size="lg"
                    variant="flat"
                  />
                )}
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              className="w-full"
              color="primary"
              isDisabled={createOrganizationMutation.isPending}
              isLoading={createOrganizationMutation.isPending}
              size="lg"
              type="submit"
            >
              {createOrganizationMutation.isPending
                ? "Creating Organization..."
                : "Create Organization"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

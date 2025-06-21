import React from "react";
import {
  Select,
  SelectItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  addToast,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "@phosphor-icons/react";

import { useCreateOrganization } from "../api";
import {
  createOrganizationSchema,
  CreateOrganizationInput,
} from "../validations";

import { Organization } from "@/modules/dashboard/types";

interface OrganizationSelectorProps {
  organizations: Organization[];
  selectedOrg: string;
  onOrgChange: (orgId: string) => void;
}

type OrgOption =
  | Organization
  | { id: "create-new"; name: string; avatar?: string };

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  organizations,
  selectedOrg,
  onOrgChange,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const handleSelectionChange = (value: string) => {
    if (value === "create-new") {
      onOpen();
    } else {
      onOrgChange(value);
    }
  };

  const handleCreateOrg = async (data: CreateOrganizationInput) => {
    try {
      const newOrg = await createOrganizationMutation.mutateAsync(data);

      addToast({
        title: "Organization Created",
        description: `${data.name} has been created successfully!`,
        color: "success",
      });

      // Select the newly created organization
      onOrgChange(newOrg.id);

      onClose();
      reset();
    } catch {
      addToast({
        title: "Creation Failed",
        description: "Failed to create organization. Please try again.",
        color: "danger",
      });
    }
  };

  const orgOptions: OrgOption[] = [
    ...organizations,
    { id: "create-new", name: "Create New Organization" },
  ];

  return (
    <>
      <Select
        aria-label="Select organization"
        classNames={{ trigger: "h-12" }}
        items={orgOptions}
        label="Organization"
        selectedKeys={[selectedOrg]}
        onChange={(e) => handleSelectionChange(e.target.value)}
      >
        {(org) => (
          <SelectItem
            key={org.id}
            className={org.id === "create-new" ? "text-success" : undefined}
            startContent={
              org.id === "create-new" ? (
                <Plus className="text-success mr-1" size={16} />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium mr-1">
                  {org.name.charAt(0)}
                </div>
              )
            }
          >
            {org.name}
          </SelectItem>
        )}
      </Select>

      {/* Create New Organization Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <form onSubmit={handleSubmit(handleCreateOrg)}>
            <ModalHeader>Create New Organization</ModalHeader>
            <ModalBody>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    errorMessage={errors.name?.message}
                    isInvalid={!!errors.name}
                    label="Organization Name"
                    placeholder="Enter organization name"
                    variant="bordered"
                  />
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isDisabled={createOrganizationMutation.isPending}
                isLoading={createOrganizationMutation.isPending}
                type="submit"
              >
                {createOrganizationMutation.isPending
                  ? "Creating..."
                  : "Create Organization"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

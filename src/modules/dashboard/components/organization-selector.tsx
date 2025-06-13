import React from "react";
import {
  Select,
  SelectItem,
  Avatar,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@heroui/react";
import { Plus } from "@phosphor-icons/react";
import { Organization } from "../types/sidebar.type";

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
  const [newOrgName, setNewOrgName] = React.useState("");

  const handleSelectionChange = (value: string) => {
    if (value === "create-new") {
      onOpen();
    } else {
      onOrgChange(value);
    }
  };

  const handleCreateOrg = () => {
    if (newOrgName.trim()) {
      console.log("Creating new organization:", newOrgName);
      // In a real app, you would create the org and then select it
      onClose();
      setNewOrgName("");
    }
  };

  const orgOptions: OrgOption[] = [
    ...organizations,
    { id: "create-new", name: "Create New Organization" },
  ];

  return (
    <>
      <Select
        label="Organization"
        selectedKeys={[selectedOrg]}
        classNames={{ trigger: "h-12" }}
        onChange={(e) => handleSelectionChange(e.target.value)}
        aria-label="Select organization"
        items={orgOptions}
      >
        {(org) => (
          <SelectItem
            key={org.id}
            //   value={org.id}
            startContent={
              org.id === "create-new" ? (
                <Plus size={16} className="text-success mr-1" />
              ) : org.avatar ? (
                <Avatar
                  src={org.avatar}
                  name={org.name.charAt(0)}
                  size="sm"
                  className="mr-1"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium mr-1">
                  {org.name.charAt(0)}
                </div>
              )
            }
            className={org.id === "create-new" ? "text-success" : undefined}
          >
            {org.name}
          </SelectItem>
        )}
      </Select>

      {/* Create New Organization Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Create New Organization</ModalHeader>
          <ModalBody>
            <Input
              autoFocus
              label="Organization Name"
              placeholder="Enter organization name"
              value={newOrgName}
              onValueChange={setNewOrgName}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreateOrg}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

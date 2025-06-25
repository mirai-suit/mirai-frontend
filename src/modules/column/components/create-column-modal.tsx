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

import { createColumnSchema, CreateColumnForm } from "../validations";
import { useCreateColumn } from "../api";
import { COLUMN_COLORS } from "../types";

import { WithPermission } from "@/components/role-based-access";

interface CreateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export const CreateColumnModal: React.FC<CreateColumnModalProps> = ({
  isOpen,
  onClose,
  boardId,
}) => {
  const createColumnMutation = useCreateColumn();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateColumnForm>({
    resolver: zodResolver(createColumnSchema),
    defaultValues: {
      name: "",
      boardId,
      color: "#6B7280",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: CreateColumnForm) => {
    try {
      await createColumnMutation.mutateAsync({
        ...data,
        boardId,
      });
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} placement="center">
      <ModalContent>
        <WithPermission
          permission="createBoards"
          fallback={
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-sm text-default-500">
                You don&apos;t have permission to create columns in this
                organization.
              </p>
            </div>
          }
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">
              Create New Column
            </ModalHeader>
            <ModalBody>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Column Name"
                    placeholder="Enter column name"
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                    variant="bordered"
                  />
                )}
              />

              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Column Color"
                    placeholder="Select a color"
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      field.onChange(selectedKey);
                    }}
                    variant="bordered"
                    renderValue={() => {
                      const selectedColor = COLUMN_COLORS.find(
                        (color) => color.value === field.value
                      );
                      return selectedColor ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: selectedColor.value }}
                          />
                          <span>{selectedColor.name}</span>
                        </div>
                      ) : null;
                    }}
                  >
                    {COLUMN_COLORS.map((color) => (
                      <SelectItem key={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={createColumnMutation.isPending}
                isDisabled={!isValid}
              >
                Create Column
              </Button>
            </ModalFooter>
          </form>
        </WithPermission>
      </ModalContent>
    </Modal>
  );
};

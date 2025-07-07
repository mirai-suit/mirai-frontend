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

import { WithBoardPermission } from "@/components/board-permission-components";

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
    <Modal isOpen={isOpen} placement="center" onClose={handleClose}>
      <ModalContent>
        <WithBoardPermission
          fallback={
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-sm text-default-500">
                You don&apos;t have permission to create columns in this board.
              </p>
            </div>
          }
          permission="canManageColumns"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">
              Create New Column
            </ModalHeader>
            <ModalBody>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    errorMessage={errors.name?.message}
                    isInvalid={!!errors.name}
                    label="Column Name"
                    placeholder="Enter column name"
                    variant="bordered"
                  />
                )}
              />

              <Controller
                control={control}
                name="color"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Column Color"
                    placeholder="Select a color"
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
                    selectedKeys={field.value ? [field.value] : []}
                    variant="bordered"
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;

                      field.onChange(selectedKey);
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
                isDisabled={!isValid}
                isLoading={createColumnMutation.isPending}
                type="submit"
              >
                Create Column
              </Button>
            </ModalFooter>
          </form>
        </WithBoardPermission>
      </ModalContent>
    </Modal>
  );
};

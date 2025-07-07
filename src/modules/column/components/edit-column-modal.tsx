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
  Divider,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateColumnSchema, UpdateColumnForm } from "../validations";
import { useUpdateColumn, useDeleteColumn } from "../api";
import { COLUMN_COLORS, Column } from "../types";

import { WithBoardPermission } from "@/components/board-permission-components";

interface EditColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  column: Column | null;
}

export const EditColumnModal: React.FC<EditColumnModalProps> = ({
  isOpen,
  onClose,
  column,
}) => {
  const updateColumnMutation = useUpdateColumn();
  const deleteColumnMutation = useDeleteColumn();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<UpdateColumnForm>({
    resolver: zodResolver(updateColumnSchema),
    defaultValues: {
      columnId: column?.id || "",
      name: column?.name || "",
      color: column?.color || "#6B7280",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (column) {
      reset({
        columnId: column.id,
        name: column.name,
        color: column.color,
      });
    }
  }, [column, reset]);

  const onSubmit = async (data: UpdateColumnForm) => {
    try {
      const updateData: any = { columnId: data.columnId };

      if (data.name !== column?.name) {
        updateData.name = data.name;
      }

      if (data.color !== column?.color) {
        updateData.color = data.color;
      }

      await updateColumnMutation.mutateAsync(updateData);
      onClose();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleDelete = async () => {
    if (!column) return;

    try {
      await deleteColumnMutation.mutateAsync(column.id);
      onClose();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!column) return null;

  return (
    <Modal isOpen={isOpen} placement="center" onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1">Edit Column</ModalHeader>
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
                  renderValue={(_items) => {
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

            <Divider className="my-4" />

            <div className="bg-danger-50 p-4 rounded-lg border border-danger-200">
              <h4 className="text-danger-700 font-semibold mb-2">
                Danger Zone
              </h4>
              <p className="text-danger-600 text-sm mb-3">
                Deleting this column will permanently remove it and all its
                tasks. This action cannot be undone.
              </p>
              <WithBoardPermission
                fallback={
                  <Button isDisabled color="danger" size="sm" variant="flat">
                    Delete Column (No permission)
                  </Button>
                }
                permission="canManageColumns"
              >
                <Button
                  color="danger"
                  isLoading={deleteColumnMutation.isPending}
                  size="sm"
                  variant="flat"
                  onPress={handleDelete}
                >
                  Delete Column
                </Button>
              </WithBoardPermission>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!isValid || !isDirty}
              isLoading={updateColumnMutation.isPending}
              type="submit"
            >
              Update Column
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

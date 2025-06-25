import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  updateBoardSchema,
  UpdateBoardInput,
  BOARD_COLORS,
} from "../validations";
import { useUpdateBoard } from "../api";
import { Board } from "../types";

interface EditBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board | null;
}

export const EditBoardModal: React.FC<EditBoardModalProps> = ({
  isOpen,
  onClose,
  board,
}) => {
  const updateBoardMutation = useUpdateBoard();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateBoardInput>({
    resolver: zodResolver(updateBoardSchema),
    defaultValues: {
      title: board?.title || "",
      description: board?.description || "",
      color: board?.color || "#3B82F6",
      coverImage: board?.coverImage || "",
    },
  });

  React.useEffect(() => {
    if (board) {
      reset({
        title: board.title,
        description: board.description || "",
        color: board.color,
        coverImage: board.coverImage || "",
      });
    }
  }, [board, reset]);

  const onSubmit = async (data: UpdateBoardInput) => {
    if (!board) return;

    try {
      // Only send fields that have changed
      const updateData: UpdateBoardInput = {};

      if (data.title !== board.title) {
        updateData.title = data.title;
      }

      if (data.description !== board.description) {
        updateData.description = data.description;
      }

      if (data.color !== board.color) {
        updateData.color = data.color;
      }

      if (data.coverImage !== board.coverImage) {
        updateData.coverImage = data.coverImage;
      }

      await updateBoardMutation.mutateAsync({
        boardId: board.id,
        updateData,
      });

      onClose();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!board) return null;

  return (
    <Modal isOpen={isOpen} placement="center" onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1">Edit Board</ModalHeader>
          <ModalBody>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Input
                  {...field}
                  errorMessage={errors.title?.message}
                  isInvalid={!!errors.title}
                  label="Board Title"
                  placeholder="Enter board title"
                  variant="bordered"
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Textarea
                  {...field}
                  errorMessage={errors.description?.message}
                  isInvalid={!!errors.description}
                  label="Description"
                  placeholder="Enter board description (optional)"
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
                  label="Board Color"
                  placeholder="Select a color"
                  renderValue={(_items) => {
                    const selectedColor = field.value;

                    return selectedColor ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: selectedColor }}
                        />
                        <span>
                          {selectedColor === "#3B82F6" && "Blue"}
                          {selectedColor === "#10B981" && "Green"}
                          {selectedColor === "#F59E0B" && "Yellow"}
                          {selectedColor === "#EF4444" && "Red"}
                          {selectedColor === "#8B5CF6" && "Purple"}
                          {selectedColor === "#F97316" && "Orange"}
                          {selectedColor === "#06B6D4" && "Cyan"}
                          {selectedColor === "#84CC16" && "Lime"}
                          {selectedColor === "#EC4899" && "Pink"}
                          {selectedColor === "#6B7280" && "Gray"}
                        </span>
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
                  {BOARD_COLORS.map((color) => (
                    <SelectItem key={color}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span>
                          {color === "#3B82F6" && "Blue"}
                          {color === "#10B981" && "Green"}
                          {color === "#F59E0B" && "Yellow"}
                          {color === "#EF4444" && "Red"}
                          {color === "#8B5CF6" && "Purple"}
                          {color === "#F97316" && "Orange"}
                          {color === "#06B6D4" && "Cyan"}
                          {color === "#84CC16" && "Lime"}
                          {color === "#EC4899" && "Pink"}
                          {color === "#6B7280" && "Gray"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              control={control}
              name="coverImage"
              render={({ field }) => (
                <Input
                  {...field}
                  errorMessage={errors.coverImage?.message}
                  isInvalid={!!errors.coverImage}
                  label="Cover Image URL"
                  placeholder="Enter cover image URL (optional)"
                  variant="bordered"
                />
              )}
            />
          </ModalBody>

          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              //   isDisabled={}
              isLoading={updateBoardMutation.isPending}
              type="submit"
            >
              Update Board
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

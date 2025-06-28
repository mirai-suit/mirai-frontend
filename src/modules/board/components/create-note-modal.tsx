import type { CreateNoteInput } from "../validations/note";

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

import { createNoteSchema } from "../validations/note";
import { useCreateNote } from "../api/note";

interface CreateNoteModalProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

const NOTE_CATEGORIES = [
  { key: "GENERAL", label: "General" },
  { key: "MEETING_NOTES", label: "Meeting Notes" },
  { key: "IDEAS", label: "Ideas" },
  { key: "DOCUMENTATION", label: "Documentation" },
  { key: "REMINDERS", label: "Reminders" },
];

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  boardId,
  isOpen,
  onClose,
}) => {
  const createNoteMutation = useCreateNote();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateNoteInput>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "GENERAL",
      isPinned: false,
    },
  });

  const onSubmit = (data: CreateNoteInput) => {
    createNoteMutation.mutate(
      { boardId, noteData: data },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create Note</ModalHeader>
          <ModalBody className="space-y-4">
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Input
                  {...field}
                  errorMessage={errors.title?.message}
                  isInvalid={!!errors.title}
                  label="Title"
                  placeholder="Enter note title"
                  variant="bordered"
                />
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  {...field}
                  label="Category"
                  placeholder="Select category"
                  selectedKeys={field.value ? [field.value] : []}
                  variant="flat"
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;

                    field.onChange(value);
                  }}
                >
                  {NOTE_CATEGORIES.map((category) => (
                    <SelectItem key={category.key}>{category.label}</SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <Textarea
                  {...field}
                  errorMessage={errors.content?.message}
                  isInvalid={!!errors.content}
                  label="Content"
                  minRows={6}
                  placeholder="Write your note content..."
                  variant="flat"
                />
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!isValid}
              isLoading={createNoteMutation.isPending}
              type="submit"
            >
              Create Note
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

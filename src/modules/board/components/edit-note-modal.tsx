import type { Note } from "../types/note";

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
  Switch,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CreateNoteInput, createNoteSchema } from "../validations/note";
import { useUpdateNote } from "../api/note";

interface EditNoteModalProps {
  note: Note;
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

export const EditNoteModal: React.FC<EditNoteModalProps> = ({
  note,
  isOpen,
  onClose,
}) => {
  const updateNoteMutation = useUpdateNote();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<CreateNoteInput>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: note.title,
      content: note.content,
      category: note.category,
      isPinned: note.isPinned,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        title: note.title,
        content: note.content,
        category: note.category,
        isPinned: note.isPinned,
      });
    }
  }, [isOpen, note, reset]);

  const onSubmit = (data: CreateNoteInput) => {
    updateNoteMutation.mutate(
      { noteId: note.id, updateData: data },
      {
        onSuccess: () => {
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
          <ModalHeader>Edit Note</ModalHeader>
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

            <Controller
              control={control}
              name="isPinned"
              render={({ field }) => (
                <Switch isSelected={field.value} onValueChange={field.onChange}>
                  Pin this note
                </Switch>
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!isValid || !isDirty}
              isLoading={updateNoteMutation.isPending}
              type="submit"
            >
              Update Note
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

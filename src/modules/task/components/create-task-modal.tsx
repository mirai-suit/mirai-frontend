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
  createTaskFormSchema,
  type CreateTaskFormInput,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "../validations";
import { type CreateTaskRequest } from "../types";
import { useCreateTask } from "../api";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  columnId: string;
  teamId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  boardId,
  columnId,
  teamId,
}) => {
  const createTaskMutation = useCreateTask();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateTaskFormInput>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: undefined,
      priority: undefined,
      order: 0,
      isRecurring: false,
      boardId,
      columnId,
      teamId,
      assigneeIds: [],
    },
    mode: "onChange",
  });

  const onSubmit = async (data: CreateTaskFormInput) => {
    try {
      // Convert form data to API request format
      const requestData: CreateTaskRequest = {
        title: data.title,
        description: data.description,
        status: data.status,
        dueDate: data.dueDate,
        priority:
          typeof data.priority === "string"
            ? (parseInt(data.priority) as 1 | 2 | 3 | 4 | 5)
            : (data.priority as 1 | 2 | 3 | 4 | 5 | undefined),
        order: data.order,
        isRecurring: data.isRecurring,
        boardId: data.boardId,
        columnId: data.columnId,
        teamId: data.teamId,
        assigneeIds: data.assigneeIds,
      };

      await createTaskMutation.mutateAsync(requestData);
      handleClose();
    } catch {
      // Error handling is done in the mutation
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="2xl" onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1">
            Create New Task
          </ModalHeader>

          <ModalBody className="gap-4">
            {/* Task Title */}
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Input
                  {...field}
                  errorMessage={errors.title?.message}
                  isInvalid={!!errors.title}
                  label="Task Title"
                  placeholder="Enter task title"
                  variant="flat"
                />
              )}
            />

            {/* Task Description */}
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Textarea
                  {...field}
                  errorMessage={errors.description?.message}
                  isInvalid={!!errors.description}
                  label="Description"
                  maxRows={6}
                  minRows={3}
                  placeholder="Enter task description (optional)"
                  variant="flat"
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Status */}
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Status"
                    placeholder="Select status"
                    selectedKeys={field.value ? [field.value] : []}
                    variant="flat"
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;

                      field.onChange(selectedKey);
                    }}
                  >
                    {TASK_STATUSES.map((status) => (
                      <SelectItem key={status.value}>{status.label}</SelectItem>
                    ))}
                  </Select>
                )}
              />

              {/* Task Priority */}
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    {...field}
                    errorMessage={errors.priority?.message}
                    isInvalid={!!errors.priority}
                    label="Priority"
                    placeholder="Select priority"
                    selectedKeys={field.value ? [field.value.toString()] : []}
                    variant="flat"
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;

                      // Pass the string value directly - Zod preprocessing will handle conversion
                      field.onChange(selectedKey || undefined);
                    }}
                  >
                    {TASK_PRIORITIES.map((priority) => (
                      <SelectItem key={priority.value.toString()}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>

            {/* Future Features Notice */}
            <div className="p-4 bg-default-50 rounded-lg">
              <p className="text-sm text-default-500">
                💡 <strong>Coming Soon:</strong> Due date picker, assignee
                selection, and recurring tasks will be available in the next
                iteration.
              </p>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={createTaskMutation.isPending}
              type="submit"
            >
              Create Task
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

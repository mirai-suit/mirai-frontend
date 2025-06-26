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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Task, UpdateTaskRequest } from "../types";
import {
  updateTaskSchema,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "../validations";
import { useUpdateTask } from "../api";

import { AssigneeSelect } from "./assignee-select";

import { useOrganizationMembers } from "@/modules/organization/api";
import { useOrgStore } from "@/store/useOrgStore";

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

type EditTaskFormInput = {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  assigneeIds?: string[];
};

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { currentOrg } = useOrgStore();
  const updateTaskMutation = useUpdateTask();

  // Get organization members for assignment
  const { data: membersResponse } = useOrganizationMembers(
    currentOrg?.id || "",
  );
  const organizationMembers = membersResponse?.members || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditTaskFormInput>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      status: task.status || "NOT_STARTED",
      priority: task.priority || "MEDIUM",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : undefined,
      assigneeIds: task.assignees?.map((assignee) => assignee.id) || [],
    },
  });

  const onSubmit = async (data: EditTaskFormInput) => {
    try {
      const updateData: UpdateTaskRequest = {
        title: data.title,
        description: data.description,
        status: data.status as any,
        priority: data.priority as any,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : undefined,
        assigneeIds: data.assigneeIds,
      };

      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        data: updateData,
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
    <Modal isOpen={isOpen} size="2xl" onClose={handleClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1">Edit Task</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Task Title */}
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <Input
                    {...field}
                    isRequired
                    errorMessage={errors.title?.message}
                    label="Task Title"
                    placeholder="Enter task title"
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
                    label="Description"
                    placeholder="Enter task description"
                  />
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Task Status */}
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      {...field}
                      errorMessage={errors.status?.message}
                      label="Status"
                      placeholder="Select status"
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;

                        field.onChange(selectedKey);
                      }}
                    >
                      {TASK_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
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
                      label="Priority"
                      placeholder="Select priority"
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;

                        field.onChange(selectedKey);
                      }}
                    >
                      {TASK_PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </div>

              {/* Due Date */}
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <Input
                    {...field}
                    errorMessage={errors.dueDate?.message}
                    label="Due Date"
                    placeholder="Select due date"
                    type="date"
                  />
                )}
              />

              {/* Assignees */}
              <AssigneeSelect
                control={control}
                organizationMembers={organizationMembers}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={updateTaskMutation.isPending}
              type="submit"
            >
              Update Task
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

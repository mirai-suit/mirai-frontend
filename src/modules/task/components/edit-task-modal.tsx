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
  DateRangePicker,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate, getLocalTimeZone, today } from "@internationalized/date";

import { Task, UpdateTaskRequest } from "../types";
import {
  updateTaskFormSchema,
  TASK_PRIORITIES,
  TASK_STATUSES,
  UpdateTaskFormInput,
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

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { currentOrg } = useOrgStore();
  const updateTaskMutation = useUpdateTask();

  // Get organization members for assignment
  const { data: membersResponse } = useOrganizationMembers(
    currentOrg?.id || ""
  );
  const organizationMembers = membersResponse?.members || [];

  const formData = React.useMemo(
    () => ({
      title: task.title,
      description: task.description || "",
      status: task.status || "NOT_STARTED",
      priority: task.priority || "MEDIUM",
      dateRange:
        task.startDate && task.dueDate
          ? {
              start: new Date(task.startDate).toISOString().split("T")[0],
              end: new Date(task.dueDate).toISOString().split("T")[0],
            }
          : task.startDate
            ? {
                start: new Date(task.startDate).toISOString().split("T")[0],
                end: undefined,
              }
            : task.dueDate
              ? {
                  start: undefined,
                  end: new Date(task.dueDate).toISOString().split("T")[0],
                }
              : undefined,
      assigneeIds: task.assignees?.map((assignee) => assignee.id) || [],
    }),
    [task]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateTaskFormInput>({
    resolver: zodResolver(updateTaskFormSchema),
    values: formData, // Use values instead of defaultValues for dynamic updates
  });

  const onSubmit = async (data: UpdateTaskFormInput) => {
    try {
      const updateData: UpdateTaskRequest = {
        title: data.title,
        description: data.description,
        status: data.status as any,
        priority: data.priority as any,
        startDate: data.dateRange?.start
          ? parseDate(data.dateRange.start)
              .toDate(getLocalTimeZone())
              .toISOString()
          : undefined,
        dueDate: data.dateRange?.end
          ? parseDate(data.dateRange.end)
              .toDate(getLocalTimeZone())
              .toISOString()
          : undefined,
        assigneeIds: data.assigneeIds,
      };

      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        data: updateData,
      });

      // The task data will be updated via the mutation's onSuccess callback
      // No need to reset the form here as the modal will close
      onClose();
    } catch {
      // Error handling is done in the mutation
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onClose={handleClose}>
      <ModalContent>
        <form key={`edit-task-${task.id}`} onSubmit={handleSubmit(onSubmit)}>
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
                        <SelectItem key={status.value}>
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
                        <SelectItem key={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </div>

              {/* Date Range */}
              <Controller
                control={control}
                name="dateRange"
                render={({ field }) => (
                  <DateRangePicker
                    description="Select start and end dates for the task"
                    errorMessage={errors.dateRange?.message}
                    label="Task Duration"
                    minValue={today(getLocalTimeZone())}
                    size="sm"
                    value={
                      field.value?.start && field.value?.end
                        ? {
                            start: parseDate(field.value.start) as any,
                            end: parseDate(field.value.end) as any,
                          }
                        : undefined
                    }
                    variant="flat"
                    onChange={(range: any) => {
                      if (range && range.start && range.end) {
                        field.onChange({
                          start: range.start.toString(),
                          end: range.end.toString(),
                        });
                      } else {
                        field.onChange(undefined);
                      }
                    }}
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

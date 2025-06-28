import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Select,
  SelectItem,
  Avatar,
  Card,
  CardBody,
  Skeleton,
  Divider,
} from "@heroui/react";
import {
  Calendar,
  Flag,
  User,
  ClockCounterClockwise,
  Tag,
} from "@phosphor-icons/react";
import { useDateFormatter } from "@react-aria/i18n";

import { TaskStatus, TaskPriority } from "../types";
import { TASK_STATUSES, TASK_PRIORITIES } from "../validations";
import { useTask, useUpdateTask } from "../api";
import { useAuthStore } from "../../auth/store";

import { useOrgStore } from "@/store/useOrgStore";

interface TaskViewModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskViewModal: React.FC<TaskViewModalProps> = ({
  taskId,
  isOpen,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { currentUserRole } = useOrgStore();
  const updateTaskMutation = useUpdateTask();
  const dateFormatter = useDateFormatter({ dateStyle: "medium" });
  const dateTimeFormatter = useDateFormatter({
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Fetch task details
  const {
    data: taskResponse,
    isLoading,
    isError,
    error,
  } = useTask(taskId || "");

  const task = taskResponse?.task;

  // Check if current user can update task status
  const canUpdateStatus = React.useMemo(() => {
    if (!user || !task) return false;

    // ADMIN and EDITOR can update any task
    if (currentUserRole === "ADMIN" || currentUserRole === "EDITOR") {
      return true;
    }

    // MEMBER can only update if task is assigned to them
    if (currentUserRole === "MEMBER") {
      return task.assignees.some((assignee) => assignee.id === user.id);
    }

    return false;
  }, [user, task, currentUserRole]);

  const handleStatusUpdate = async (newStatus: TaskStatus) => {
    if (!task || !canUpdateStatus) return;

    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        data: { status: newStatus },
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    const statusConfig = TASK_STATUSES.find((s) => s.value === status);

    return statusConfig?.color || "default";
  };

  const getPriorityColor = (priority?: TaskPriority) => {
    if (!priority) return "default";

    switch (priority) {
      case "HIGHEST":
        return "danger";
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "primary";
      case "LOWEST":
        return "default";
      default:
        return "default";
    }
  };

  if (!isOpen || !taskId) return null;

  return (
    <Modal
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6",
      }}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onClose={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {isLoading ? (
                <Skeleton className="h-6 w-3/4 rounded-lg" />
              ) : (
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground">
                      {task?.title}
                    </h2>
                    <p className="text-sm text-default-500 mt-1">
                      Task ID: {task?.id}
                    </p>
                  </div>
                </div>
              )}
            </ModalHeader>

            <ModalBody>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              ) : isError ? (
                <div className="text-center py-8">
                  <p className="text-danger text-lg">Failed to load task</p>
                  <p className="text-default-500">
                    {error?.message || "Task not found"}
                  </p>
                </div>
              ) : task ? (
                <div className="space-y-6">
                  {/* Status and Priority */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Tag className="text-default-400" size={16} />
                      <span className="text-sm font-medium">Status:</span>
                      {canUpdateStatus ? (
                        <Select
                          className="min-w-[140px]"
                          isDisabled={updateTaskMutation.isPending}
                          selectedKeys={[task.status]}
                          size="sm"
                          onSelectionChange={(keys) => {
                            const newStatus = Array.from(keys)[0] as TaskStatus;

                            if (newStatus && newStatus !== task.status) {
                              handleStatusUpdate(newStatus);
                            }
                          }}
                        >
                          {TASK_STATUSES.map((status) => (
                            <SelectItem key={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </Select>
                      ) : (
                        <Chip
                          color={getStatusColor(task.status)}
                          size="sm"
                          variant="flat"
                        >
                          {
                            TASK_STATUSES.find((s) => s.value === task.status)
                              ?.label
                          }
                        </Chip>
                      )}
                    </div>

                    {task.priority && (
                      <div className="flex items-center gap-2">
                        <Flag className="text-default-400" size={16} />
                        <span className="text-sm font-medium">Priority:</span>
                        <Chip
                          color={getPriorityColor(task.priority)}
                          size="sm"
                          variant="flat"
                        >
                          {
                            TASK_PRIORITIES.find(
                              (p) => p.value === task.priority,
                            )?.label
                          }
                        </Chip>
                      </div>
                    )}
                  </div>

                  <Divider />

                  {/* Description */}
                  {task.description && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Description</h3>
                      <Card>
                        <CardBody>
                          <p className="text-sm text-default-700 whitespace-pre-wrap">
                            {task.description}
                          </p>
                        </CardBody>
                      </Card>
                    </div>
                  )}

                  {/* Assignees */}
                  {task.assignees && task.assignees.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <User className="text-default-400" size={16} />
                        Assignees
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {task.assignees.map((assignee) => (
                          <div
                            key={assignee.id}
                            className="flex items-center gap-2 p-2 bg-default-50 rounded-lg"
                          >
                            <Avatar
                              name={`${assignee.firstName} ${assignee.lastName}`}
                              size="sm"
                              src={assignee.avatar}
                            />
                            <div>
                              <p className="text-sm font-medium">
                                {assignee.firstName} {assignee.lastName}
                              </p>
                              <p className="text-xs text-default-500">
                                {assignee.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.startDate && (
                      <div>
                        <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                          <Calendar className="text-default-400" size={16} />
                          Start Date
                        </h3>
                        <p className="text-sm text-default-600">
                          {dateFormatter.format(new Date(task.startDate))}
                        </p>
                      </div>
                    )}

                    {task.dueDate && (
                      <div>
                        <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                          <Calendar className="text-default-400" size={16} />
                          Due Date
                        </h3>
                        <p className="text-sm text-default-600">
                          {dateFormatter.format(new Date(task.dueDate))}
                        </p>
                      </div>
                    )}
                  </div>

                  <Divider />

                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-default-500">
                    <div>
                      <span className="flex items-center gap-1">
                        <ClockCounterClockwise size={14} />
                        Created:{" "}
                        {dateTimeFormatter.format(new Date(task.createdAt))}
                      </span>
                    </div>
                    <div>
                      <span className="flex items-center gap-1">
                        <ClockCounterClockwise size={14} />
                        Updated:{" "}
                        {dateTimeFormatter.format(new Date(task.updatedAt))}
                      </span>
                    </div>
                  </div>

                  {/* Permission Notice */}
                  {!canUpdateStatus && (
                    <Card className="bg-warning-50 border border-warning-200">
                      <CardBody className="py-3">
                        <p className="text-sm text-warning-700">
                          <strong>Note:</strong> You can only update the status
                          of tasks assigned to you.
                        </p>
                      </CardBody>
                    </Card>
                  )}
                </div>
              ) : null}
            </ModalBody>

            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

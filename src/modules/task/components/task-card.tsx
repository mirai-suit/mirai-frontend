import React from "react";
import {
  Card,
  CardBody,
  Chip,
  AvatarGroup,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  Calendar,
  Flag,
  DotsThree,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Avatar from "boring-avatars";

import { Task } from "../types";
import { TASK_PRIORITIES, TASK_STATUSES } from "../validations";
import { useDeleteTask } from "../api";

import { siteConfig } from "@/config/site";
import { WithRole } from "@/components/role-based-access";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onEdit?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onEdit,
}) => {
  const deleteTaskMutation = useDeleteTask();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task.id);
      onDeleteModalClose();
    } catch (error) {
      // Handle error silently or show toast
    }
  };

  const handleDropdownAction = (key: string) => {
    switch (key) {
      case "edit":
        onEdit?.();
        break;
      case "delete":
        onDeleteModalOpen();
        break;
    }
  };
  const getPriorityColor = (priority?: string) => {
    const priorityConfig = TASK_PRIORITIES.find((p) => p.value === priority);

    return priorityConfig?.color || "default";
  };

  const getPriorityLabel = (priority?: string) => {
    const priorityConfig = TASK_PRIORITIES.find((p) => p.value === priority);

    return priorityConfig?.label || "Normal";
  };

  const getStatusLabel = (status?: string) => {
    const statusConfig = TASK_STATUSES.find((s) => s.value === status);

    return statusConfig?.label || status;
  };

  const getStatusColor = (status?: string) => {
    const statusConfig = TASK_STATUSES.find((s) => s.value === status);

    return statusConfig?.color || "default";
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <motion.div
        layout
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          isBlurred
          className="bg-default-50 hover:bg-default-100 transition-colors w-full"
          shadow="none"
        >
          <CardBody className="p-3">
            <div className="space-y-2">
              {/* Header with Title and Actions */}
              <div className="flex items-start justify-between gap-2">
                <p
                  className="text-sm font-medium text-foreground line-clamp-1 cursor-pointer flex-1"
                  onClick={onClick}
                >
                  {task.title}
                </p>

                {/* Action Dropdown */}
                <WithRole allowedRoles={["ADMIN", "EDITOR"]}>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="h-6 w-6 min-w-6"
                      >
                        <DotsThree size={16} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Task actions"
                      onAction={(key) => handleDropdownAction(key as string)}
                    >
                      <DropdownItem
                        key="edit"
                        startContent={<PencilSimple size={16} />}
                      >
                        Edit Task
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        color="danger"
                        className="text-danger"
                        startContent={<Trash size={16} />}
                      >
                        Delete Task
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </WithRole>
              </div>

              {/* Task Description */}
              {task.description && (
                <p
                  className="text-xs text-default-500 line-clamp-2 cursor-pointer"
                  onClick={onClick}
                >
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Task Priority */}
                  {task.priority && (
                    <div className="flex items-center gap-1">
                      <Flag size={12} />
                      <Chip
                        className="text-xs"
                        color={getPriorityColor(task.priority)}
                        size="sm"
                        variant="flat"
                      >
                        {getPriorityLabel(task.priority)}
                      </Chip>
                    </div>
                  )}

                  {/* Task Due Date */}
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-default-500">
                      <Calendar size={12} />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  )}
                </div>

                {/* Task Assignees */}
                {task.assignees && task.assignees.length > 0 && (
                  <div className="flex items-center gap-1">
                    {task.assignees.length === 1 ? (
                      <Tooltip
                        content={`Assigned to ${task.assignees[0].firstName} ${task.assignees[0].lastName}`}
                      >
                        <Avatar
                          className="cursor-pointer"
                          colors={siteConfig?.avatarColors.beam}
                          name={`${task.assignees[0].firstName} ${task.assignees[0].lastName}`}
                          size={siteConfig.avatarSize}
                          src={task.assignees[0].avatar}
                          variant="beam"
                        />
                      </Tooltip>
                    ) : (
                      <AvatarGroup
                        isBordered
                        max={3}
                        size="sm"
                        total={task.assignees.length}
                      >
                        {task.assignees.slice(0, 3).map((assignee) => (
                          <Tooltip
                            key={assignee.id}
                            content={`${assignee.firstName} ${assignee.lastName}`}
                          >
                            <Avatar
                              className="cursor-pointer"
                              colors={siteConfig?.avatarColors.beam}
                              name={`${assignee.firstName} ${assignee.lastName}`}
                              size={siteConfig.avatarSize}
                              variant="beam"
                            />
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                    )}
                  </div>
                )}
              </div>

              {/* Task Status (if different from default) */}
              {task.status && task.status !== "NOT_STARTED" && (
                <div className="flex justify-end">
                  <Chip
                    color={getStatusColor(task.status)}
                    size="sm"
                    variant="dot"
                  >
                    {task.status === "CUSTOM" && task.customStatus
                      ? task.customStatus
                      : getStatusLabel(task.status)}
                  </Chip>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Delete Task</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete "{task.title}"? This action cannot
              be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={onDeleteModalClose}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={deleteTaskMutation.isPending}
              onPress={handleDelete}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

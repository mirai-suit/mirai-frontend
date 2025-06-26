import React from "react";
import { Card, CardBody, Chip, AvatarGroup, Tooltip } from "@heroui/react";
import { Calendar, Flag } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Avatar from "boring-avatars";

import { Task } from "../types";
import { TASK_PRIORITIES, TASK_STATUSES } from "../validations";

import { siteConfig } from "@/config/site";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
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
        isPressable
        className="bg-default-50 hover:bg-default-100 cursor-pointer transition-colors w-full "
        shadow="none"
        onPress={onClick}
      >
        <CardBody className="p-3">
          <div className="space-y-2">
            {/* Task Title */}
            <p className="text-sm font-medium text-foreground line-clamp-1">
              {task.title}
            </p>

            {/* Task Description */}
            {task.description && (
              <p className="text-xs text-default-500 line-clamp-2">
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
  );
};

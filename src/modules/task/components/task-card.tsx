import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { Calendar, Flag } from "@phosphor-icons/react";

import { Task } from "../../board/types";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const getPriorityColor = (priority?: number) => {
    switch (priority) {
      case 3:
        return "danger";
      case 2:
        return "warning";
      case 1:
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority?: number) => {
    switch (priority) {
      case 3:
        return "High";
      case 2:
        return "Medium";
      case 1:
        return "Low";
      default:
        return "Normal";
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      isPressable
      className="bg-default-50 hover:bg-default-100 cursor-pointer transition-colors"
      onPress={onClick}
    >
      <CardBody className="p-3">
        <div className="space-y-2">
          {/* Task Title */}
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {task.title}
          </p>

          {/* Task Description */}
          {task.description && (
            <p className="text-xs text-default-500 line-clamp-2">
              {task.description}
            </p>
          )}

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

          {/* Task Status (if different from column default) */}
          {task.status && task.status !== "todo" && (
            <div className="flex justify-end">
              <Chip color="primary" size="sm" variant="dot">
                {task.status}
              </Chip>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

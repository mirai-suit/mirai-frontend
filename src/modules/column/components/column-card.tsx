import React from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  ScrollShadow,
} from "@heroui/react";
import { DotsThree, Plus, PencilSimple } from "@phosphor-icons/react";
import { AnimatePresence, Reorder } from "framer-motion";

import { Column } from "../../board/types";
import { Task } from "../../task/types";
import { CreateTaskModal } from "../../task/components/create-task-modal";
import { TaskCard } from "../../task/components/task-card";
import { useReorderTasks } from "../../task/api";
import { TaskViewModal } from "../../task/components/task-view-modal";

import { EditColumnModal } from "./edit-column-modal";

import { WithBoardPermission } from "@/components/board-permission-components";
import { useOrgStore } from "@/store/useOrgStore";

interface ColumnCardProps {
  column: Column;
  tasks?: Task[];
}

export const ColumnCard: React.FC<ColumnCardProps> = ({
  column,
  tasks = [],
}) => {
  const [orderedTasks, setOrderedTasks] = React.useState(tasks);
  const reorderMutation = useReorderTasks();
  const { boardId } = useParams();
  const { hasPermission } = useOrgStore();
  const editModal = useDisclosure();
  const createTaskModal = useDisclosure();
  const taskViewModal = useDisclosure();
  const [selectedColumn, setSelectedColumn] = React.useState<Column | null>(
    null
  );
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(
    null
  );

  const canEditColumn = hasPermission("createBoards");

  const handleEdit = () => {
    setSelectedColumn(column);
    editModal.onOpen();
  };

  const handleAddTask = () => {
    createTaskModal.onOpen();
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    taskViewModal.onOpen();
  };

  const handleTaskViewClose = () => {
    setSelectedTaskId(null);
    taskViewModal.onClose();
  };

  // Keep local state in sync with prop changes
  React.useEffect(() => {
    setOrderedTasks(tasks);
  }, [tasks]);

  const handleReorder = (newOrder: typeof orderedTasks) => {
    setOrderedTasks(newOrder);
    if (newOrder.length > 0 && newOrder[0].columnId) {
      reorderMutation.mutate({
        columnId: newOrder[0].columnId,
        taskIds: newOrder.map((t) => t.id),
      });
    }
  };

  return (
    <>
      <Card className="w-72 h-fit min-h-[200px]">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="text-sm font-medium">{column.name}</h3>
            <span className="text-xs text-default-500">{tasks.length}</span>
          </div>

          {canEditColumn && (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <DotsThree size={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="edit"
                  startContent={<PencilSimple size={16} />}
                  onPress={handleEdit}
                >
                  Edit Column
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </CardHeader>

        <CardBody className="pt-0">
          {/* Task list */}
          <ScrollShadow className="max-h-[calc(100vh-350px)]">
            <Reorder.Group
              axis="y"
              className="space-y-2 mb-4"
              values={orderedTasks}
              onReorder={handleReorder}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {orderedTasks.map((task) => (
                  <Reorder.Item key={task.id} value={task}>
                    <div className="flex items-center group">
                      {/* Drag handle */}
                      <button
                        aria-label="Drag to reorder"
                        className="mr-2 cursor-grab active:cursor-grabbing opacity-60 group-hover:opacity-100 transition"
                        style={{
                          WebkitTouchCallout: "none",
                          WebkitUserSelect: "none",
                          userSelect: "none",
                        }}
                        tabIndex={-1}
                        type="button"
                        onClick={(e) => e.preventDefault()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <svg
                          fill="none"
                          height="18"
                          viewBox="0 0 20 20"
                          width="18"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="6" cy="6" fill="currentColor" r="1.5" />
                          <circle cx="6" cy="10" fill="currentColor" r="1.5" />
                          <circle cx="6" cy="14" fill="currentColor" r="1.5" />
                          <circle cx="14" cy="6" fill="currentColor" r="1.5" />
                          <circle cx="14" cy="10" fill="currentColor" r="1.5" />
                          <circle cx="14" cy="14" fill="currentColor" r="1.5" />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <TaskCard
                          task={task}
                          onClick={() => handleTaskClick(task.id)}
                        />
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
                {orderedTasks.length === 0 && (
                  <div className="text-center py-4 text-default-400 text-sm">
                    No tasks match the current filters
                  </div>
                )}
              </AnimatePresence>
            </Reorder.Group>
          </ScrollShadow>

          {/* Add task button */}
          <WithBoardPermission
            fallback={
              <p className="text-xs text-center text-default-400 py-2">
                No permission to add tasks
              </p>
            }
            permission="canCreateTasks"
          >
            <Button
              className="w-full"
              size="sm"
              startContent={<Plus size={16} />}
              variant="light"
              onPress={handleAddTask}
            >
              Add a task
            </Button>
          </WithBoardPermission>
        </CardBody>
      </Card>

      <EditColumnModal
        column={selectedColumn}
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
      />

      <CreateTaskModal
        boardId={boardId!}
        columnId={column.id}
        isOpen={createTaskModal.isOpen}
        onClose={createTaskModal.onClose}
      />

      <TaskViewModal
        isOpen={taskViewModal.isOpen}
        taskId={selectedTaskId}
        onClose={handleTaskViewClose}
      />
    </>
  );
};

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
import { AnimatePresence } from "framer-motion";

import { Column } from "../../board/types";
import { Task } from "../../task/types";
import { CreateTaskModal } from "../../task/components/create-task-modal";
import { TaskCard } from "../../task/components/task-card";
import { TaskViewModal } from "../../task/components/task-view-modal";

import { EditColumnModal } from "./edit-column-modal";

import { WithPermission } from "@/components/role-based-access";
import { useOrgStore } from "@/store/useOrgStore";

interface ColumnCardProps {
  column: Column;
  tasks?: Task[];
}

export const ColumnCard: React.FC<ColumnCardProps> = ({
  column,
  tasks = [],
}) => {
  const { boardId } = useParams();
  const { hasPermission } = useOrgStore();
  const editModal = useDisclosure();
  const createTaskModal = useDisclosure();
  const taskViewModal = useDisclosure();
  const [selectedColumn, setSelectedColumn] = React.useState<Column | null>(
    null,
  );
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(
    null,
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
            <AnimatePresence initial={false} mode="popLayout">
              <div className="space-y-2 mb-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task.id)}
                  />
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-4 text-default-400 text-sm">
                    No tasks match the current filters
                  </div>
                )}
              </div>
            </AnimatePresence>
          </ScrollShadow>

          {/* Add task button */}
          <WithPermission
            fallback={
              <p className="text-xs text-center text-default-400 py-2">
                No permission to add tasks
              </p>
            }
            permission="createBoards"
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
          </WithPermission>
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
        taskId={selectedTaskId}
        isOpen={taskViewModal.isOpen}
        onClose={handleTaskViewClose}
      />
    </>
  );
};

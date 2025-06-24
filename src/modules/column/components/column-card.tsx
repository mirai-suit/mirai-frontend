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

import { Column, Task } from "../../board/types";
import { CreateTaskModal } from "../../task/components/create-task-modal";
import { TaskCard } from "../../task/components/task-card";

import { EditColumnModal } from "./edit-column-modal";

interface ColumnCardProps {
  column: Column;
  tasks?: Task[]; // Tasks will be passed separately since Column type doesn't include them
}

export const ColumnCard: React.FC<ColumnCardProps> = ({
  column,
  tasks = [],
}) => {
  const { boardId } = useParams();
  const editModal = useDisclosure();
  const createTaskModal = useDisclosure();
  const [selectedColumn, setSelectedColumn] = React.useState<Column | null>(
    null
  );

  const handleEdit = () => {
    setSelectedColumn(column);
    editModal.onOpen();
  };

  const handleAddTask = () => {
    createTaskModal.onOpen();
  };

  return (
    <>
      <Card className="w-64 h-fit min-h-[200px]">
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="text-sm font-medium">{column.name}</h3>
            <span className="text-xs text-default-500">{tasks.length}</span>
          </div>

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
        </CardHeader>

        <CardBody className="pt-0">
          {/* Task list */}
          <ScrollShadow className="max-h-[calc(100vh-300px)]">
            <div className="space-y-2 mb-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => {
                    // TODO: Implement task edit/view functionality
                  }}
                />
              ))}
            </div>
          </ScrollShadow>

          {/* Add task button */}
          <Button
            className="w-full"
            size="sm"
            startContent={<Plus size={16} />}
            variant="light"
            onPress={handleAddTask}
          >
            Add a task
          </Button>
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
    </>
  );
};

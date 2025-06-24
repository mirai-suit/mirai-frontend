import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Spinner,
  ScrollShadow,
  useDisclosure,
} from "@heroui/react";
import { ArrowLeft, Users, Gear, Plus } from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { useBoard } from "../api";
import { useBoardStore } from "../store";
import { ColumnCard } from "../../column/components/column-card";
import { ColumnSkeleton } from "../../column/components/column-skeleton";
import { CreateColumnModal } from "../../column/components/create-column-modal";
import { useGetColumnsForBoard } from "../../column/api";

interface BoardPageProps {
  // Add props if needed
}

export const BoardPage: React.FC<BoardPageProps> = () => {
  const { userId, orgId, boardId } = useParams();
  const navigate = useNavigate();
  const { setCurrentBoard } = useBoardStore();
  const createColumnModal = useDisclosure();

  const { data: boardResponse, isLoading, isError, error } = useBoard(boardId!);
  const { data: columnsResponse, isLoading: isLoadingColumns } =
    useGetColumnsForBoard(boardId!);

  const board = boardResponse?.board;
  const columns = columnsResponse?.columns || [];

  // Update current board in store when data changes
  React.useEffect(() => {
    if (board) {
      setCurrentBoard(board);
    }

    return () => setCurrentBoard(null);
  }, [board, setCurrentBoard]);

  const handleBackClick = () => {
    navigate(`/u/${userId}/o/${orgId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-default-500">Loading board...</p>
        </div>
      </div>
    );
  }

  if (isError || !board) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-danger text-lg">Failed to load board</p>
          <p className="text-default-500">
            {error?.message || "Board not found"}
          </p>
          <Button color="primary" onPress={handleBackClick}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 border-b border-divider"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={handleBackClick}
          >
            <ArrowLeft size={18} />
          </Button>

          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-md"
              style={{ backgroundColor: board.color }}
            />
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {board.title}
              </h1>
              {board.description && (
                <p className="text-sm text-default-500">{board.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {board.accessList && board.accessList.length > 0 && (
            <Button size="sm" startContent={<Users size={16} />} variant="flat">
              {board.accessList.length} member
              {board.accessList.length > 1 ? "s" : ""}
            </Button>
          )}

          <Button isIconOnly size="sm" variant="light">
            <Gear size={18} />
          </Button>
        </div>
      </motion.div>

      {/* Board Content */}
      <motion.div
        animate={{ opacity: 1 }}
        className="flex-1 overflow-hidden"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {isLoadingColumns ? (
          <ScrollShadow
            className="h-full"
            hideScrollBar={false}
            orientation="horizontal"
          >
            <div className="flex h-full gap-4 p-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-shrink-0"
                  initial={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ColumnSkeleton />
                </motion.div>
              ))}
            </div>
          </ScrollShadow>
        ) : columns.length > 0 ? (
          <ScrollShadow
            className="h-full"
            hideScrollBar={false}
            orientation="horizontal"
          >
            <div className="flex h-full gap-4 p-6">
              {columns
                .sort((a, b) => a.order - b.order)
                .map((column, index) => {
                  const columnTasks =
                    board?.tasks?.filter(
                      (task) => task.columnId === column.id
                    ) || [];

                  return (
                    <motion.div
                      key={column.id}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-shrink-0"
                      initial={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ColumnCard column={column} tasks={columnTasks} />
                    </motion.div>
                  );
                })}

              {/* Add column button */}
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="flex-shrink-0"
                initial={{ opacity: 0, x: 20 }}
                transition={{
                  duration: 0.3,
                  delay: columns.length * 0.1,
                }}
              >
                <Card className="w-64 h-20">
                  <CardBody className="flex items-center justify-center">
                    <Button
                      color="default"
                      variant="light"
                      startContent={<Plus size={16} />}
                      onPress={createColumnModal.onOpen}
                    >
                      Add another column
                    </Button>
                  </CardBody>
                </Card>
              </motion.div>
            </div>
          </ScrollShadow>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-default-500">No columns in this board yet</p>
              <Button
                color="primary"
                variant="flat"
                startContent={<Plus size={16} />}
                onPress={createColumnModal.onOpen}
              >
                Add your first column
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create Column Modal */}
      <CreateColumnModal
        isOpen={createColumnModal.isOpen}
        boardId={boardId!}
        onClose={createColumnModal.onClose}
      />
    </div>
  );
};

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Spinner,
  ScrollShadow,
  useDisclosure,
  Tooltip,
} from "@heroui/react";
import { ArrowLeft, Users, Gear, Plus, Notepad } from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { useBoard } from "../api";
import { useBoardStore } from "../store";
import { NotesDrawer } from "../components/notes-drawer";
import { ColumnCard } from "../../column/components/column-card";
import { ColumnSkeleton } from "../../column/components/column-skeleton";
import { CreateColumnModal } from "../../column/components/create-column-modal";
import { FloatingChatButton, ChatDrawer } from "../../chat/components";
import { useGetColumnsForBoard } from "../../column/api";
import { useTasksForBoard } from "../../task/api";
import { QuickFilterChips } from "../../task/components/quick-filter-chips";
import { useTaskFilterStore } from "../../task/store/useTaskFilterStore";
import { applyFiltersAndSort } from "../../task/utils/taskFilters";
import { useAuthStore } from "../../auth/store";

import { WithPermission } from "@/components/role-based-access";

interface BoardPageProps {
  // Add props if needed
}

export const BoardPage: React.FC<BoardPageProps> = () => {
  const { userId, orgId, boardId } = useParams();
  const navigate = useNavigate();
  const { setCurrentBoard } = useBoardStore();
  const createColumnModal = useDisclosure();
  const notesDrawer = useDisclosure();
  const chatDrawer = useDisclosure();

  const { data: boardResponse, isLoading, isError, error } = useBoard(boardId!);
  const { data: columnsResponse, isLoading: isLoadingColumns } =
    useGetColumnsForBoard(boardId!);
  const { data: tasksResponse } = useTasksForBoard(boardId!);

  const board = boardResponse?.board;
  const columns = columnsResponse?.columns || [];
  const tasks = tasksResponse?.tasks || [];

  // Board-level filtering
  const { user } = useAuthStore();
  const { getBoardFilters } = useTaskFilterStore();
  const boardFilters = getBoardFilters(boardId!);

  // Apply filters to all tasks in this board
  const filteredTasks = React.useMemo(() => {
    return applyFiltersAndSort(tasks, boardFilters, user?.id);
  }, [tasks, boardFilters, user?.id]);

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

          <Tooltip content="Notes">
            <Button
              isIconOnly
              size="sm"
              title="Notes"
              variant="light"
              onPress={notesDrawer.onOpen}
            >
              <Notepad size={18} />
            </Button>
          </Tooltip>

          <Button isIconOnly size="sm" variant="light">
            <Gear size={18} />
          </Button>
        </div>
      </motion.div>

      {/* Board Filters */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-divider px-6 py-3"
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <QuickFilterChips
          boardId={boardId!}
          filteredTaskCount={filteredTasks.length}
          taskCount={tasks.length}
        />
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
                  // Filter and sort tasks for this column by order (fallback to createdAt)
                  const columnTasks = filteredTasks
                    .filter((task) => task.columnId === column.id)
                    .sort(
                      (a, b) =>
                        a.order - b.order ||
                        new Date(a.createdAt).getTime() -
                          new Date(b.createdAt).getTime()
                    );

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
                    <WithPermission
                      fallback={
                        <p className="text-xs text-default-400">
                          No permission to add columns
                        </p>
                      }
                      permission="createBoards"
                    >
                      <Button
                        color="default"
                        startContent={<Plus size={16} />}
                        variant="light"
                        onPress={createColumnModal.onOpen}
                      >
                        Add another column
                      </Button>
                    </WithPermission>
                  </CardBody>
                </Card>
              </motion.div>
            </div>
          </ScrollShadow>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-default-500">No columns in this board yet</p>
              <WithPermission
                fallback={
                  <p className="text-xs text-default-400">
                    You don&apos;t have permission to create columns
                  </p>
                }
                permission="createBoards"
              >
                <Button
                  color="primary"
                  startContent={<Plus size={16} />}
                  variant="flat"
                  onPress={createColumnModal.onOpen}
                >
                  Add your first column
                </Button>
              </WithPermission>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create Column Modal */}
      <CreateColumnModal
        boardId={boardId!}
        isOpen={createColumnModal.isOpen}
        onClose={createColumnModal.onClose}
      />

      {/* Notes Drawer */}
      <NotesDrawer
        boardId={boardId!}
        isOpen={notesDrawer.isOpen}
        onClose={notesDrawer.onClose}
      />

      {/* Chat Integration */}
      <FloatingChatButton onPress={chatDrawer.onOpen} />
      <ChatDrawer
        boardId={boardId!}
        isOpen={chatDrawer.isOpen}
        onClose={chatDrawer.onClose}
      />
    </div>
  );
};

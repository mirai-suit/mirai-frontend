import type { Board } from "../types";

import React from "react";
import { Button, Tooltip, ScrollShadow } from "@heroui/react";
import { Plus, Folder, CaretDown, CaretUp } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import { useBoards, useArchiveBoard, useDeleteBoard } from "../api";
import { useBoardStore } from "../store";
import { useAuthStore } from "../../auth/store";

import { BoardCard } from "./board-card";
import { BoardFilters } from "./board-filters";
import { BoardEmptyState } from "./board-empty-state";
import { ShowMoreButton } from "./show-more-button";
import { BoardListSkeleton } from "./board-list-skeleton";
import { CollapsedBoardSkeleton } from "./collapsed-board-skeleton";
import { DeleteBoardModal } from "./delete-board-modal";
import { EditBoardModal } from "./edit-board-modal";

import { CanCreateBoards } from "@/components/role-based-access";

interface BoardListProps {
  organizationId: string;
  isCollapsed?: boolean;
}

type BoardFilter = "recent" | "all" | "archived";

export const BoardList: React.FC<BoardListProps> = ({
  organizationId,
  isCollapsed = false,
}) => {
  const navigate = useNavigate();
  const { boardId: currentBoardId } = useParams();
  const { openCreateBoardModal } = useBoardStore();
  const { user } = useAuthStore();

  // Local state for board list management
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<BoardFilter>("recent");
  const [isActionLoading, setIsActionLoading] = React.useState<string | null>(
    null,
  );
  const [boardToDelete, setBoardToDelete] = React.useState<Board | null>(null);
  const [boardToEdit, setBoardToEdit] = React.useState<Board | null>(null);

  // API hooks
  const {
    data: boardsResponse,
    isLoading,
    isError,
  } = useBoards(organizationId);

  const archiveBoardMutation = useArchiveBoard();
  const deleteBoardMutation = useDeleteBoard();

  const allBoards = boardsResponse?.boards || [];

  // Filter boards based on active filter
  const filteredBoards = React.useMemo(() => {
    switch (activeFilter) {
      case "recent":
        return allBoards
          .filter((board) => !board.isArchived)
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt).getTime() -
              new Date(a.updatedAt || a.createdAt).getTime(),
          )
          .slice(0, 5);
      case "all":
        return allBoards.filter((board) => !board.isArchived);
      case "archived":
        return allBoards.filter((board) => board.isArchived);
      default:
        return allBoards;
    }
  }, [allBoards, activeFilter]);

  // Limit boards in collapsed state
  const displayedBoards = isCollapsed
    ? filteredBoards.slice(0, 3)
    : isExpanded
      ? filteredBoards
      : filteredBoards.slice(0, 5);

  const handleBoardClick = (board: Board) => {
    if (user?.id) {
      navigate(`/u/${user.id}/o/${organizationId}/b/${board.id}`);
    }
  };

  const handleCreateBoard = () => {
    openCreateBoardModal();
  };

  const handleBoardAction = async (action: string, boardId: string) => {
    setIsActionLoading(boardId);

    switch (action) {
      case "edit":
        // Find the board and open edit modal
        const boardToEdit = allBoards.find((board) => board.id === boardId);

        if (boardToEdit) {
          setBoardToEdit(boardToEdit);
        }
        setIsActionLoading(null);
        break;
      case "share":
        // TODO: Open share modal
        setIsActionLoading(null);
        break;
      case "archive":
        await archiveBoardMutation.mutateAsync({
          boardId,
          isArchived: true,
        });
        setIsActionLoading(null);
        break;
      case "unarchive":
        await archiveBoardMutation.mutateAsync({
          boardId,
          isArchived: false,
        });
        setIsActionLoading(null);
        break;
      case "delete":
        // Find the board and open delete modal
        const boardToDelete = allBoards.find((board) => board.id === boardId);

        if (boardToDelete) {
          setBoardToDelete(boardToDelete);
        }
        setIsActionLoading(null);
        break;
    }
  };

  const handleConfirmDelete = async () => {
    if (!boardToDelete) return;

    await deleteBoardMutation.mutateAsync(boardToDelete.id);
    setBoardToDelete(null);
  };

  const handleCloseDeleteModal = () => {
    setBoardToDelete(null);
  };

  const handleCloseEditModal = () => {
    setBoardToEdit(null);
  };

  if (isCollapsed) {
    if (isLoading) {
      return <CollapsedBoardSkeleton count={3} />;
    }

    return (
      <div className="px-2 py-2">
        {/* Collapsed add button */}
        <CanCreateBoards fallback={null}>
          <Tooltip content="Create Board" placement="right">
            <Button
              isIconOnly
              className="w-10 h-10 mx-auto mb-2"
              size="sm"
              variant="light"
              onPress={handleCreateBoard}
            >
              <Plus size={16} />
            </Button>
          </Tooltip>
        </CanCreateBoards>

        {/* Collapsed board list */}
        <div className="space-y-1">
          {displayedBoards.slice(0, 3).map((board) => (
            <Tooltip key={board.id} content={board.title} placement="right">
              <Button
                isIconOnly
                className={`w-10 h-10 mx-auto ${
                  currentBoardId === board.id
                    ? "bg-primary/10 text-primary"
                    : ""
                }`}
                size="sm"
                variant="light"
                onPress={() => handleBoardClick(board)}
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: board.color }}
                />
              </Button>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-3">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="text-default-500" size={16} />
          <h3 className="text-sm font-medium text-foreground">Boards</h3>
        </div>
        <div className="flex items-center gap-1">
          {!isExpanded && filteredBoards.length > 5 && (
            <Button
              isIconOnly
              className="w-6 h-6"
              size="sm"
              variant="light"
              onPress={() => setIsExpanded(true)}
            >
              <CaretDown size={12} />
            </Button>
          )}
          {isExpanded && (
            <Button
              isIconOnly
              className="w-6 h-6"
              size="sm"
              variant="light"
              onPress={() => setIsExpanded(false)}
            >
              <CaretUp size={12} />
            </Button>
          )}
          <CanCreateBoards fallback={null}>
            <Button
              isIconOnly
              className="w-6 h-6"
              size="sm"
              variant="light"
              onPress={handleCreateBoard}
            >
              <Plus size={14} />
            </Button>
          </CanCreateBoards>
        </div>
      </div>

      {/* Board Filter Tabs */}
      <BoardFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Loading State */}
      {isLoading && <BoardListSkeleton count={5} />}

      {/* Error State */}
      {isError && (
        <div className="text-center py-4">
          <p className="text-sm text-danger">Failed to load boards</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredBoards.length === 0 && (
        <BoardEmptyState
          activeFilter={activeFilter}
          onCreateBoard={handleCreateBoard}
        />
      )}

      {/* Board List */}
      <AnimatePresence>
        {!isLoading && !isError && filteredBoards.length > 0 && (
          <ScrollShadow className="max-h-[300px]" hideScrollBar={false}>
            <motion.div
              animate={{ opacity: 1 }}
              className="space-y-1 pr-2"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            >
              {displayedBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  isActionLoading={isActionLoading === board.id}
                  isSelected={currentBoardId === board.id}
                  onBoardAction={handleBoardAction}
                  onBoardClick={handleBoardClick}
                />
              ))}

              {/* Show more indicator */}
              {!isExpanded &&
                filteredBoards.length > displayedBoards.length && (
                  <ShowMoreButton
                    remainingCount={
                      filteredBoards.length - displayedBoards.length
                    }
                    onExpand={() => setIsExpanded(true)}
                  />
                )}
            </motion.div>
          </ScrollShadow>
        )}
      </AnimatePresence>

      {/* Delete Board Modal */}
      <DeleteBoardModal
        board={boardToDelete}
        isDeleting={deleteBoardMutation.isPending}
        isOpen={!!boardToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />

      {/* Edit Board Modal */}
      <EditBoardModal
        board={boardToEdit}
        isOpen={!!boardToEdit}
        onClose={handleCloseEditModal}
      />
    </div>
  );
};

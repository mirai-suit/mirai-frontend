import React from "react";
import { Button, useDisclosure } from "@heroui/react";
import { Plus } from "@phosphor-icons/react";

import { useGetColumnsForBoard } from "../api";

import { ColumnCard } from "./column-card";
import { ColumnListSkeleton } from "./column-skeleton";
import { CreateColumnModal } from "./create-column-modal";

interface ColumnListProps {
  boardId: string;
}

export const ColumnList: React.FC<ColumnListProps> = ({ boardId }) => {
  const createModal = useDisclosure();
  const { data, isLoading, error } = useGetColumnsForBoard(boardId);

  if (isLoading) {
    return <ColumnListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-danger">
            Failed to load columns
          </p>
          <p className="text-default-600">
            There was an error loading the columns for this board.
          </p>
        </div>
      </div>
    );
  }

  const columns = data?.columns || [];

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <ColumnCard key={column.id} column={column} />
        ))}

        {/* Add column button */}
        <div className="w-72 flex-shrink-0">
          <Button
            className="w-full h-16 border-dashed border-2 justify-center"
            startContent={<Plus className="h-5 w-5" />}
            variant="bordered"
            onPress={createModal.onOpen}
          >
            Add a column
          </Button>
        </div>
      </div>

      <CreateColumnModal
        boardId={boardId}
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
      />
    </>
  );
};

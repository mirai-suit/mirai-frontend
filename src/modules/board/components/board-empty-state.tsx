import React from "react";
import { Button } from "@heroui/react";
import { Folder } from "@phosphor-icons/react";

interface BoardEmptyStateProps {
  activeFilter: "recent" | "all" | "archived";
  onCreateBoard: () => void;
}

export const BoardEmptyState: React.FC<BoardEmptyStateProps> = ({
  activeFilter,
  onCreateBoard,
}) => {
  return (
    <div className="text-center py-6">
      <div className="space-y-2">
        <Folder className="mx-auto text-default-300" size={32} />
        <p className="text-sm text-default-500">
          {activeFilter === "archived" ? "No archived boards" : "No boards yet"}
        </p>
        {activeFilter !== "archived" && (
          <Button
            color="primary"
            size="sm"
            variant="flat"
            onPress={onCreateBoard}
          >
            Create your first board
          </Button>
        )}
      </div>
    </div>
  );
};

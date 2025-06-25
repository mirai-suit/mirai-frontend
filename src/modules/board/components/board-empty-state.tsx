import React from "react";
import { Button } from "@heroui/react";
import { Folder } from "@phosphor-icons/react";

import { CanCreateBoards } from "@/components/role-based-access";

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
          <CanCreateBoards
            fallback={
              <p className="text-xs text-default-400">
                You don&apos;t have permission to create boards
              </p>
            }
          >
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onPress={onCreateBoard}
            >
              Create your first board
            </Button>
          </CanCreateBoards>
        )}
      </div>
    </div>
  );
};

import type { Board } from "../types";

import React from "react";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { Users } from "@phosphor-icons/react";

import { BoardActions } from "./board-actions";

interface BoardCardProps {
  board: Board;
  isSelected: boolean;
  isActionLoading: boolean;
  onBoardClick: (board: Board) => void;
  onBoardAction: (action: string, boardId: string) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  board,
  isSelected,
  isActionLoading,
  onBoardClick,
  onBoardAction,
}) => {
  return (
    <motion.div
      key={board.id}
      layout
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      initial={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`relative group rounded-lg transition-colors ${
          isSelected ? "bg-primary/10" : "hover:bg-default-50"
        }`}
      >
        <Button
          className="w-full justify-start gap-3 h-auto p-2 relative"
          variant="light"
          onPress={() => onBoardClick(board)}
        >
          <div
            className="w-4 h-4 rounded-sm flex-shrink-0"
            style={{ backgroundColor: board.color }}
          />
          <div className="flex-1 text-left">
            <p className="text-xs font-medium truncate">{board.title}</p>
            <div className="flex items-center gap-2 text-[0.70rem] text-default-400">
              {board.accessList && board.accessList.length > 0 && (
                <>
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {board.accessList.length}
                  </span>
                </>
              )}
            </div>
          </div>
        </Button>

        {/* Action Dropdown */}
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <BoardActions
            board={board}
            isLoading={isActionLoading}
            onAction={onBoardAction}
          />
        </div>
      </div>
    </motion.div>
  );
};

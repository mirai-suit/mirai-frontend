import type { Board } from "../types";

import React from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  DotsThree,
  PencilSimple,
  Share,
  Archive,
  Trash,
} from "@phosphor-icons/react";

interface BoardActionsProps {
  board: Board;
  isLoading: boolean;
  onAction: (action: string, boardId: string) => void;
}

export const BoardActions: React.FC<BoardActionsProps> = ({
  board,
  isLoading,
  onAction,
}) => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          className="w-6 h-6 min-w-6"
          isLoading={isLoading}
          size="sm"
          variant="light"
        >
          <DotsThree size={14} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu onAction={(key) => onAction(key as string, board.id)}>
        <DropdownItem key="edit" startContent={<PencilSimple size={14} />}>
          Edit Board
        </DropdownItem>
        <DropdownItem key="share" startContent={<Share size={14} />}>
          Share Board
        </DropdownItem>
        <DropdownItem
          key={board.isArchived ? "unarchive" : "archive"}
          startContent={<Archive size={14} />}
        >
          {board.isArchived ? "Unarchive" : "Archive"} Board
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<Trash size={14} />}
        >
          Delete Board
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

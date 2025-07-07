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

import { useBoardPermissionStore } from "@/store/useBoardPermissionStore";

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
  const { canEditBoard, canDeleteBoard, hasBoardPermission } =
    useBoardPermissionStore();

  // Check permissions for different actions
  const canEdit = canEditBoard();
  const canArchive = hasBoardPermission("canArchiveBoard");
  const canDelete = canDeleteBoard();

  // Build menu items array based on permissions
  const menuItems = [
    ...(canEdit
      ? [
          <DropdownItem key="edit" startContent={<PencilSimple size={14} />}>
            Edit Board
          </DropdownItem>,
        ]
      : []),
    <DropdownItem key="share" startContent={<Share size={14} />}>
      Share Board
    </DropdownItem>,
    ...(canArchive
      ? [
          <DropdownItem
            key={board.isArchived ? "unarchive" : "archive"}
            startContent={<Archive size={14} />}
          >
            {board.isArchived ? "Unarchive" : "Archive"} Board
          </DropdownItem>,
        ]
      : []),
    ...(canDelete
      ? [
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            startContent={<Trash size={14} />}
          >
            Delete Board
          </DropdownItem>,
        ]
      : []),
  ];

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
        {menuItems}
      </DropdownMenu>
    </Dropdown>
  );
};

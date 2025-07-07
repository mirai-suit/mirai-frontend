import { BoardRole } from "@/types/board";
import { Board, BoardAccess } from "@/modules/board/types";

/**
 * Extract the current user's board role from the board's access list
 */
export function getUserBoardRole(
  board: Board | null | undefined,
  userId: string | undefined
): BoardRole | null {
  if (!board || !userId || !board.accessList) {
    return null;
  }

  const userAccess = board.accessList.find(
    (access) => access.userId === userId
  );
  return userAccess ? userAccess.accessRole : null;
}

/**
 * Check if a user has access to a board
 */
export function hasUserBoardAccess(
  board: Board | null | undefined,
  userId: string | undefined
): boolean {
  return getUserBoardRole(board, userId) !== null;
}

/**
 * Get all board members with their roles
 */
export function getBoardMembers(
  board: Board | null | undefined
): BoardAccess[] {
  if (!board || !board.accessList) {
    return [];
  }

  return board.accessList;
}

/**
 * Count board members by role
 */
export function getBoardMemberCount(board: Board | null | undefined): {
  total: number;
  owners: number;
  admins: number;
  editors: number;
  viewers: number;
} {
  const members = getBoardMembers(board);

  return {
    total: members.length,
    owners: members.filter((m) => m.accessRole === BoardRole.OWNER).length,
    admins: members.filter((m) => m.accessRole === BoardRole.ADMIN).length,
    editors: members.filter((m) => m.accessRole === BoardRole.EDITOR).length,
    viewers: members.filter((m) => m.accessRole === BoardRole.VIEWER).length,
  };
}

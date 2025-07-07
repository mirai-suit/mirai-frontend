import { useEffect } from "react";
import { useBoardPermissionStore } from "@/store/useBoardPermissionStore";
import { getUserBoardRole } from "@/utils/boardPermissions";
import { BoardRole } from "@/types/board";
import { Board } from "@/modules/board/types";
import { useAuthStore } from "@/modules/auth/store";

/**
 * Hook to automatically set board permissions context when viewing a board
 * Extracts user role from board.accessList and sets permission context
 */
export const useBoardPermissions = (board: Board | null | undefined) => {
  const { setBoardContext, clearBoardContext } = useBoardPermissionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (board && user?.id) {
      const userRole = getUserBoardRole(board, user.id);
      setBoardContext(board.id, userRole);

      console.log(`🛡️ Board permissions set for "${board.title}":`, {
        boardId: board.id,
        userRole,
        userId: user.id,
        hasAccess: userRole !== null,
      });
    } else {
      clearBoardContext();
      console.log("🛡️ Board permissions cleared");
    }

    // Cleanup when component unmounts or board changes
    return () => {
      if (!board) {
        clearBoardContext();
      }
    };
  }, [board?.id, user?.id, setBoardContext, clearBoardContext]);

  // Return current permission state for convenience
  const {
    currentBoardRole,
    currentBoardPermissions,
    canViewBoard,
    canEditBoard,
    canAdminBoard,
    canDeleteBoard,
    canManageAccess,
    canCreateTasks,
    canManageColumns,
  } = useBoardPermissionStore();

  return {
    currentBoardRole,
    currentBoardPermissions,
    canViewBoard: canViewBoard(),
    canEditBoard: canEditBoard(),
    canAdminBoard: canAdminBoard(),
    canDeleteBoard: canDeleteBoard(),
    canManageAccess: canManageAccess(),
    canCreateTasks: canCreateTasks(),
    canManageColumns: canManageColumns(),
    hasAccess: currentBoardRole !== null,
  };
};

/**
 * Hook to manually set board permissions (for backwards compatibility)
 */
export const useBoardPermissionsManual = (
  boardId: string | null,
  userRole?: BoardRole | null
) => {
  const { setBoardContext, clearBoardContext } = useBoardPermissionStore();

  useEffect(() => {
    if (boardId && userRole) {
      setBoardContext(boardId, userRole);
    } else {
      clearBoardContext();
    }

    return () => {
      clearBoardContext();
    };
  }, [boardId, userRole, setBoardContext, clearBoardContext]);
};

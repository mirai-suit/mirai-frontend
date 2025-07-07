import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  BoardRole,
  BoardPermissions,
  getPermissionsForBoardRole,
  hasBoardPermission,
} from "@/types/board";

interface BoardPermissionState {
  // Current board context
  currentBoardId: string | null;
  currentBoardRole: BoardRole | null;
  currentBoardPermissions: BoardPermissions | null;

  // Actions
  setBoardContext: (boardId: string | null, role: BoardRole | null) => void;
  clearBoardContext: () => void;

  // Permission helpers
  hasBoardPermission: (permission: keyof BoardPermissions) => boolean;
  hasMinimumRole: (minRole: BoardRole) => boolean;

  // Convenience helpers
  canViewBoard: () => boolean;
  canEditBoard: () => boolean;
  canAdminBoard: () => boolean;
  canDeleteBoard: () => boolean;
  canManageAccess: () => boolean;
  canManageTeams: () => boolean;
  canCreateTasks: () => boolean;
  canDeleteTasks: () => boolean;
  canManageColumns: () => boolean;
  canManageSettings: () => boolean;
}

export const useBoardPermissionStore = create<BoardPermissionState>()(
  devtools(
    (set, get) => ({
      // State
      currentBoardId: null,
      currentBoardRole: null,
      currentBoardPermissions: null,

      // Actions
      setBoardContext: (boardId, role) => {
        const permissions = role ? getPermissionsForBoardRole(role) : null;
        set({
          currentBoardId: boardId,
          currentBoardRole: role,
          currentBoardPermissions: permissions,
        });
      },

      clearBoardContext: () =>
        set({
          currentBoardId: null,
          currentBoardRole: null,
          currentBoardPermissions: null,
        }),

      // Permission helpers
      hasBoardPermission: (permission) => {
        const { currentBoardRole } = get();
        return hasBoardPermission(currentBoardRole, permission);
      },

      hasMinimumRole: (minRole) => {
        const { currentBoardRole } = get();
        if (!currentBoardRole) return false;

        const roleHierarchy = {
          [BoardRole.VIEWER]: 1,
          [BoardRole.EDITOR]: 2,
          [BoardRole.ADMIN]: 3,
          [BoardRole.OWNER]: 4,
        };

        return roleHierarchy[currentBoardRole] >= roleHierarchy[minRole];
      },

      // Convenience helpers
      canViewBoard: () => get().hasBoardPermission("canView"),
      canEditBoard: () => get().hasBoardPermission("canEdit"),
      canAdminBoard: () => get().hasBoardPermission("canAdmin"),
      canDeleteBoard: () => get().hasBoardPermission("canDelete"),
      canManageAccess: () => get().hasBoardPermission("canManageAccess"),
      canManageTeams: () => get().hasBoardPermission("canManageTeams"),
      canCreateTasks: () => get().hasBoardPermission("canCreateTasks"),
      canDeleteTasks: () => get().hasBoardPermission("canDeleteTasks"),
      canManageColumns: () => get().hasBoardPermission("canManageColumns"),
      canManageSettings: () => get().hasBoardPermission("canManageSettings"),
    }),
    {
      name: "board-permission-store",
    }
  )
);

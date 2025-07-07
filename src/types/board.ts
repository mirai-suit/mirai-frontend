// Board Role Enum - matching backend
export enum BoardRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
}

// Board Permissions Interface
export interface BoardPermissions {
  // Basic access
  canView: boolean;
  canEdit: boolean;
  canAdmin: boolean;
  canDelete: boolean;

  // Access management
  canManageAccess: boolean;
  canManageTeams: boolean;

  // Content permissions
  canCreateTasks: boolean;
  canDeleteTasks: boolean;
  canManageColumns: boolean;
  canManageSettings: boolean;

  // Advanced permissions
  canArchiveBoard: boolean;
  canTransferOwnership: boolean;
}

// Role Permission Mapping
export const BOARD_ROLE_PERMISSIONS: Record<BoardRole, BoardPermissions> = {
  [BoardRole.OWNER]: {
    canView: true,
    canEdit: true,
    canAdmin: true,
    canDelete: true,
    canManageAccess: true,
    canManageTeams: true,
    canCreateTasks: true,
    canDeleteTasks: true,
    canManageColumns: true,
    canManageSettings: true,
    canArchiveBoard: true,
    canTransferOwnership: true,
  },
  [BoardRole.ADMIN]: {
    canView: true,
    canEdit: true,
    canAdmin: true,
    canDelete: false,
    canManageAccess: true,
    canManageTeams: true,
    canCreateTasks: true,
    canDeleteTasks: true,
    canManageColumns: true,
    canManageSettings: true,
    canArchiveBoard: true,
    canTransferOwnership: false,
  },
  [BoardRole.EDITOR]: {
    canView: true,
    canEdit: true,
    canAdmin: false,
    canDelete: false,
    canManageAccess: false,
    canManageTeams: false,
    canCreateTasks: true,
    canDeleteTasks: false,
    canManageColumns: false,
    canManageSettings: false,
    canArchiveBoard: false,
    canTransferOwnership: false,
  },
  [BoardRole.VIEWER]: {
    canView: true,
    canEdit: false,
    canAdmin: false,
    canDelete: false,
    canManageAccess: false,
    canManageTeams: false,
    canCreateTasks: false,
    canDeleteTasks: false,
    canManageColumns: false,
    canManageSettings: false,
    canArchiveBoard: false,
    canTransferOwnership: false,
  },
};

// Helper functions
export function getPermissionsForBoardRole(role: BoardRole): BoardPermissions {
  return BOARD_ROLE_PERMISSIONS[role];
}

export function hasBoardPermission(
  role: BoardRole | null,
  permission: keyof BoardPermissions
): boolean {
  if (!role) return false;
  return BOARD_ROLE_PERMISSIONS[role][permission];
}

export function canPerformBoardAction(
  userRole: BoardRole | null,
  requiredPermission: keyof BoardPermissions
): boolean {
  if (!userRole) return false;
  return hasBoardPermission(userRole, requiredPermission);
}

// Role hierarchy helpers
export function hasMinimumBoardRole(
  userRole: BoardRole | null,
  minRole: BoardRole
): boolean {
  if (!userRole) return false;

  const roleHierarchy = {
    [BoardRole.VIEWER]: 1,
    [BoardRole.EDITOR]: 2,
    [BoardRole.ADMIN]: 3,
    [BoardRole.OWNER]: 4,
  };

  return roleHierarchy[userRole] >= roleHierarchy[minRole];
}

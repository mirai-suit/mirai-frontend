import React from "react";
import { useBoardPermissionStore } from "@/store/useBoardPermissionStore";
import { BoardRole, BoardPermissions } from "@/types/board";

interface WithBoardPermissionProps {
  permission: keyof BoardPermissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  boardId?: string; // Optional specific board context
}

/**
 * HOC component that conditionally renders children based on board permissions
 *
 * @example
 * <WithBoardPermission permission="canEdit">
 *   <EditButton />
 * </WithBoardPermission>
 */
export const WithBoardPermission: React.FC<WithBoardPermissionProps> = ({
  permission,
  children,
  fallback = null,
  boardId,
}) => {
  const { hasBoardPermission, currentBoardId } = useBoardPermissionStore();

  // If a specific boardId is provided, we need to check if it matches current context
  // For now, we'll use the current board context
  // TODO: In future, we could extend this to check permissions for any board
  if (boardId && boardId !== currentBoardId) {
    console.warn(
      `WithBoardPermission: No permission context for board ${boardId}`
    );
    return <>{fallback}</>;
  }

  const hasRequiredPermission = hasBoardPermission(permission);

  return hasRequiredPermission ? <>{children}</> : <>{fallback}</>;
};

interface WithBoardRoleProps {
  allowedRoles: BoardRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireMinimum?: boolean; // If true, uses role hierarchy (e.g., ADMIN allows OWNER actions)
}

/**
 * HOC component that conditionally renders children based on board role
 *
 * @example
 * <WithBoardRole allowedRoles={[BoardRole.ADMIN, BoardRole.OWNER]}>
 *   <AdminPanel />
 * </WithBoardRole>
 */
export const WithBoardRole: React.FC<WithBoardRoleProps> = ({
  allowedRoles,
  children,
  fallback = null,
  requireMinimum = false,
}) => {
  const { currentBoardRole, hasMinimumRole } = useBoardPermissionStore();

  if (!currentBoardRole) {
    return <>{fallback}</>;
  }

  let hasAllowedRole = false;

  if (requireMinimum) {
    // Check if user has minimum required role (using hierarchy)
    const minRole = allowedRoles.reduce((min, role) => {
      const roleHierarchy = {
        [BoardRole.VIEWER]: 1,
        [BoardRole.EDITOR]: 2,
        [BoardRole.ADMIN]: 3,
        [BoardRole.OWNER]: 4,
      };
      return roleHierarchy[role] < roleHierarchy[min] ? role : min;
    });
    hasAllowedRole = hasMinimumRole(minRole);
  } else {
    // Exact role match
    hasAllowedRole = allowedRoles.includes(currentBoardRole);
  }

  return hasAllowedRole ? <>{children}</> : <>{fallback}</>;
};

// Convenience components for common board permissions
export const CanViewBoard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission permission="canView" fallback={fallback}>
    {children}
  </WithBoardPermission>
);

export const CanEditBoard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission permission="canEdit" fallback={fallback}>
    {children}
  </WithBoardPermission>
);

export const CanAdminBoard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission permission="canAdmin" fallback={fallback}>
    {children}
  </WithBoardPermission>
);

export const CanDeleteBoard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission permission="canDelete" fallback={fallback}>
    {children}
  </WithBoardPermission>
);

export const CanManageBoardAccess: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission permission="canManageAccess" fallback={fallback}>
    {children}
  </WithBoardPermission>
);

export const CanCreateTasks: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission permission="canCreateTasks" fallback={fallback}>
    {children}
  </WithBoardPermission>
);

export const CanManageColumns: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission permission="canManageColumns" fallback={fallback}>
    {children}
  </WithBoardPermission>
);

// Role-based convenience components
export const BoardOwnerOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardRole allowedRoles={[BoardRole.OWNER]} fallback={fallback}>
    {children}
  </WithBoardRole>
);

export const BoardAdminOrOwner: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardRole
    allowedRoles={[BoardRole.ADMIN, BoardRole.OWNER]}
    fallback={fallback}
  >
    {children}
  </WithBoardRole>
);

export const BoardEditorOrAbove: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardRole
    allowedRoles={[BoardRole.EDITOR]}
    requireMinimum={true}
    fallback={fallback}
  >
    {children}
  </WithBoardRole>
);

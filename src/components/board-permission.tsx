import React from "react";

import { BoardRole, BoardPermissions } from "@/types/board";
import { useBoardPermissionStore } from "@/store/useBoardPermissionStore";

interface WithBoardPermissionProps {
  permission: keyof BoardPermissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireBoard?: boolean; // Whether board context is required
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
  requireBoard = true,
}) => {
  const { hasBoardPermission, currentBoardId, currentBoardRole } =
    useBoardPermissionStore();

  // Debug logging
  React.useEffect(() => {
    console.log(`🔍 WithBoardPermission Debug for "${permission}":`);
    console.log("Current Board ID:", currentBoardId);
    console.log("Current Board Role:", currentBoardRole);
    console.log("Require Board:", requireBoard);
    console.log("Has Permission:", hasBoardPermission(permission));
  }, [
    permission,
    currentBoardId,
    currentBoardRole,
    requireBoard,
    hasBoardPermission,
  ]);

  // If board context is required but not available
  if (requireBoard && !currentBoardId) {
    console.log(`❌ WithBoardPermission: No board context for "${permission}"`);
    return <>{fallback}</>;
  }

  // Check if user has the required permission
  const hasRequiredPermission = hasBoardPermission(permission);

  console.log(
    `${hasRequiredPermission ? "✅" : "❌"} WithBoardPermission: "${permission}" result:`,
    hasRequiredPermission
  );

  return hasRequiredPermission ? <>{children}</> : <>{fallback}</>;
};

interface WithBoardRoleProps {
  allowedRoles: BoardRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireBoard?: boolean;
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
  requireBoard = true,
}) => {
  const { currentBoardRole, currentBoardId } = useBoardPermissionStore();

  // If board context is required but not available
  if (requireBoard && !currentBoardId) {
    return <>{fallback}</>;
  }

  // Check if user's role is in the allowed roles
  const hasAllowedRole =
    currentBoardRole && allowedRoles.includes(currentBoardRole);

  return hasAllowedRole ? <>{children}</> : <>{fallback}</>;
};

interface WithMinimumBoardRoleProps {
  minRole: BoardRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireBoard?: boolean;
}

/**
 * HOC component that requires minimum board role
 *
 * @example
 * <WithMinimumBoardRole minRole={BoardRole.EDITOR}>
 *   <EditButton />
 * </WithMinimumBoardRole>
 */
export const WithMinimumBoardRole: React.FC<WithMinimumBoardRoleProps> = ({
  minRole,
  children,
  fallback = null,
  requireBoard = true,
}) => {
  const { hasMinimumRole, currentBoardId } = useBoardPermissionStore();

  // If board context is required but not available
  if (requireBoard && !currentBoardId) {
    return <>{fallback}</>;
  }

  // Check if user has minimum required role
  const hasRequiredRole = hasMinimumRole(minRole);

  return hasRequiredRole ? <>{children}</> : <>{fallback}</>;
};

interface BoardPermissionGateProps {
  permissions?: Array<keyof BoardPermissions>;
  roles?: BoardRole[];
  minRole?: BoardRole;
  requireAll?: boolean; // true = AND logic, false = OR logic
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireBoard?: boolean;
}

/**
 * Advanced board permission gate that supports multiple permissions and roles
 *
 * @example
 * <BoardPermissionGate
 *   permissions={["canEdit", "canManageAccess"]}
 *   requireAll={false}
 * >
 *   <AdminToolbar />
 * </BoardPermissionGate>
 */
export const BoardPermissionGate: React.FC<BoardPermissionGateProps> = ({
  permissions = [],
  roles = [],
  minRole,
  requireAll = false,
  children,
  fallback = null,
  requireBoard = true,
}) => {
  const {
    hasBoardPermission,
    currentBoardRole,
    hasMinimumRole,
    currentBoardId,
  } = useBoardPermissionStore();

  // If board context is required but not available
  if (requireBoard && !currentBoardId) {
    return <>{fallback}</>;
  }

  const checkPermissions = () => {
    if (permissions.length === 0 && roles.length === 0 && !minRole) return true;

    const results: boolean[] = [];

    // Check permissions
    if (permissions.length > 0) {
      results.push(
        ...permissions.map((permission) => hasBoardPermission(permission))
      );
    }

    // Check specific roles
    if (roles.length > 0) {
      results.push(currentBoardRole ? roles.includes(currentBoardRole) : false);
    }

    // Check minimum role
    if (minRole) {
      results.push(hasMinimumRole(minRole));
    }

    return requireAll
      ? results.every(Boolean) // All must be true
      : results.some(Boolean); // At least one must be true
  };

  return checkPermissions() ? <>{children}</> : <>{fallback}</>;
};

// Convenience components for common board use cases
export const BoardViewerOrAbove: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithMinimumBoardRole minRole={BoardRole.VIEWER} fallback={fallback}>
    {children}
  </WithMinimumBoardRole>
);

export const BoardEditorOrAbove: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithMinimumBoardRole minRole={BoardRole.EDITOR} fallback={fallback}>
    {children}
  </WithMinimumBoardRole>
);

export const BoardAdminOrAbove: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithMinimumBoardRole minRole={BoardRole.ADMIN} fallback={fallback}>
    {children}
  </WithMinimumBoardRole>
);

export const BoardOwnerOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardRole allowedRoles={[BoardRole.OWNER]} fallback={fallback}>
    {children}
  </WithBoardRole>
);

export const CanEditBoard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission fallback={fallback} permission="canEdit">
    {children}
  </WithBoardPermission>
);

export const CanManageBoardAccess: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission fallback={fallback} permission="canManageAccess">
    {children}
  </WithBoardPermission>
);

export const CanDeleteBoard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission fallback={fallback} permission="canDelete">
    {children}
  </WithBoardPermission>
);

export const CanCreateTasks: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission fallback={fallback} permission="canCreateTasks">
    {children}
  </WithBoardPermission>
);

export const CanManageColumns: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithBoardPermission fallback={fallback} permission="canManageColumns">
    {children}
  </WithBoardPermission>
);

import type { OrganizationPermissions } from "@/types/organization";

import React from "react";

import { useOrgStore } from "@/store/useOrgStore";

interface WithPermissionProps {
  permission: keyof OrganizationPermissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireOrg?: boolean; // Whether organization context is required
}

/**
 * HOC component that conditionally renders children based on user permissions
 *
 * @example
 * <WithPermission permission="createBoards">
 *   <Button>Create Board</Button>
 * </WithPermission>
 */
export const WithPermission: React.FC<WithPermissionProps> = ({
  permission,
  children,
  fallback = null,
  requireOrg = true,
}) => {
  const { hasPermission, currentOrg, currentUserRole } = useOrgStore();

  // Debug logging
  React.useEffect(() => {
    console.log(`🔍 WithPermission Debug for "${permission}":`);
    console.log("Current Org:", currentOrg);
    console.log("Current User Role:", currentUserRole);
    console.log("Require Org:", requireOrg);
    console.log("Has Permission:", hasPermission(permission));
  }, [permission, currentOrg, currentUserRole, requireOrg, hasPermission]);

  // If organization context is required but not available
  if (requireOrg && !currentOrg) {
    console.log(`❌ WithPermission: No org context for "${permission}"`);

    return <>{fallback}</>;
  }

  // Check if user has the required permission
  const hasRequiredPermission = hasPermission(permission);

  console.log(
    `${hasRequiredPermission ? "✅" : "❌"} WithPermission: "${permission}" result:`,
    hasRequiredPermission,
  );

  return hasRequiredPermission ? <>{children}</> : <>{fallback}</>;
};

interface WithRoleProps {
  allowedRoles: Array<"ADMIN" | "EDITOR" | "MEMBER">;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireOrg?: boolean;
}

/**
 * HOC component that conditionally renders children based on user role
 *
 * @example
 * <WithRole allowedRoles={["ADMIN", "EDITOR"]}>
 *   <AdminPanel />
 * </WithRole>
 */
export const WithRole: React.FC<WithRoleProps> = ({
  allowedRoles,
  children,
  fallback = null,
  requireOrg = true,
}) => {
  const { currentUserRole, currentOrg } = useOrgStore();

  // If organization context is required but not available
  if (requireOrg && !currentOrg) {
    return <>{fallback}</>;
  }

  // Check if user's role is in the allowed roles
  const hasAllowedRole =
    currentUserRole && allowedRoles.includes(currentUserRole);

  return hasAllowedRole ? <>{children}</> : <>{fallback}</>;
};

interface PermissionGateProps {
  permissions?: Array<keyof OrganizationPermissions>;
  roles?: Array<"ADMIN" | "EDITOR" | "MEMBER">;
  requireAll?: boolean; // true = AND logic, false = OR logic
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireOrg?: boolean;
}

/**
 * Advanced permission gate that supports multiple permissions and roles
 *
 * @example
 * <PermissionGate
 *   permissions={["createBoards", "inviteUsers"]}
 *   requireAll={false}
 * >
 *   <AdminToolbar />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permissions = [],
  roles = [],
  requireAll = false,
  children,
  fallback = null,
  requireOrg = true,
}) => {
  const { hasPermission, currentUserRole, currentOrg } = useOrgStore();

  // If organization context is required but not available
  if (requireOrg && !currentOrg) {
    return <>{fallback}</>;
  }

  const checkPermissions = () => {
    if (permissions.length === 0 && roles.length === 0) return true;

    const permissionResults = permissions.map((permission) =>
      hasPermission(permission),
    );
    const roleResults = roles.map((role) => currentUserRole === role);

    const allResults = [...permissionResults, ...roleResults];

    return requireAll
      ? allResults.every(Boolean) // All must be true
      : allResults.some(Boolean); // At least one must be true
  };

  return checkPermissions() ? <>{children}</> : <>{fallback}</>;
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithRole allowedRoles={["ADMIN"]} fallback={fallback}>
    {children}
  </WithRole>
);

export const EditorOrAdmin: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithRole allowedRoles={["ADMIN", "EDITOR"]} fallback={fallback}>
    {children}
  </WithRole>
);

export const CanCreateBoards: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithPermission fallback={fallback} permission="createBoards">
    {children}
  </WithPermission>
);

export const CanInviteUsers: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithPermission fallback={fallback} permission="inviteUsers">
    {children}
  </WithPermission>
);

export const CanManageUsers: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <WithPermission fallback={fallback} permission="removeUsers">
    {children}
  </WithPermission>
);

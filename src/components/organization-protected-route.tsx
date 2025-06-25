import type { OrganizationPermissions } from "@/types/organization";

import React from "react";
import { Navigate, useParams } from "react-router-dom";

import { useOrgStore } from "@/store/useOrgStore";

interface OrganizationProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Array<keyof OrganizationPermissions>;
  requiredRoles?: Array<"ADMIN" | "EDITOR" | "MEMBER">;
  requireAll?: boolean; // true = AND logic, false = OR logic
  fallbackPath?: string;
}

/**
 * Protected route component that enforces organization membership and permissions
 *
 * @example
 * <OrganizationProtectedRoute requiredPermissions={["createBoards"]}>
 *   <CreateBoardPage />
 * </OrganizationProtectedRoute>
 */
export const OrganizationProtectedRoute: React.FC<
  OrganizationProtectedRouteProps
> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requireAll = false,
  fallbackPath = "/u/:userId", // Default fallback to user dashboard
}) => {
  const { orgId, userId } = useParams();
  const { currentOrg, currentUserRole, hasPermission, setCurrentOrgId } =
    useOrgStore();

  // Set current org if not already set
  React.useEffect(() => {
    if (orgId && (!currentOrg || currentOrg.id !== orgId)) {
      setCurrentOrgId(orgId);
    }
  }, [orgId, currentOrg, setCurrentOrgId]);

  // If no organization context and orgId is required
  if (orgId && !currentOrg) {
    // Show loading or redirect to org selection
    return <div>Loading organization...</div>;
  }

  // If no organization membership
  if (orgId && currentOrg && !currentUserRole) {
    const redirectPath = fallbackPath.replace(":userId", userId || "");

    return <Navigate replace to={redirectPath} />;
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0 || requiredRoles.length > 0) {
    const permissionResults = requiredPermissions.map((permission) =>
      hasPermission(permission)
    );
    const roleResults = requiredRoles.map((role) => currentUserRole === role);

    const allResults = [...permissionResults, ...roleResults];

    const hasAccess = requireAll
      ? allResults.every(Boolean) // All must be true
      : allResults.some(Boolean); // At least one must be true

    if (!hasAccess) {
      const redirectPath = fallbackPath.replace(":userId", userId || "");

      return <Navigate replace to={redirectPath} />;
    }
  }

  return <>{children}</>;
};

// Convenience wrapper for admin-only routes
export const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <OrganizationProtectedRoute requiredRoles={["ADMIN"]}>
    {children}
  </OrganizationProtectedRoute>
);

// Convenience wrapper for editor or admin routes
export const EditorOrAdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <OrganizationProtectedRoute requiredRoles={["ADMIN", "EDITOR"]}>
    {children}
  </OrganizationProtectedRoute>
);

// Convenience wrapper for routes that require board creation permission
export const CanCreateBoardsRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <OrganizationProtectedRoute requiredPermissions={["createBoards"]}>
    {children}
  </OrganizationProtectedRoute>
);

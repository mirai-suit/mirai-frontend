import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/modules/auth/store";

interface ProtectedRouteProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireVerified?: boolean;
}

export default function ProtectedRoute({
  requireAuth = true,
  requireAdmin: _requireAdmin = false,
  requireVerified: _requireVerified = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If not authenticated but authentication is required
  if (requireAuth && !isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/auth/login" />;
  }

  // If user is authenticated and trying to access auth pages (login/signup)
  if (
    isAuthenticated &&
    ["/auth/login", "/auth/register", "/login", "/register"].includes(
      location.pathname
    )
  ) {
    return <Navigate replace to="/dashboard" />;
  }

  return <Outlet />;
}

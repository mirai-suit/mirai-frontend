import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireVerified?: boolean;
}

export default function ProtectedRoute({
  requireAuth = true,
  requireAdmin = false,
  requireVerified = false,
}: ProtectedRouteProps) {
  //   const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const isAuthenticated = false;

  // If not authenticated but authentication is required
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  //   // If authenticated but admin access is required and user is not admin
  //   if (requireAdmin && !isAdmin) {
  //     return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  //   }

  // If email verification is required but user is not verified
  //   if (requireVerified && user && !user.isverified) {
  //     return <Navigate to="/verify-email" state={{ from: location }} replace />;
  //   }

  // If user is authenticated and trying to access auth pages (login/signup)
  if (
    isAuthenticated &&
    ["/auth/login", "/signup"].includes(location.pathname)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

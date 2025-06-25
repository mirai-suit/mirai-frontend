import DashboardLayout from "../components/dashboard-layout";
import DashboardHome from "../pages/home";

import ErrorPage from "@/components/error";
import ProtectedRoute from "@/components/protected-routes";
import { OrganizationProtectedRoute } from "@/components/organization-protected-route";
import { HeroUIProvider } from "@/providers/heroui-provider";
import { BoardPage } from "@/modules/board/pages/board";
import { OrganizationSettingsPage } from "@/modules/organization/pages/settings";

export const dashboardRoutes = {
  path: "u",
  element: (
    <HeroUIProvider>
      <ProtectedRoute requireAuth={true} />
    </HeroUIProvider>
  ),
  errorElement: <ErrorPage />,
  children: [
    {
      path: ":userId",
      element: <DashboardLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "",
          element: <DashboardHome />,
        },
        {
          path: "o/:orgId",
          element: (
            // Ensure user has access to the organization
            <OrganizationProtectedRoute>
              <DashboardHome /> {/* Organization dashboard */}
            </OrganizationProtectedRoute>
          ),
        },
        {
          path: "o/:orgId/b/:boardId",
          element: (
            // Board routes with organization context
            <OrganizationProtectedRoute>
              <BoardPage />
            </OrganizationProtectedRoute>
          ),
        },

        // Organization settings (Admin/Editor only for invites)
        {
          path: "o/:orgId/settings",
          element: (
            <OrganizationProtectedRoute>
              <OrganizationSettingsPage />
            </OrganizationProtectedRoute>
          ),
        },

        // Example: Member management (Admin only)
        {
          path: "o/:orgId/members",
          element: (
            <OrganizationProtectedRoute requiredPermissions={["removeUsers"]}>
              <div>Member Management (Admin Only)</div>
            </OrganizationProtectedRoute>
          ),
        },

        // Example: Board creation (Admin/Editor only)
        {
          path: "o/:orgId/create-board",
          element: (
            <OrganizationProtectedRoute requiredPermissions={["createBoards"]}>
              <div>Create Board (Admin/Editor Only)</div>
            </OrganizationProtectedRoute>
          ),
        },
      ],
    },
  ],
};

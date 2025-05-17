import ErrorPage from "@/components/error";
import ProtectedRoute from "@/components/protected-routes";
import DashboardLayout from "../components/dashboard-layout";
import DashboardHome from "../pages/home";
import { HeroUIProvider } from "@/providers/heroui-provider";

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
      ],
    },
  ],
};

import ErrorPage from "@/components/error";
import NotFoundPage from "@/components/not-found";
import { authRoutes } from "@/modules/auth/routes";
import { dashboardRoutes } from "@/modules/dashboard/routes";
import DefaultLayout from "@/modules/home/components/default-layout";
import IndexPage from "@/modules/home/pages";
import { HeroUIProvider } from "@/providers/heroui-provider";

export const routes = [
  {
    path: "/",
    element: (
      <HeroUIProvider>
        <DefaultLayout>
          <IndexPage />
        </DefaultLayout>
      </HeroUIProvider>
    ),
    errorElement: <ErrorPage />,
  },
  authRoutes,
  dashboardRoutes,
  {
    path: "*",
    element: (
      <DefaultLayout>
        <NotFoundPage />
      </DefaultLayout>
    ),
  },
];

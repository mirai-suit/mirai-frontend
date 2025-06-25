import { Outlet } from "react-router-dom";

import { AcceptInvitationPage } from "../pages/accept-invitation";

import ErrorPage from "@/components/error";
import { HeroUIProvider } from "@/providers/heroui-provider";

export const organizationRoutes = {
  path: "invite",
  element: (
    <HeroUIProvider>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    </HeroUIProvider>
  ),
  errorElement: <ErrorPage />,
  children: [
    {
      path: ":token",
      element: <AcceptInvitationPage />,
    },
  ],
};

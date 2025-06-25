import AuthLayout from "../components/auth-layout";
import LoginPage from "../pages/login";
import RegisterPage from "../pages/register";

import ErrorPage from "@/components/error";
import { HeroUIProvider } from "@/providers/heroui-provider";

export const authRoutes = {
  path: "/auth",
  element: (
    <HeroUIProvider>
      <AuthLayout />
    </HeroUIProvider>
  ),
  errorElement: <ErrorPage />,
  children: [
    {
      path: "login",
      element: <LoginPage />,
    },
    {
      path: "register",
      element: <RegisterPage />,
    },
  ],
};

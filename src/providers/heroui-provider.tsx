import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider as Provider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { ToastProvider } from "@heroui/react";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function HeroUIProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <Provider navigate={navigate} useHref={useHref}>
      <ToastProvider />
      {children}
    </Provider>
  );
}

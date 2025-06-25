import { Tabs, Tab } from "@heroui/react";
import { Tooltip } from "@heroui/tooltip";
import { Sun, Moon, Laptop } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useTheme } from "@heroui/use-theme";

import { useThemeStore } from "@/store/useThemeStore";

type ThemeTabsProps = {
  size?: "sm" | "md" | "lg";
};

export const ThemeTabs = ({ size }: ThemeTabsProps) => {
  const { setTheme: setGlobalTheme, theme } = useThemeStore();
  const { setTheme } = useTheme();
  const [selected, setSelected] = useState<"light" | "dark" | "system">(theme);

  useEffect(() => {
    setTheme(theme);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    setGlobalTheme(newTheme);
    setSelected(newTheme);
  };

  const iconMap: Record<"light" | "dark" | "system", React.ReactNode> = {
    light: <Sun className="size-4 md:size-5" />,
    dark: <Moon className="size-4 md:size-5" />,
    system: <Laptop className="size-4 md:size-5" />,
  };

  const tooltipMap: Record<"light" | "dark" | "system", string> = {
    light: "Light Mode",
    dark: "Dark Mode",
    system: "System Preferences",
  };

  return (
    <Tabs
      aria-label="Theme mode"
      classNames={{
        tabList: "gap-1 backdrop-blur-lg",
        tab: "px-1",
      }}
      selectedKey={selected}
      size={size || "md"}
      variant="solid"
      onSelectionChange={(key) =>
        handleThemeChange(key as "light" | "dark" | "system")
      }
    >
      {(["light", "dark", "system"] as const).map((mode) => (
        <Tab
          key={mode}
          title={<Tooltip content={tooltipMap[mode]}>{iconMap[mode]}</Tooltip>}
        />
      ))}
    </Tabs>
  );
};

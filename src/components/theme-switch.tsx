"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { Sun, Moon, Laptop } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { useTheme } from "@heroui/use-theme";

export const ThemeDropdown = () => {
  const { setTheme: setGlobalTheme, theme } = useThemeStore();
  const { setTheme } = useTheme();
  const [selected, setSelected] = useState<"light" | "dark" | "system">(theme);

  // Sync Zustand store with HeroUI's theme
  useEffect(() => {
    setTheme(theme);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    setGlobalTheme(newTheme);
    setSelected(newTheme);
  };

  const iconMap: Record<string, React.ReactNode> = {
    light: <Sun className="size-5" />,
    dark: <Moon className="size-5" />,
    system: <Laptop className="size-5" />,
  };

  return (
    <Dropdown size="sm">
      <DropdownTrigger>
        <Button isIconOnly variant="bordered">
          {iconMap[selected]}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Theme selection"
        variant="flat"
        selectionMode="single"
        selectedKeys={[selected]}
        onSelectionChange={(keys) => {
          const key = Array.from(keys)[0] as "light" | "dark" | "system";
          handleThemeChange(key);
        }}
      >
        <DropdownItem key="light" startContent={<Sun className="size-5" />}>
          Light
        </DropdownItem>
        <DropdownItem key="dark" startContent={<Moon className="size-5" />}>
          Dark
        </DropdownItem>
        <DropdownItem key="system" startContent={<Laptop className="size-5" />}>
          System
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

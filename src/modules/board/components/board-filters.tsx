import React from "react";
import { Tabs, Tab } from "@heroui/react";

interface BoardFiltersProps {
  activeFilter: "recent" | "all" | "archived";
  onFilterChange: (filter: "recent" | "all" | "archived") => void;
}

export const BoardFilters: React.FC<BoardFiltersProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  return (
    <Tabs
      classNames={{
        tabList: "gap-4 w-full relative rounded-none p-0",
        cursor: "w-full bg-primary",
        tab: "max-w-fit px-0 h-8",
        tabContent:
          "group-data-[selected=true]:text-primary text-xs font-medium",
      }}
      selectedKey={activeFilter}
      size="sm"
      variant="underlined"
      onSelectionChange={(key) => onFilterChange(key as typeof activeFilter)}
    >
      <Tab key="recent" title="Recent" />
      <Tab key="all" title="All" />
      <Tab key="archived" title="Archived" />
    </Tabs>
  );
};

import React from "react";
import {
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Badge,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import {
  FunnelSimple,
  User,
  Calendar,
  Flag,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";

import { useTaskFilterStore } from "../store/useTaskFilterStore";
import { TASK_PRIORITIES } from "../validations";
import { getActiveFilterCount } from "../utils/taskFilters";
import { TaskPriority } from "../types";

interface QuickFilterChipsProps {
  boardId: string;
  taskCount: number;
  filteredTaskCount: number;
}

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  boardId,
  taskCount,
  filteredTaskCount,
}) => {
  const {
    getBoardFilters,
    setAssignedToMe,
    setUnassigned,
    setPriorities,
    setDueDateFilter,
    setSorting,
    resetBoardFilters,
  } = useTaskFilterStore();

  const filters = getBoardFilters(boardId);
  const activeFilterCount = getActiveFilterCount(filters);
  const hasActiveFilters = activeFilterCount > 0;

  const toggleAssignedToMe = () => {
    setAssignedToMe(boardId, !filters.assignedToMe);
  };

  const toggleUnassigned = () => {
    setUnassigned(boardId, !filters.unassigned);
  };

  const togglePriority = (priority: string) => {
    const currentPriorities = filters.priorities;
    const newPriorities = currentPriorities.includes(priority as any)
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority as any];

    setPriorities(boardId, newPriorities);
  };

  const handleSortChange = (key: string) => {
    const [sortBy, sortOrder] = key.split("-");

    setSorting(boardId, sortBy as any, sortOrder as any);
  };

  const resetFilters = () => {
    resetBoardFilters(boardId);
  };

  return (
    <div className="mb-2">
      <Accordion
        className="px-0"
        defaultExpandedKeys={hasActiveFilters ? ["filters"] : []}
        variant="light"
      >
        <AccordionItem
          key="filters"
          aria-label="Filter Tasks"
          className="py-0"
          indicator={({ isOpen }) =>
            isOpen ? (
              <CaretUp className="h-3 w-3" />
            ) : (
              <CaretDown className="h-3 w-3" />
            )
          }
          title={
            <div className="flex items-center gap-2">
              <FunnelSimple className="h-4 w-4" />
              <span className="text-sm">Filters</span>
              {hasActiveFilters && (
                <Badge
                  color="primary"
                  content={activeFilterCount}
                  shape="circle"
                  size="sm"
                >
                  <span className="text-xs text-default-500 pr-2.5">
                    ({filteredTaskCount}/{taskCount})
                  </span>
                </Badge>
              )}
            </div>
          }
        >
          <div className="flex items-center gap-1 flex-wrap pb-2">
            {/* Assigned to Me Chip */}
            <Chip
              as={Button}
              className="cursor-pointer text-xs"
              color={filters.assignedToMe ? "primary" : "default"}
              size="sm"
              startContent={<User className="h-3 w-3" />}
              variant={filters.assignedToMe ? "solid" : "bordered"}
              onPress={toggleAssignedToMe}
            >
              Mine
            </Chip>

            {/* Unassigned Chip */}
            <Chip
              as={Button}
              className="cursor-pointer text-xs"
              color={filters.unassigned ? "warning" : "default"}
              size="sm"
              variant={filters.unassigned ? "solid" : "bordered"}
              onPress={toggleUnassigned}
            >
              Unassigned
            </Chip>

            {/* High Priority Only (most commonly used) */}
            <Chip
              as={Button}
              className="cursor-pointer text-xs"
              color={
                filters.priorities.includes("HIGHEST" as TaskPriority) ||
                filters.priorities.includes("HIGH" as TaskPriority)
                  ? "danger"
                  : "default"
              }
              size="sm"
              startContent={<Flag className="h-3 w-3" />}
              variant={
                filters.priorities.includes("HIGHEST" as TaskPriority) ||
                filters.priorities.includes("HIGH" as TaskPriority)
                  ? "solid"
                  : "bordered"
              }
              onPress={() => {
                const hasHighPriority =
                  filters.priorities.includes("HIGHEST" as TaskPriority) ||
                  filters.priorities.includes("HIGH" as TaskPriority);

                if (hasHighPriority) {
                  setPriorities(
                    boardId,
                    filters.priorities.filter(
                      (p) => p !== "HIGHEST" && p !== "HIGH"
                    )
                  );
                } else {
                  setPriorities(boardId, [
                    ...filters.priorities,
                    "HIGH" as TaskPriority,
                    "HIGHEST" as TaskPriority,
                  ]);
                }
              }}
            >
              High
            </Chip>

            {/* Overdue Filter */}
            <Chip
              as={Button}
              className="cursor-pointer text-xs"
              color={filters.dueDateFilter === "overdue" ? "danger" : "default"}
              size="sm"
              startContent={<Calendar className="h-3 w-3" />}
              variant={
                filters.dueDateFilter === "overdue" ? "solid" : "bordered"
              }
              onPress={() =>
                setDueDateFilter(
                  boardId,
                  filters.dueDateFilter === "overdue" ? "all" : "overdue"
                )
              }
            >
              Overdue
            </Chip>

            {/* More Filters Dropdown */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  className="h-6 min-w-unit-6"
                  size="sm"
                  variant="bordered"
                >
                  <FunnelSimple className="h-3 w-3" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="More filters"
                className="max-h-64 overflow-y-auto"
                closeOnSelect={false}
                variant="faded"
              >
                <DropdownSection showDivider title="Priority">
                  {TASK_PRIORITIES.map((priority) => (
                    <DropdownItem
                      key={`priority-${priority.value}`}
                      className="text-sm"
                      endContent={
                        filters.priorities.includes(priority.value as any) ? (
                          <span className="text-primary">✓</span>
                        ) : null
                      }
                      onPress={() => togglePriority(priority.value)}
                    >
                      {priority.label}
                    </DropdownItem>
                  ))}
                </DropdownSection>

                <DropdownSection showDivider title="Due Date">
                  <DropdownItem
                    key="today"
                    endContent={
                      filters.dueDateFilter === "today" ? (
                        <span className="text-primary">✓</span>
                      ) : null
                    }
                    onPress={() => setDueDateFilter(boardId, "today")}
                  >
                    Due Today
                  </DropdownItem>
                  <DropdownItem
                    key="thisWeek"
                    endContent={
                      filters.dueDateFilter === "thisWeek" ? (
                        <span className="text-primary">✓</span>
                      ) : null
                    }
                    onPress={() => setDueDateFilter(boardId, "thisWeek")}
                  >
                    This Week
                  </DropdownItem>
                  <DropdownItem
                    key="thisMonth"
                    endContent={
                      filters.dueDateFilter === "thisMonth" ? (
                        <span className="text-primary">✓</span>
                      ) : null
                    }
                    onPress={() => setDueDateFilter(boardId, "thisMonth")}
                  >
                    This Month
                  </DropdownItem>
                  <DropdownItem
                    key="noDueDate"
                    endContent={
                      filters.dueDateFilter === "noDueDate" ? (
                        <span className="text-primary">✓</span>
                      ) : null
                    }
                    onPress={() => setDueDateFilter(boardId, "noDueDate")}
                  >
                    No Due Date
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection title="Sort By">
                  <DropdownItem
                    key="priority-desc"
                    onPress={() => handleSortChange("priority-desc")}
                  >
                    Priority ↓
                  </DropdownItem>
                  <DropdownItem
                    key="dueDate-asc"
                    onPress={() => handleSortChange("dueDate-asc")}
                  >
                    Due Date ↑
                  </DropdownItem>
                  <DropdownItem
                    key="createdAt-desc"
                    onPress={() => handleSortChange("createdAt-desc")}
                  >
                    Newest First
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>

            {/* Reset Button (only show when filters are active) */}
            {hasActiveFilters && (
              <Button
                className="h-6 text-tiny min-w-unit-12"
                size="sm"
                variant="light"
                onPress={resetFilters}
              >
                Reset
              </Button>
            )}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

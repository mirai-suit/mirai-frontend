import React from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Chip,
  Badge,
  Input,
  Checkbox,
  CheckboxGroup,
  RadioGroup,
  Radio,
  Divider,
  Switch,
} from "@heroui/react";
import {
  FunnelSimple,
  MagnifyingGlass,
  SortAscending,
  SortDescending,
  X,
} from "@phosphor-icons/react";

import { useTaskFilterStore } from "../store/useTaskFilterStore";
import { TASK_PRIORITIES } from "../validations";
import { getActiveFilterCount } from "../utils/taskFilters";

import { useAuthStore } from "@/modules/auth/store";
import { useOrganizationMembers } from "@/modules/organization/api";
import { useOrgStore } from "@/store/useOrgStore";

interface ColumnFilterProps {
  columnId: string;
  taskCount: number;
  filteredTaskCount: number;
}

export const ColumnFilter: React.FC<ColumnFilterProps> = ({
  columnId,
  taskCount,
  filteredTaskCount,
}) => {
  const { user } = useAuthStore();
  const { currentOrg } = useOrgStore();
  const {
    filters,
    setFilters,
    resetFilters,
    setPriorities,
    setAssignedToMe,
    setUnassigned,
    setSpecificAssignees,
    setDueDateFilter,
    setSearchQuery,
    setSorting,
    isFiltersPanelOpen,
    toggleFiltersPanel,
  } = useTaskFilterStore();

  // Get organization members for assignee filtering
  const { data: membersResponse } = useOrganizationMembers(
    currentOrg?.id || ""
  );
  const organizationMembers = membersResponse?.members || [];

  const activeFilterCount = getActiveFilterCount(filters);
  const hasActiveFilters = activeFilterCount > 0;

  const handlePriorityChange = (selectedPriorities: string[]) => {
    setPriorities(selectedPriorities as any[]);
  };

  const handleAssigneeChange = (selectedAssignees: string[]) => {
    setSpecificAssignees(selectedAssignees);
  };

  const handleSortChange = (key: string) => {
    const [sortBy, sortOrder] = key.split("-");
    setSorting(sortBy as any, sortOrder as any);
  };

  return (
    <div className="flex items-center gap-2 mb-3">
      {/* Search Input */}
      <Input
        className="flex-1"
        placeholder="Search tasks..."
        size="sm"
        startContent={<MagnifyingGlass className="h-4 w-4 text-default-400" />}
        value={filters.searchQuery}
        variant="flat"
        onChange={(e) => setSearchQuery(e.target.value)}
        endContent={
          filters.searchQuery && (
            <Button
              isIconOnly
              className="h-6 w-6 min-w-unit-6"
              size="sm"
              variant="light"
              onPress={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )
        }
      />

      {/* Filter Dropdown */}
      <Badge
        color="primary"
        content={activeFilterCount}
        isInvisible={!hasActiveFilters}
        placement="top-right"
        shape="circle"
        size="sm"
      >
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              className={`${hasActiveFilters ? "border-primary text-primary" : ""}`}
              size="sm"
              variant="bordered"
            >
              <FunnelSimple className="h-4 w-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Filter options"
            className="w-80"
            closeOnSelect={false}
          >
            {/* Priority Filter */}
            <DropdownSection title="Priority">
              <DropdownItem key="priorities" className="p-0">
                <div className="p-3">
                  <CheckboxGroup
                    value={filters.priorities}
                    onChange={handlePriorityChange}
                  >
                    {TASK_PRIORITIES.map((priority) => (
                      <Checkbox key={priority.value} value={priority.value}>
                        <div className="flex items-center gap-2">
                          <Chip
                            color={priority.color as any}
                            size="sm"
                            variant="flat"
                          >
                            {priority.label}
                          </Chip>
                        </div>
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </div>
              </DropdownItem>
            </DropdownSection>

            <Divider />

            {/* Assignee Filter */}
            <DropdownSection title="Assignees">
              <DropdownItem key="assignee-me" className="p-0">
                <div className="p-3 space-y-2">
                  <Switch
                    isSelected={filters.assignedToMe}
                    onValueChange={setAssignedToMe}
                  >
                    Assigned to me
                  </Switch>
                  <Switch
                    isSelected={filters.unassigned}
                    onValueChange={setUnassigned}
                  >
                    Unassigned tasks
                  </Switch>
                </div>
              </DropdownItem>

              {organizationMembers.length > 0 && (
                <DropdownItem key="specific-assignees" className="p-0">
                  <div className="p-3">
                    <CheckboxGroup
                      value={filters.specificAssignees}
                      onChange={handleAssigneeChange}
                    >
                      {organizationMembers.map((member) => (
                        <Checkbox key={member.user.id} value={member.user.id}>
                          {member.user.firstName} {member.user.lastName}
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  </div>
                </DropdownItem>
              )}
            </DropdownSection>

            <Divider />

            {/* Due Date Filter */}
            <DropdownSection title="Due Date">
              <DropdownItem key="due-date" className="p-0">
                <div className="p-3">
                  <RadioGroup
                    value={filters.dueDateFilter}
                    onValueChange={(value) => setDueDateFilter(value as any)}
                  >
                    <Radio value="all">All tasks</Radio>
                    <Radio value="overdue">Overdue</Radio>
                    <Radio value="today">Due today</Radio>
                    <Radio value="thisWeek">Due this week</Radio>
                    <Radio value="thisMonth">Due this month</Radio>
                    <Radio value="noDueDate">No due date</Radio>
                  </RadioGroup>
                </div>
              </DropdownItem>
            </DropdownSection>

            <Divider />

            {/* Reset Filters */}
            {hasActiveFilters && (
              <DropdownItem key="reset" onPress={resetFilters}>
                <div className="text-danger">Reset all filters</div>
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </Badge>

      {/* Sort Dropdown */}
      <Dropdown>
        <DropdownTrigger>
          <Button
            isIconOnly
            size="sm"
            variant="bordered"
            startContent={
              filters.sortOrder === "asc" ? (
                <SortAscending className="h-4 w-4" />
              ) : (
                <SortDescending className="h-4 w-4" />
              )
            }
          />
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Sort options"
          selectedKeys={[`${filters.sortBy}-${filters.sortOrder}`]}
          onAction={handleSortChange}
        >
          <DropdownSection title="Sort by">
            <DropdownItem key="priority-desc">
              Priority (High to Low)
            </DropdownItem>
            <DropdownItem key="priority-asc">
              Priority (Low to High)
            </DropdownItem>
            <DropdownItem key="dueDate-asc">
              Due Date (Earliest first)
            </DropdownItem>
            <DropdownItem key="dueDate-desc">
              Due Date (Latest first)
            </DropdownItem>
            <DropdownItem key="createdAt-desc">
              Created (Newest first)
            </DropdownItem>
            <DropdownItem key="createdAt-asc">
              Created (Oldest first)
            </DropdownItem>
            <DropdownItem key="title-asc">Title (A to Z)</DropdownItem>
            <DropdownItem key="title-desc">Title (Z to A)</DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      {/* Task Count Display */}
      {hasActiveFilters && filteredTaskCount !== taskCount && (
        <div className="text-sm text-default-500">
          {filteredTaskCount} of {taskCount} tasks
        </div>
      )}
    </div>
  );
};

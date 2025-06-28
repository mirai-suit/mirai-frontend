import { Task, TaskPriority } from "../types";
import { TaskFilters } from "../store/useTaskFilterStore";

export const filterTasks = (
  tasks: Task[],
  filters: TaskFilters,
  currentUserId?: string
): Task[] => {
  let filteredTasks = [...tasks];

  // Priority filter
  if (filters.priorities.length > 0) {
    filteredTasks = filteredTasks.filter(
      (task) => task.priority && filters.priorities.includes(task.priority)
    );
  }

  // Status filter (if using status separate from column)
  if (filters.statuses.length > 0) {
    filteredTasks = filteredTasks.filter((task) =>
      filters.statuses.includes(task.status)
    );
  }

  // Assignee filters
  if (filters.assignedToMe && currentUserId) {
    filteredTasks = filteredTasks.filter((task) =>
      task.assignees.some((assignee) => assignee.id === currentUserId)
    );
  }

  if (filters.unassigned) {
    filteredTasks = filteredTasks.filter((task) => task.assignees.length === 0);
  }

  if (filters.specificAssignees.length > 0) {
    filteredTasks = filteredTasks.filter((task) =>
      task.assignees.some((assignee) =>
        filters.specificAssignees.includes(assignee.id)
      )
    );
  }

  // Due date filters
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const oneMonthFromNow = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  switch (filters.dueDateFilter) {
    case "overdue":
      filteredTasks = filteredTasks.filter(
        (task) => task.dueDate && new Date(task.dueDate) < today
      );
      break;
    case "today":
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate).toDateString() === today.toDateString()
      );
      break;
    case "thisWeek":
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate) >= today &&
          new Date(task.dueDate) <= oneWeekFromNow
      );
      break;
    case "thisMonth":
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate) >= today &&
          new Date(task.dueDate) <= oneMonthFromNow
      );
      break;
    case "noDueDate":
      filteredTasks = filteredTasks.filter((task) => !task.dueDate);
      break;
    // "all" - no filtering
  }

  // Search filter
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.assignees.some((assignee) =>
          `${assignee.firstName} ${assignee.lastName}`
            .toLowerCase()
            .includes(query)
        )
    );
  }

  return filteredTasks;
};

export const sortTasks = (
  tasks: Task[],
  sortBy: TaskFilters["sortBy"],
  sortOrder: TaskFilters["sortOrder"]
): Task[] => {
  const sorted = [...tasks].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "dueDate":
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        break;
      case "priority":
        // Convert priority to numeric value for sorting
        const priorityOrder: Record<TaskPriority, number> = {
          HIGHEST: 5,
          HIGH: 4,
          MEDIUM: 3,
          LOW: 2,
          LOWEST: 1,
        };
        aValue = a.priority ? priorityOrder[a.priority] : 0;
        bValue = b.priority ? priorityOrder[b.priority] : 0;
        break;
      case "createdAt":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
};

export const applyFiltersAndSort = (
  tasks: Task[],
  filters: TaskFilters,
  currentUserId?: string
): Task[] => {
  const filtered = filterTasks(tasks, filters, currentUserId);
  return sortTasks(filtered, filters.sortBy, filters.sortOrder);
};

// Helper to get active filter count (for UI badges)
export const getActiveFilterCount = (filters: TaskFilters): number => {
  let count = 0;

  if (filters.priorities.length > 0) count++;
  if (filters.statuses.length > 0) count++;
  if (filters.assignedToMe) count++;
  if (filters.unassigned) count++;
  if (filters.specificAssignees.length > 0) count++;
  if (filters.dueDateFilter !== "all") count++;
  if (filters.searchQuery.trim()) count++;

  return count;
};

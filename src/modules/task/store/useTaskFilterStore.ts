import { create } from "zustand";
import { persist } from "zustand/middleware";

import { TaskPriority, TaskStatus } from "../types";

export interface TaskFilters {
  // Priority filter
  priorities: TaskPriority[];

  // Status filter (if needed separately from columns)
  statuses: TaskStatus[];

  // Assignee filters
  assignedToMe: boolean;
  unassigned: boolean;
  specificAssignees: string[]; // user IDs

  // Due date filters
  dueDateFilter:
    | "all"
    | "overdue"
    | "today"
    | "thisWeek"
    | "thisMonth"
    | "noDueDate";

  // Search/text filter
  searchQuery: string;

  // Sorting
  sortBy: "dueDate" | "priority" | "createdAt" | "updatedAt" | "title";
  sortOrder: "asc" | "desc";
}

interface TaskFilterState {
  // Board-specific filters: boardId -> filters
  boardFilters: Record<string, TaskFilters>;
  isFiltersPanelOpen: boolean;
}

interface TaskFilterActions {
  // Board-specific filter management
  getBoardFilters: (boardId: string) => TaskFilters;
  setBoardFilters: (boardId: string, filters: Partial<TaskFilters>) => void;
  resetBoardFilters: (boardId: string) => void;

  // Individual filter setters (board-specific)
  setPriorities: (boardId: string, priorities: TaskPriority[]) => void;
  setAssignedToMe: (boardId: string, enabled: boolean) => void;
  setUnassigned: (boardId: string, enabled: boolean) => void;
  setSpecificAssignees: (boardId: string, assignees: string[]) => void;
  setDueDateFilter: (
    boardId: string,
    filter: TaskFilters["dueDateFilter"]
  ) => void;
  setSearchQuery: (boardId: string, query: string) => void;
  setSorting: (
    boardId: string,
    sortBy: TaskFilters["sortBy"],
    sortOrder: TaskFilters["sortOrder"]
  ) => void;

  // UI state
  toggleFiltersPanel: () => void;
  setFiltersPanelOpen: (open: boolean) => void;
}

const defaultFilters: TaskFilters = {
  priorities: [],
  statuses: [],
  assignedToMe: false,
  unassigned: false,
  specificAssignees: [],
  dueDateFilter: "all",
  searchQuery: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const initialState: TaskFilterState = {
  boardFilters: {},
  isFiltersPanelOpen: false,
};

type TaskFilterStore = TaskFilterState & TaskFilterActions;

export const useTaskFilterStore = create<TaskFilterStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Board-specific filter management
      getBoardFilters: (boardId: string) => {
        const state = get();

        return state.boardFilters[boardId] || defaultFilters;
      },

      setBoardFilters: (boardId: string, newFilters: Partial<TaskFilters>) =>
        set((state) => ({
          boardFilters: {
            ...state.boardFilters,
            [boardId]: {
              ...(state.boardFilters[boardId] || defaultFilters),
              ...newFilters,
            },
          },
        })),

      resetBoardFilters: (boardId: string) =>
        set((state) => ({
          boardFilters: {
            ...state.boardFilters,
            [boardId]: defaultFilters,
          },
        })),

      // Individual filter setters (board-specific)
      setPriorities: (boardId: string, priorities: TaskPriority[]) =>
        set((state) => ({
          boardFilters: {
            ...state.boardFilters,
            [boardId]: {
              ...(state.boardFilters[boardId] || defaultFilters),
              priorities,
            },
          },
        })),

      setAssignedToMe: (boardId: string, assignedToMe: boolean) =>
        set((state) => ({
          boardFilters: {
            ...state.boardFilters,
            [boardId]: {
              ...(state.boardFilters[boardId] || defaultFilters),
              assignedToMe,
            },
          },
        })),

      setUnassigned: (boardId: string, unassigned: boolean) =>
        set((state) => ({
          boardFilters: {
            ...state.boardFilters,
            [boardId]: {
              ...(state.boardFilters[boardId] || defaultFilters),
              unassigned,
            },
          },
        })),

      setSpecificAssignees: (boardId: string, specificAssignees: string[]) =>
        set((state) => ({
          boardFilters: {
            ...state.boardFilters,
            [boardId]: {
              ...(state.boardFilters[boardId] || defaultFilters),
              specificAssignees,
            },
          },
        })),

      setDueDateFilter: (
        boardId: string,
        dueDateFilter: TaskFilters["dueDateFilter"]
      ) =>
        set((state) => ({
          boardFilters: {
            ...state.boardFilters,
            [boardId]: {
              ...(state.boardFilters[boardId] || defaultFilters),
              dueDateFilter,
            },
          },
        })),

      setSearchQuery: (boardId: string, searchQuery: string) =>
        set((state) => ({
          boardFilters: {
            ...state.boardFilters,
            [boardId]: {
              ...(state.boardFilters[boardId] || defaultFilters),
              searchQuery,
            },
          },
        })),

      setSorting: (
        boardId: string,
        sortBy: TaskFilters["sortBy"],
        sortOrder: TaskFilters["sortOrder"]
      ) =>
        set((state) => ({
          boardFilters: {
            ...state.boardFilters,
            [boardId]: {
              ...(state.boardFilters[boardId] || defaultFilters),
              sortBy,
              sortOrder,
            },
          },
        })),

      // UI state
      toggleFiltersPanel: () =>
        set((state) => ({
          isFiltersPanelOpen: !state.isFiltersPanelOpen,
        })),

      setFiltersPanelOpen: (isFiltersPanelOpen: boolean) =>
        set({ isFiltersPanelOpen }),
    }),
    {
      name: "task-filter-store",
      partialize: (state) => ({
        boardFilters: state.boardFilters,
        // Don't persist UI state
      }),
    }
  )
);

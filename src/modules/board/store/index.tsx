import type { Board } from "../types";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Board-specific UI state
interface BoardState {
  // Current board being viewed
  currentBoard: Board | null;

  // Sidebar state for boards
  isBoardSidebarCollapsed: boolean;

  // Create board modal state
  isCreateBoardModalOpen: boolean;

  // Board view mode (list, grid, etc.)
  boardViewMode: "list" | "grid";

  // Board filter/search state
  boardSearchQuery: string;
  boardFilters: {
    showArchived: boolean;
    showTemplates: boolean;
    sortBy: "name" | "updated" | "created";
    sortOrder: "asc" | "desc";
  };
}

interface BoardActions {
  // Current board actions
  setCurrentBoard: (board: Board | null) => void;

  // Sidebar actions
  toggleBoardSidebar: () => void;
  setBoardSidebarCollapsed: (collapsed: boolean) => void;

  // Modal actions
  openCreateBoardModal: () => void;
  closeCreateBoardModal: () => void;

  // View mode actions
  setBoardViewMode: (mode: "list" | "grid") => void;

  // Search and filter actions
  setBoardSearchQuery: (query: string) => void;
  setBoardFilters: (filters: Partial<BoardState["boardFilters"]>) => void;
  clearBoardFilters: () => void;
}

type BoardStore = BoardState & BoardActions;

const initialState: BoardState = {
  currentBoard: null,
  isBoardSidebarCollapsed: false,
  isCreateBoardModalOpen: false,
  boardViewMode: "list",
  boardSearchQuery: "",
  boardFilters: {
    showArchived: false,
    showTemplates: false,
    sortBy: "updated",
    sortOrder: "desc",
  },
};

export const useBoardStore = create<BoardStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Current board actions
      setCurrentBoard: (board) => set({ currentBoard: board }),

      // Sidebar actions
      toggleBoardSidebar: () =>
        set((state) => ({
          isBoardSidebarCollapsed: !state.isBoardSidebarCollapsed,
        })),
      setBoardSidebarCollapsed: (collapsed) =>
        set({ isBoardSidebarCollapsed: collapsed }),

      // Modal actions
      openCreateBoardModal: () => set({ isCreateBoardModalOpen: true }),
      closeCreateBoardModal: () => set({ isCreateBoardModalOpen: false }),

      // View mode actions
      setBoardViewMode: (mode) => set({ boardViewMode: mode }),

      // Search and filter actions
      setBoardSearchQuery: (query) => set({ boardSearchQuery: query }),
      setBoardFilters: (filters) =>
        set((state) => ({
          boardFilters: { ...state.boardFilters, ...filters },
        })),
      clearBoardFilters: () =>
        set({
          boardFilters: initialState.boardFilters,
          boardSearchQuery: "",
        }),
    }),
    {
      name: "board-store",
      // Only persist certain parts of the state
      partialize: (state) => ({
        isBoardSidebarCollapsed: state.isBoardSidebarCollapsed,
        boardViewMode: state.boardViewMode,
        boardFilters: state.boardFilters,
      }),
    }
  )
);

// Re-export types from board module to maintain consistency
export type { Column, Task } from "../../board/types";
import type { Column } from "../../board/types";

export interface CreateColumnRequest {
  name: string;
  boardId: string;
  color?: string;
  order?: number;
}

export interface UpdateColumnRequest {
  columnId: string;
  name?: string;
  color?: string;
}

export interface ReorderColumnTasksRequest {
  orderedTaskIds: string[];
}

export interface ReorderColumnsRequest {
  boardId: string;
  columnIds: string[];
}

export interface ColumnApiResponse {
  success: boolean;
  column: Column;
}

export interface ColumnsApiResponse {
  success: boolean;
  columns: Column[];
}

export interface ColumnError {
  message: string;
  status?: number;
}

// Column colors (predefined options)
export const COLUMN_COLORS = [
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Lime", value: "#84CC16" },
  { name: "Green", value: "#22C55E" },
  { name: "Emerald", value: "#10B981" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Fuchsia", value: "#D946EF" },
  { name: "Pink", value: "#EC4899" },
  { name: "Rose", value: "#F43F5E" },
] as const;

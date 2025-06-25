// Board Types - matching backend DTOs for type safety

// Column Response DTO
export interface Column {
  id: string;
  name: string;
  color: string;
  order: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

// Task Response DTO (basic for now)
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  priority?: number;
  order?: number;
  columnId: string;
  boardId: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Team Response DTO (basic)
export interface Team {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Board Access Response DTO
export interface BoardAccess {
  id: string;
  userId: string;
  boardId: string;
  accessRole: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

// Main Board Response DTO
export interface Board {
  id: string;
  title: string;
  description?: string;
  color: string;
  coverImage?: string;
  organizationId: string;
  teamId?: string;
  isArchived: boolean;
  isPublic: boolean;
  isTemplate: boolean;
  isPrivate: boolean;
  isReadOnly: boolean;
  isShared: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  // Remove columns and tasks - they should be fetched separately
  team?: Team[];
  accessList?: BoardAccess[];
}

// API Response DTOs
export interface CreateBoardResponse {
  success: boolean;
  message?: string;
  board: Board;
}

export interface GetBoardResponse {
  success: boolean;
  board: Board;
}

export interface GetBoardsResponse {
  success: boolean;
  boards: Board[];
}

export interface UpdateBoardResponse {
  success: boolean;
  message?: string;
  board: Board;
}

export interface DeleteBoardResponse {
  success: boolean;
  message?: string;
  board: {
    id: string;
    title: string;
  };
}

export interface BoardAccessResponse {
  success: boolean;
  message?: string;
  access?: BoardAccess;
  removed?: BoardAccess;
}

// Error Response DTO (consistent across all endpoints)
export interface BoardErrorResponse {
  success: false;
  message: string;
  statusCode?: number;
}

// Form types for creating/updating boards
export interface CreateBoardForm {
  title: string;
  description?: string;
  color?: string;
  coverImage?: string;
  defaultColumns?: string[];
  organizationId: string;
}

export interface UpdateBoardForm {
  title?: string;
  description?: string;
  color?: string;
  coverImage?: string;
  isArchived?: boolean;
  isPublic?: boolean;
  isTemplate?: boolean;
  isPrivate?: boolean;
  isReadOnly?: boolean;
  isShared?: boolean;
  isDefault?: boolean;
}

// UI State types
export interface BoardListItem {
  id: string;
  title: string;
  color: string;
  columnCount: number;
  taskCount: number;
  updatedAt: string;
}

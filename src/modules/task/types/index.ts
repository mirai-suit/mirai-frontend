// Task Status Enum - matching backend
export type TaskStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "CANCELLED"
  | "CUSTOM";

// Task Priority Enum - matching backend
export type TaskPriority = "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";

// Task Assignee
export interface TaskAssignee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

// Task Column Info
export interface TaskColumn {
  id: string;
  name: string;
  color: string;
  order: number;
}

// Task Board Info
export interface TaskBoard {
  id: string;
  title: string;
  color: string;
  organizationId: string;
}

// Task Team Info
export interface TaskTeam {
  id: string;
  name: string;
}

// Task Attachment
export interface TaskAttachment {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  fileType: "VOICE_NOTE" | "IMAGE" | "DOCUMENT" | "VIDEO" | "OTHER";
  downloadUrl?: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

// Base Task (minimal data)
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  customStatus?: string;
  startDate?: string;
  dueDate?: string;
  priority?: TaskPriority;
  order: number;
  isRecurring: boolean;
  boardId: string;
  columnId: string;
  teamId?: string;
  assignees: TaskAssignee[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Detailed Task (with relations)
export interface TaskDetail extends Task {
  column: TaskColumn;
  board?: TaskBoard;
  team?: TaskTeam;
  attachments?: TaskAttachment[];
}

// API Request Types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  customStatus?: string;
  startDate?: string;
  dueDate?: string;
  priority?: TaskPriority;
  order?: number;
  isRecurring?: boolean;
  boardId: string;
  columnId: string;
  teamId?: string;
  assigneeIds?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  customStatus?: string;
  startDate?: string;
  dueDate?: string;
  priority?: TaskPriority;
  order?: number;
  isRecurring?: boolean;
  columnId?: string;
  teamId?: string;
  assigneeIds?: string[];
}

export interface MoveTaskRequest {
  sourceColumnId: string;
  targetColumnId: string;
  newOrder: number;
}

export interface AssignUsersRequest {
  userIds: string[];
}

// API Response Types
export interface CreateTaskResponse {
  success: boolean;
  message?: string;
  task: TaskDetail;
}

export interface GetTaskResponse {
  success: boolean;
  message?: string;
  task: TaskDetail;
}

export interface GetTasksResponse {
  success: boolean;
  message?: string;
  tasks: Task[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateTaskResponse {
  success: boolean;
  message?: string;
  task: TaskDetail;
}

export interface DeleteTaskResponse {
  success: boolean;
  message?: string;
  task: {
    id: string;
    deletedAt: string;
  };
}

export interface MoveTaskResponse {
  success: boolean;
  message?: string;
  task: TaskDetail;
}

export interface AssignUsersResponse {
  success: boolean;
  message?: string;
  task: TaskDetail;
}

// Utility Types
export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: string;
  search?: string;
}

export interface TaskQueryParams extends TaskFilter {
  page?: number;
  limit?: number;
}

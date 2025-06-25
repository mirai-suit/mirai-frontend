import { z } from "zod";

// Task Status Enum - matching backend
export const TaskStatusEnum = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "BLOCKED",
  "UNDER_REVIEW",
  "COMPLETED",
  "CANCELLED",
  "CUSTOM",
]);

// Task Priority Enum - matching backend
export const TaskPriorityEnum = z.enum([
  "LOWEST",
  "LOW",
  "MEDIUM",
  "HIGH",
  "HIGHEST",
]);

// Simple date range schema for DateRangePicker
export const dateRangeSchema = z
  .object({
    start: z.string().optional(),
    end: z.string().optional(),
  })
  .optional();

// Base Task Schema
export const baseTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  status: TaskStatusEnum.default("NOT_STARTED"),
  customStatus: z.string().max(50, "Custom status too long").optional(),
  dateRange: dateRangeSchema,
  priority: TaskPriorityEnum.default("MEDIUM"),
  order: z.number().int().min(0).default(0),
  isRecurring: z.boolean().default(false),
});

// Create Task Schema for forms
export const createTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  status: TaskStatusEnum.optional(),
  customStatus: z.string().max(50, "Custom status too long").optional(),
  dateRange: dateRangeSchema,
  priority: TaskPriorityEnum.optional(),
  order: z.number().int().min(0).optional(),
  isRecurring: z.boolean().optional(),
  boardId: z.string().uuid("Invalid board ID"),
  columnId: z.string().uuid("Invalid column ID"),
  teamId: z.string().uuid("Invalid team ID").optional(),
  assigneeIds: z.array(z.string().uuid("Invalid user ID")).optional(),
});

// Create Task Schema
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  status: TaskStatusEnum.optional(),
  customStatus: z.string().max(50, "Custom status too long").optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  priority: TaskPriorityEnum.optional(),
  order: z.number().int().min(0).default(0),
  isRecurring: z.boolean().optional(),
  boardId: z.string().uuid("Invalid board ID"),
  columnId: z.string().uuid("Invalid column ID"),
  teamId: z.string().uuid("Invalid team ID").optional(),
  assigneeIds: z.array(z.string().uuid("Invalid user ID")).optional(),
});

// Update Task Schema
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title too long")
    .optional(),
  description: z.string().max(1000, "Description too long").optional(),
  status: TaskStatusEnum.optional(),
  customStatus: z.string().max(50, "Custom status too long").optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  priority: TaskPriorityEnum.optional(),
  order: z.number().int().min(0).optional(),
  isRecurring: z.boolean().optional(),
  columnId: z.string().uuid("Invalid column ID").optional(),
  teamId: z.string().uuid("Invalid team ID").optional(),
  assigneeIds: z.array(z.string().uuid("Invalid user ID")).optional(),
});

// Move Task Schema
export const moveTaskSchema = z.object({
  sourceColumnId: z.string().uuid("Invalid source column ID"),
  targetColumnId: z.string().uuid("Invalid target column ID"),
  newOrder: z.number().int().min(0, "Order must be non-negative"),
});

// Assign Users Schema
export const assignUsersSchema = z.object({
  userIds: z
    .array(z.string().uuid("Invalid user ID"))
    .min(1, "At least one user must be assigned"),
});

// Task Query Schema
export const taskQuerySchema = z.object({
  boardId: z.string().uuid("Invalid board ID").optional(),
  columnId: z.string().uuid("Invalid column ID").optional(),
  assigneeId: z.string().uuid("Invalid assignee ID").optional(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  dueDate: z.string().datetime().optional(),
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
  search: z.string().max(255, "Search term too long").optional(),
});

// Export types
export type CreateTaskFormInput = z.infer<typeof createTaskFormSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type AssignUsersInput = z.infer<typeof assignUsersSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;

// Priority Options for UI - FIXED MAPPING!
export const TASK_PRIORITIES = [
  { value: "HIGHEST", label: "Highest", color: "danger" },
  { value: "HIGH", label: "High", color: "warning" },
  { value: "MEDIUM", label: "Medium", color: "primary" },
  { value: "LOW", label: "Low", color: "success" },
  { value: "LOWEST", label: "Lowest", color: "default" },
] as const;

// Status Options for UI
export const TASK_STATUSES = [
  { value: "NOT_STARTED", label: "Not Started", color: "default" },
  { value: "IN_PROGRESS", label: "In Progress", color: "primary" },
  { value: "BLOCKED", label: "Blocked", color: "danger" },
  { value: "UNDER_REVIEW", label: "Under Review", color: "warning" },
  { value: "COMPLETED", label: "Completed", color: "success" },
  { value: "CANCELLED", label: "Cancelled", color: "default" },
  { value: "CUSTOM", label: "Custom", color: "secondary" },
] as const;

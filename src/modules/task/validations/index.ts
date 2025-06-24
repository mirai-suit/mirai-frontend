import { z } from "zod";

// Task Status Enum
export const TaskStatusEnum = z.enum([
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "BLOCKED",
  "CANCELLED",
]);

// Task Priority Enum (1-5, 1 being highest)
export const TaskPriorityEnum = z.number().int().min(1).max(5);

// Task Priority Enum with string preprocessing for forms
export const TaskPriorityFormEnum = z.preprocess((val) => {
  if (typeof val === "string" && val !== "") {
    const num = parseInt(val, 10);

    return isNaN(num) ? undefined : num;
  }

  return val;
}, z.number().int().min(1).max(5).optional());

// Base Task Schema
export const baseTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  status: TaskStatusEnum.default("TODO"),
  dueDate: z.string().datetime().optional(),
  priority: TaskPriorityEnum.optional(),
  order: z.number().int().min(0).optional(),
  isRecurring: z.boolean().default(false),
});

// Create Task Schema for forms (simpler approach)
export const createTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  status: TaskStatusEnum.optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.union([z.string(), z.number()]).optional(),
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
  dueDate: z.string().datetime().optional(),
  priority: TaskPriorityEnum,
  order: z.number().int().min(0).optional(),
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
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  assignee: z.string().uuid("Invalid assignee ID").optional(),
  dueDate: z.string().datetime().optional(),
  search: z.string().max(255, "Search term too long").optional(),
});

// Export Types
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type CreateTaskFormInput = z.infer<typeof createTaskFormSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type AssignUsersInput = z.infer<typeof assignUsersSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;

// Priority Options for UI
export const TASK_PRIORITIES = [
  { value: 1, label: "Highest", color: "danger" },
  { value: 2, label: "High", color: "warning" },
  { value: 3, label: "Medium", color: "primary" },
  { value: 4, label: "Low", color: "success" },
  { value: 5, label: "Lowest", color: "default" },
] as const;

// Status Options for UI
export const TASK_STATUSES = [
  { value: "TODO", label: "To Do", color: "default" },
  { value: "IN_PROGRESS", label: "In Progress", color: "primary" },
  { value: "IN_REVIEW", label: "In Review", color: "warning" },
  { value: "DONE", label: "Done", color: "success" },
  { value: "BLOCKED", label: "Blocked", color: "danger" },
  { value: "CANCELLED", label: "Cancelled", color: "default" },
] as const;

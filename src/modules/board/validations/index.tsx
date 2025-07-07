import { z } from "zod";

// Board creation validation schema
export const createBoardSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Board title is required" })
    .max(100, { message: "Board title must be less than 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Color must be a valid hex color",
    })
    .default("#3B82F6"),
  coverImage: z
    .string()
    .url({ message: "Cover image must be a valid URL" })
    .optional(),
  defaultColumns: z
    .array(z.string().min(1, { message: "Column name cannot be empty" }))
    .max(10, { message: "Maximum 10 columns allowed" })
    .optional(),
  organizationId: z.string().min(1, { message: "Organization is required" }),
});

// Board update validation schema
export const updateBoardSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Board title is required" })
    .max(100, { message: "Board title must be less than 100 characters" })
    .optional(),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Color must be a valid hex color",
    })
    .optional(),
  coverImage: z
    .string()
    .url({ message: "Cover image must be a valid URL" })
    .optional(),
  isArchived: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  isReadOnly: z.boolean().optional(),
  isShared: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

// Board access validation schema
export const boardAccessSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  role: z
    .enum(["VIEWER", "EDITOR", "ADMIN", "OWNER"], {
      message: "Role must be VIEWER, EDITOR, ADMIN, or OWNER",
    })
    .default("VIEWER"),
});

// Predefined board colors for selection
export const BOARD_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
] as const;

// Predefined column templates
export const COLUMN_TEMPLATES = {
  kanban: ["To Do", "In Progress", "Done"],
  scrum: ["Backlog", "Sprint", "In Progress", "Review", "Done"],
  custom: ["Column 1", "Column 2", "Column 3"],
  simple: ["Not Started", "Completed"],
  detailed: ["Ideas", "To Do", "In Progress", "Testing", "Done"],
} as const;

// Export inferred types
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type BoardAccessInput = z.infer<typeof boardAccessSchema>;
export type BoardColor = (typeof BOARD_COLORS)[number];
export type ColumnTemplate = keyof typeof COLUMN_TEMPLATES;

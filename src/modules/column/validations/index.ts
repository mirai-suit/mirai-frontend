import { z } from "zod";

// Create column validation schema
export const createColumnSchema = z.object({
  name: z
    .string()
    .min(1, "Column name is required")
    .max(50, "Column name must be less than 50 characters")
    .trim(),
  boardId: z.string().min(1, "Board ID is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  order: z.number().int().min(0).optional(),
});

// Update column validation schema
export const updateColumnSchema = z.object({
  columnId: z.string().min(1, "Column ID is required"),
  name: z
    .string()
    .min(1, "Column name is required")
    .max(50, "Column name must be less than 50 characters")
    .trim()
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format")
    .optional(),
});

// Export types
export type CreateColumnForm = z.infer<typeof createColumnSchema>;
export type UpdateColumnForm = z.infer<typeof updateColumnSchema>;

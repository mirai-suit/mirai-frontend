import { z } from "zod";

// Note category validation
export const noteCategorySchema = z.enum([
  "GENERAL",
  "MEETING_NOTES",
  "IDEAS",
  "DOCUMENTATION",
  "REMINDERS",
]);

// Create note validation schema
export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Note title is required" })
    .max(200, { message: "Note title must be less than 200 characters" }),
  content: z
    .string()
    .min(1, { message: "Note content is required" })
    .max(5000, { message: "Note content must be less than 5000 characters" }),
  category: noteCategorySchema,
  isPinned: z.boolean(),
});

// Update note validation schema
export const updateNoteSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Note title is required" })
    .max(200, { message: "Note title must be less than 200 characters" })
    .optional(),
  content: z
    .string()
    .min(1, { message: "Note content is required" })
    .max(5000, { message: "Note content must be less than 5000 characters" })
    .optional(),
  category: noteCategorySchema.optional(),
  isPinned: z.boolean().optional(),
});

// Note filters validation schema
export const noteFiltersSchema = z.object({
  category: noteCategorySchema.optional(),
  search: z.string().max(100).optional(),
  pinned: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// TypeScript types inferred from schemas
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type NoteFiltersInput = z.infer<typeof noteFiltersSchema>;

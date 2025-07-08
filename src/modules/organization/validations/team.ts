import { z } from "zod";

// Team creation validation schema
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Team name is required" })
    .max(100, { message: "Team name must be less than 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional()
    .default(""),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Color must be a valid hex color",
    })
    .default("#3B82F6"),
  leaderId: z.string().min(1, { message: "Team leader is required" }),
  memberIds: z
    .array(z.string())
    .min(1, { message: "At least one member is required" })
    .max(50, { message: "Maximum 50 members allowed" }),
  boardIds: z
    .array(z.string())
    .max(20, { message: "Maximum 20 boards allowed" })
    .optional()
    .default([]),
  objectives: z
    .string()
    .max(1000, { message: "Objectives must be less than 1000 characters" })
    .optional()
    .default(""),
});

// Team update validation schema
export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Team name is required" })
    .max(100, { message: "Team name must be less than 100 characters" })
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
  leaderId: z
    .string()
    .min(1, { message: "Team leader is required" })
    .optional(),
  objectives: z
    .string()
    .max(1000, { message: "Objectives must be less than 1000 characters" })
    .optional(),
  isActive: z.boolean().optional(),
});

// Team member management validation
export const addTeamMembersSchema = z.object({
  memberIds: z
    .array(z.string())
    .min(1, { message: "At least one member is required" })
    .max(50, { message: "Maximum 50 members can be added at once" }),
  role: z.enum(["MEMBER", "LEADER"]).default("MEMBER"),
});

// Board assignment validation
export const assignBoardsSchema = z.object({
  boardIds: z
    .array(z.string())
    .min(1, { message: "At least one board is required" })
    .max(20, { message: "Maximum 20 boards can be assigned at once" }),
});

// Export inferred types
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddTeamMembersInput = z.infer<typeof addTeamMembersSchema>;
export type AssignBoardsInput = z.infer<typeof assignBoardsSchema>;

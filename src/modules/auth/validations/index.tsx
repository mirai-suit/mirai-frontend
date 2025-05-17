import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Enter a valid email" })
    .min(1, { message: "Email is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z
    .string()
    .email({ message: "Enter a valid email" })
    .min(1, { message: "Email is required" }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  roles: z.array(z.string()).default(["user"]),
});

export type UserInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

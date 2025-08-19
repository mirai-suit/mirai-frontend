import { z } from "zod";

// Send invitation validation
export const sendInvitationSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["ADMIN", "MEMBER"], {
    required_error: "Role is required",
  }),
});

export type SendInvitationInput = z.infer<typeof sendInvitationSchema>;

// Role validation
export const organizationRoles = [
  { value: "ADMIN", label: "Administrator" },
  { value: "MEMBER", label: "Member" },
] as const;

export const getRoleDescription = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Full access to organization settings, can manage members and invite users";
    case "MEMBER":
      return "Can view and participate in boards, limited administrative access";
    default:
      return "";
  }
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "danger";
    case "MEMBER":
      return "primary";
    default:
      return "default";
  }
};

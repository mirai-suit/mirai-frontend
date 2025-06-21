import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Organization name is required" })
    .min(2, { message: "Organization name must be at least 2 characters" })
    .max(50, { message: "Organization name must be less than 50 characters" }),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

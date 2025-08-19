import { z } from "zod";

// Personal Performance Query Validation
export const personalPerformanceQuerySchema = z.object({
  period: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"]).default("MONTHLY"),
  organizationId: z.string().uuid(),
});

export type PersonalPerformanceQuery = z.infer<typeof personalPerformanceQuerySchema>;

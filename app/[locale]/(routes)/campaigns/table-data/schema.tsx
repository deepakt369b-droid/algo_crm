import { z } from "zod";

export const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string().nullable(),
  scheduled_at: z.union([z.string(), z.date(), z.null()]).optional(),
  sent_at: z.union([z.string(), z.date(), z.null()]).optional(),
  created_on: z.union([z.string(), z.date(), z.null()]).optional(),
  _count: z.object({ sends: z.number() }).optional(),
  template: z.object({ name: z.string() }).nullable().optional(),
});

export type Campaign = z.infer<typeof campaignSchema>;

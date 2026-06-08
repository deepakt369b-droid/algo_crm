import { z } from "zod";

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const adminUserSchema = z.object({
  id: z.string(),
  // Supabase returns dates as ISO strings. We accept both string and date objects.
  created_on: z.union([z.string(), z.date(), z.null()]).optional(),
  lastLoginAt: z.union([z.string(), z.date(), z.null()]).optional(),
  role: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  email: z.string(),
  userStatus: z.string(),
  userLanguage: z.string(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

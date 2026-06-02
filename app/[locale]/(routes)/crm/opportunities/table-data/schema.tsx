import { z } from "zod";

// Helper to parse date fields that come as ISO strings from serialized data
const dateSchema = z.union([
  z.date(),
  z.string().datetime({ message: "Invalid ISO date string" }).transform((val) => new Date(val)),
]);

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const opportunitySchema = z.object({
  //TODO: fix all the types and nullable
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  next_step: z.string().nullable(),
  close_date: dateSchema.nullable(),
  status: z.string().nullable(),
  budget: z.union([z.number(), z.bigint()]).nullable().transform((val) =>
    typeof val === 'bigint' ? Number(val) : val
  ),
  expected_revenue: z.union([z.number(), z.bigint()]).nullable().transform((val) =>
    typeof val === 'bigint' ? Number(val) : val
  ),
  currency: z.string().nullable().optional(),
  assigned_account: z.object({}).optional().nullable(),
  assigned_sales_stage: z.object({}).optional().nullable(),
  assigned_to_user: z.object({}).optional().nullable(),
});

export type Opportunity = z.infer<typeof opportunitySchema>;

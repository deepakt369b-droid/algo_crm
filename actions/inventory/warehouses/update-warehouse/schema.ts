import { z } from "zod";

export const UpdateWarehouse = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required").optional(),
  code: z.string().min(1).max(20).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().optional(),
});

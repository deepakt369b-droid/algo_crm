import { z } from "zod";

export const SetReorderThreshold = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  minQuantity: z.coerce.number().nonnegative("Min quantity must be non-negative"),
  maxQuantity: z.coerce.number().nonnegative("Max quantity must be non-negative").optional(),
  reorderPoint: z.coerce.number().nonnegative("Reorder point must be non-negative"),
  reorderQuantity: z.coerce.number().nonnegative("Reorder quantity must be non-negative"),
});

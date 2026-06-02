import { z } from "zod";

export const AdjustStock = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  newQuantity: z.coerce.number().nonnegative("Quantity must be non-negative"),
  note: z.string().optional(),
});

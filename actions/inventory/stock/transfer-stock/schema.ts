import { z } from "zod";

export const TransferStock = z.object({
  productId: z.string().min(1),
  fromWarehouseId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  note: z.string().optional(),
});

import { z } from "zod";

export const AddPurchaseOrderLineItem = z.object({
  purchaseOrderId: z.string().min(1),
  productId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().nonnegative("Unit price must be non-negative"),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  sortOrder: z.coerce.number().int().default(0),
});

import { z } from "zod";

export const UpdatePurchaseOrderStatus = z.object({
  id: z.string().min(1),
  status: z.enum([
    "DRAFT",
    "PENDING_APPROVAL",
    "APPROVED",
    "REJECTED",
    "ORDERED",
    "PARTIALLY_RECEIVED",
    "RECEIVED",
    "CANCELLED",
  ]),
  rejectionReason: z.string().optional(),
});

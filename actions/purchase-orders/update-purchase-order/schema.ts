import { z } from "zod";

export const UpdatePurchaseOrder = z.object({
  id: z.string().min(1),
  vendorId: z.string().min(1).optional(),
  currency: z.string().length(3).optional(),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  termsAndConditions: z.string().nullable().optional(),
  shippingAddress: z.string().nullable().optional(),
  billingAddress: z.string().nullable().optional(),
});

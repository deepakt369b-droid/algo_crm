import { z } from "zod";

export const CreatePurchaseOrder = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  currency: z.string().length(3).default("EUR"),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  shippingAddress: z.string().optional(),
  billingAddress: z.string().optional(),
});

"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { CreatePurchaseOrder } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { writeAuditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;
  const {
    vendorId, currency, orderDate, expectedDeliveryDate,
    notes, termsAndConditions, shippingAddress, billingAddress,
  } = data;

  try {
    // Verify vendor exists
    const vendor = await prismadb.crm_Accounts.findUnique({
      where: { id: vendorId },
    });
    if (!vendor || vendor.deletedAt) {
      return { error: "Vendor not found" };
    }

    // Generate order number (PO-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prismadb.purchaseOrders.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });
    const orderNumber = `PO-${dateStr}-${String(count + 1).padStart(4, "0")}`;

    const purchaseOrder = await prismadb.purchaseOrders.create({
      data: {
        orderNumber,
        vendorId,
        currency,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
        notes: notes || undefined,
        termsAndConditions: termsAndConditions || undefined,
        shippingAddress: shippingAddress ? JSON.parse(shippingAddress) : undefined,
        billingAddress: billingAddress ? JSON.parse(billingAddress) : undefined,
        requestedBy: userId,
        createdBy: userId,
        updatedBy: userId,
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
      },
    });

    await writeAuditLog({
      entityType: "purchase_order",
      entityId: purchaseOrder.id,
      action: "created",
      changes: null,
      userId,
    });

    revalidatePath("/[locale]/(routes)/admin/purchase", "page");
    return { data: { id: purchaseOrder.id, orderNumber: purchaseOrder.orderNumber } };
  } catch (error) {
    console.log("[CREATE_PURCHASE_ORDER]", error);
    return { error: "Failed to create purchase order" };
  }
};

export const createPurchaseOrder = createSafeAction(CreatePurchaseOrder, handler);

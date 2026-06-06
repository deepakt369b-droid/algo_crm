"use server";
import { getSession } from "@/lib/auth-server";

import { UpdatePurchaseOrder } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { writeAuditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;
  const { id, vendorId, currency, orderDate, expectedDeliveryDate, notes, termsAndConditions, shippingAddress, billingAddress } = data;

  try {
    const existing = (await supabaseAdmin.from("PurchaseOrders").select("*").eq("id", id).single()).data;
    if (!existing || existing.deletedAt) {
      return { error: "Purchase order not found" };
    }
    if (existing.status !== "DRAFT") {
      return { error: "Only draft purchase orders can be edited" };
    }

    const updateData: Record<string, unknown> = {};
    if (vendorId !== undefined) updateData.vendorId = vendorId;
    if (currency !== undefined) updateData.currency = currency;
    if (orderDate !== undefined) updateData.orderDate = new Date(orderDate);
    if (expectedDeliveryDate !== undefined) updateData.expectedDeliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate) : null;
    if (notes !== undefined) updateData.notes = notes;
    if (termsAndConditions !== undefined) updateData.termsAndConditions = termsAndConditions;
    if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress ? JSON.parse(shippingAddress) : null;
    if (billingAddress !== undefined) updateData.billingAddress = billingAddress ? JSON.parse(billingAddress) : null;
    updateData.updatedBy = userId;

    const updated = (await supabaseAdmin.from("PurchaseOrders").update(updateData).select("*").single()).data;

    await writeAuditLog({
      entityType: "purchase_order",
      entityId: updated.id,
      action: "updated",
      changes: null,
      userId,
    });

    revalidatePath("/[locale]/(routes)/admin/purchase", "page");
    revalidatePath(`/[locale]/(routes)/admin/purchase/${id}`, "page");
    return { data: { id: updated.id, orderNumber: updated.orderNumber } };
  } catch (error) {
    console.log("[UPDATE_PURCHASE_ORDER]", error);
    return { error: "Failed to update purchase order" };
  }
};

export const updatePurchaseOrder = createSafeAction(UpdatePurchaseOrder, handler);

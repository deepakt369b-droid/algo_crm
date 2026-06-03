"use server";

import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function removePurchaseOrderLineItem(lineItemId: string): Promise<{ error?: string; data?: { id: string } }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const lineItem = (await supabaseAdmin.from("purchaseOrderLineItems").select("*").eq("id", lineItemId).single()).data;
    if (!lineItem) {
      return { error: "Line item not found" };
    }

    const po = (await supabaseAdmin.from("purchaseOrders").select("*").eq("id", lineItem.purchaseOrderId).single()).data;
    if (!po || po.deletedAt) {
      return { error: "Purchase order not found" };
    }
    if (po.status !== "DRAFT") {
      return { error: "Can only remove line items from draft purchase orders" };
    }

    (await supabaseAdmin.from("purchaseOrderLineItems").delete().select("*").single().eq("id", lineItemId).select("*").single()).data;

    // Recalculate totals
    const allItems = (await supabaseAdmin.from("purchaseOrderLineItems").select("*").eq("purchaseOrderId", lineItem.purchaseOrderId)).data;
    const subtotal = allItems.reduce((sum, li) => sum + Number(li.lineTotal), 0);
    const taxTotal = allItems.reduce((sum, li) => {
      if (li.taxRate) {
        return sum + Number(li.lineTotal) * (Number(li.taxRate) / 100);
      }
      return sum;
    }, 0);
    const grandTotal = subtotal + taxTotal;

    (await supabaseAdmin.from("purchaseOrders").update({
                  subtotal,
                  taxTotal,
                  grandTotal,
                  updatedBy: session.user.id,
                }).select("*").single().eq("id", lineItem.purchaseOrderId).select("*").single()).data;

    revalidatePath(`/[locale]/(routes)/admin/purchase/${lineItem.purchaseOrderId}`, "page");
    revalidatePath("/[locale]/(routes)/admin/purchase", "page");
    return { data: { id: lineItemId } };
  } catch (error) {
    console.log("[REMOVE_PO_LINE_ITEM]", error);
    return { error: "Failed to remove line item" };
  }
}

"use server";
import { getSession } from "@/lib/auth-server";

import { AddPurchaseOrderLineItem } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { purchaseOrderId, productId, description, quantity, unitPrice, taxRate, sortOrder } = data;

  try {
    const po = (await supabaseAdmin.from("purchaseOrders").select("*").eq("id", purchaseOrderId).single()).data;
    if (!po || po.deletedAt) {
      return { error: "Purchase order not found" };
    }
    if (po.status !== "DRAFT") {
      return { error: "Can only add line items to draft purchase orders" };
    }

    const lineTotal = Number((quantity * unitPrice).toFixed(2));

    const lineItem = (await supabaseAdmin.from("purchaseOrderLineItems").insert({
            purchaseOrderId,
            productId: productId || undefined,
            description,
            quantity,
            unitPrice,
            taxRate: taxRate || undefined,
            lineTotal,
            sortOrder,
          }).select("*").single()).data;

    // Recalculate totals
    const allItems = (await supabaseAdmin.from("purchaseOrderLineItems").select("*").eq("purchaseOrderId", purchaseOrderId)).data;
    const subtotal = allItems.reduce((sum, li) => sum + Number(li.lineTotal), 0);
    const taxTotal = allItems.reduce((sum, li) => {
      if (li.taxRate) {
        return sum + Number(li.lineTotal) * (Number(li.taxRate) / 100);
      }
      return sum;
    }, 0);
    const grandTotal = subtotal + taxTotal;

    (await supabaseAdmin.from("purchaseOrders").update({
              subtotal: subtotal,
              taxTotal: taxTotal,
              grandTotal: grandTotal,
              updatedBy: session.user.id,
            }).eq("id", purchaseOrderId).select("*").single()).data;

    revalidatePath(`/[locale]/(routes)/admin/purchase/${purchaseOrderId}`, "page");
    revalidatePath("/[locale]/(routes)/admin/purchase", "page");
    return { data: { id: lineItem.id } };
  } catch (error) {
    console.log("[ADD_PO_LINE_ITEM]", error);
    return { error: "Failed to add line item" };
  }
};

export const addPurchaseOrderLineItem = createSafeAction(AddPurchaseOrderLineItem, handler);

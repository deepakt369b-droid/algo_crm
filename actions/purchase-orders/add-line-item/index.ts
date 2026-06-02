"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { AddPurchaseOrderLineItem } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { purchaseOrderId, productId, description, quantity, unitPrice, taxRate, sortOrder } = data;

  try {
    const po = await prismadb.purchaseOrders.findUnique({ where: { id: purchaseOrderId } });
    if (!po || po.deletedAt) {
      return { error: "Purchase order not found" };
    }
    if (po.status !== "DRAFT") {
      return { error: "Can only add line items to draft purchase orders" };
    }

    const lineTotal = Number((quantity * unitPrice).toFixed(2));

    const lineItem = await prismadb.purchaseOrderLineItems.create({
      data: {
        purchaseOrderId,
        productId: productId || undefined,
        description,
        quantity,
        unitPrice,
        taxRate: taxRate || undefined,
        lineTotal,
        sortOrder,
      },
    });

    // Recalculate totals
    const allItems = await prismadb.purchaseOrderLineItems.findMany({
      where: { purchaseOrderId },
    });
    const subtotal = allItems.reduce((sum, li) => sum + Number(li.lineTotal), 0);
    const taxTotal = allItems.reduce((sum, li) => {
      if (li.taxRate) {
        return sum + Number(li.lineTotal) * (Number(li.taxRate) / 100);
      }
      return sum;
    }, 0);
    const grandTotal = subtotal + taxTotal;

    await prismadb.purchaseOrders.update({
      where: { id: purchaseOrderId },
      data: {
        subtotal: subtotal,
        taxTotal: taxTotal,
        grandTotal: grandTotal,
        updatedBy: session.user.id,
      },
    });

    revalidatePath(`/[locale]/(routes)/admin/purchase/${purchaseOrderId}`, "page");
    revalidatePath("/[locale]/(routes)/admin/purchase", "page");
    return { data: { id: lineItem.id } };
  } catch (error) {
    console.log("[ADD_PO_LINE_ITEM]", error);
    return { error: "Failed to add line item" };
  }
};

export const addPurchaseOrderLineItem = createSafeAction(AddPurchaseOrderLineItem, handler);

"use server";

import { prismadb } from "@/lib/prisma";

export interface PurchaseOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  orderDate: Date;
  grandTotal: number;
  currency: string;
  lineItemCount: number;
  vendor: { id: string; name: string } | null;
  requestedByUser: { id: string; name: string | null } | null;
  createdAt: Date;
}

export async function getPurchaseOrders(): Promise<PurchaseOrderListItem[]> {
  const orders = await prismadb.purchaseOrders.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true } },
      requestedByUser: { select: { id: true, name: true } },
      lineItems: { select: { id: true } },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    orderDate: order.orderDate,
    grandTotal: Number(order.grandTotal),
    currency: order.currency,
    lineItemCount: order.lineItems.length,
    vendor: order.vendor ? { id: order.vendor.id, name: order.vendor.name } : null,
    requestedByUser: order.requestedByUser
      ? { id: order.requestedByUser.id, name: order.requestedByUser.name }
      : null,
    createdAt: order.createdAt,
  }));
}

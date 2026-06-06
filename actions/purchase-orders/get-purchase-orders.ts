"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

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
  const { data: orders, error } = await supabaseAdmin
    .from("PurchaseOrders")
    .select(`
      *,
      vendor:crm_Accounts!PurchaseOrders_vendorId_fkey(id, name),
      requestedByUser:Users!PurchaseOrders_requestedBy_fkey(id, name),
      lineItems:PurchaseOrderLineItems!PurchaseOrderLineItems_purchaseOrderId_fkey(id)
    `)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("[PURCHASE_ORDERS_LIST_ERROR]", error);
    return [];
  }

  return (orders || []).map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    orderDate: order.orderDate,
    grandTotal: Number(order.grandTotal),
    currency: order.currency,
    lineItemCount: order.lineItems?.length ?? 0,
    vendor: order.vendor ? { id: order.vendor.id, name: order.vendor.name } : null,
    requestedByUser: order.requestedByUser
      ? { id: order.requestedByUser.id, name: order.requestedByUser.name }
      : null,
    createdAt: order.createdAt,
  }));
}

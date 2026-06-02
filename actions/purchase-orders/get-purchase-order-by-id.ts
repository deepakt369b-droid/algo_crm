"use server";

import { prismadb } from "@/lib/prisma";

export interface PurchaseOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  orderDate: Date;
  expectedDeliveryDate: Date | null;
  deliveredDate: Date | null;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  notes: string | null;
  termsAndConditions: string | null;
  shippingAddress: unknown;
  billingAddress: unknown;
  rejectionReason: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  vendor: { id: string; name: string; email: string | null; website: string | null } | null;
  requestedByUser: { id: string; name: string | null } | null;
  approvedByUser: { id: string; name: string | null } | null;
  lineItems: PurchaseOrderLineItemDetail[];
}

export interface PurchaseOrderLineItemDetail {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number | null;
  lineTotal: number;
  receivedQuantity: number;
  sortOrder: number;
  product: { id: string; name: string; sku: string | null } | null;
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrderDetail | null> {
  const order = await prismadb.purchaseOrders.findUnique({
    where: { id },
    include: {
      vendor: { select: { id: true, name: true, email: true, website: true } },
      requestedByUser: { select: { id: true, name: true } },
      approvedByUser: { select: { id: true, name: true } },
      lineItems: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      },
    },
  });

  if (!order || order.deletedAt) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    orderDate: order.orderDate,
    expectedDeliveryDate: order.expectedDeliveryDate,
    deliveredDate: order.deliveredDate,
    subtotal: Number(order.subtotal),
    taxTotal: Number(order.taxTotal),
    grandTotal: Number(order.grandTotal),
    currency: order.currency,
    notes: order.notes,
    termsAndConditions: order.termsAndConditions,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    rejectionReason: order.rejectionReason,
    approvedAt: order.approvedAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    vendor: order.vendor ? { id: order.vendor.id, name: order.vendor.name, email: order.vendor.email, website: order.vendor.website } : null,
    requestedByUser: order.requestedByUser ? { id: order.requestedByUser.id, name: order.requestedByUser.name } : null,
    approvedByUser: order.approvedByUser ? { id: order.approvedByUser.id, name: order.approvedByUser.name } : null,
    lineItems: order.lineItems.map((li) => ({
      id: li.id,
      description: li.description,
      quantity: Number(li.quantity),
      unitPrice: Number(li.unitPrice),
      taxRate: li.taxRate ? Number(li.taxRate) : null,
      lineTotal: Number(li.lineTotal),
      receivedQuantity: Number(li.receivedQuantity),
      sortOrder: li.sortOrder,
      product: li.product ? { id: li.product.id, name: li.product.name, sku: li.product.sku } : null,
    })),
  };
}

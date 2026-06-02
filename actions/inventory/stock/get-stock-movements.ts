"use server";

import { prismadb } from "@/lib/prisma";

interface StockMovementFilter {
  productId?: string;
  warehouseId?: string;
  type?: string;
  limit?: number;
}

export interface StockMovementItem {
  id: string;
  type: string;
  quantity: number;
  reference: string | null;
  note: string | null;
  createdAt: Date;
  product: { id: string; name: string; sku: string | null } | null;
  warehouse: { id: string; name: string } | null;
}

export async function getStockMovements(filters?: StockMovementFilter): Promise<StockMovementItem[]> {
  const where: Record<string, unknown> = {};
  if (filters?.productId) where.productId = filters.productId;
  if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
  if (filters?.type) where.type = filters.type;

  const movements = await prismadb.inventoryMovement.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: filters?.limit || 50,
    include: {
      product: { select: { id: true, name: true, sku: true } },
      warehouse: { select: { id: true, name: true } },
    },
  });

  return movements.map((m) => ({
    id: m.id,
    type: m.type,
    quantity: Number(m.quantity),
    reference: m.reference,
    note: m.note,
    createdAt: m.createdAt,
    product: m.product ? { id: m.product.id, name: m.product.name, sku: m.product.sku } : null,
    warehouse: m.warehouse ? { id: m.warehouse.id, name: m.warehouse.name } : null,
  }));
}

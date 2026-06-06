"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export interface InventoryStockItem {
  id: string;
  quantity: number;
  productId: string;
  warehouseId: string;
  product: {
    id: string;
    name: string;
    sku: string | null;
    unitPrice: number;
    currency: string;
    type: string;
  } | null;
  warehouse: {
    id: string;
    name: string;
    code: string;
  } | null;
  threshold: {
    minQuantity: number;
    maxQuantity: number | null;
    reorderPoint: number;
    reorderQuantity: number;
  } | null;
}

export interface InventoryStockFilter {
  warehouseId?: string;
  lowStockOnly?: boolean;
  productSearch?: string;
}

export async function getInventoryStock(filters?: InventoryStockFilter): Promise<InventoryStockItem[]> {
  const where: Record<string, unknown> = {};
  if (filters?.warehouseId) where.warehouseId = filters.warehouseId;

  const stock = (await supabaseAdmin.from("InventoryStock").select("*, product(id, name, sku, unit_price, currency, type), warehouse(id, name, code)").order("warehouse", { ascending: false }).order("product", { ascending: false })).data;

  // Get all reorder thresholds for these product-warehouse combinations
  const thresholdKeys = stock.map((s) => ({ productId: s.productId, warehouseId: s.warehouseId }));
  const thresholds = (await supabaseAdmin.from("ReorderThreshold").select("*").eq("OR", thresholdKeys.map((k) => ({ productId: k.productId, warehouseId: k.warehouseId })))).data;

  const thresholdMap = new Map(
    thresholds.map((t) => [`${t.productId}:${t.warehouseId}`, t]),
  );

  let results: InventoryStockItem[] = stock.map((s) => {
    const t = thresholdMap.get(`${s.productId}:${s.warehouseId}`);
    return {
      id: s.id,
      quantity: Number(s.quantity),
      productId: s.productId,
      warehouseId: s.warehouseId,
      product: s.product
        ? {
            id: s.product.id,
            name: s.product.name,
            sku: s.product.sku,
            unitPrice: Number(s.product.unit_price),
            currency: s.product.currency,
            type: s.product.type,
          }
        : null,
      warehouse: s.warehouse
        ? { id: s.warehouse.id, name: s.warehouse.name, code: s.warehouse.code }
        : null,
      threshold: t
        ? {
            minQuantity: Number(t.minQuantity),
            maxQuantity: t.maxQuantity ? Number(t.maxQuantity) : null,
            reorderPoint: Number(t.reorderPoint),
            reorderQuantity: Number(t.reorderQuantity),
          }
        : null,
    };
  });

  // Apply filters that require post-processing
  if (filters?.lowStockOnly) {
    results = results.filter(
      (item) => item.threshold && item.quantity <= item.threshold.reorderPoint,
    );
  }

  if (filters?.productSearch) {
    const search = filters.productSearch.toLowerCase();
    results = results.filter(
      (item) =>
        item.product?.name.toLowerCase().includes(search) ||
        item.product?.sku?.toLowerCase().includes(search),
    );
  }

  return results;
}

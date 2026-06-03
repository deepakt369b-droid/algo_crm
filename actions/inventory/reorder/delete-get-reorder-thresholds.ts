"use server";

import { getSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function deleteReorderThreshold(id: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    (await supabaseAdmin.from("reorderThreshold").delete().select("*").single().eq("id", id).select("*").single()).data;
    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return {};
  } catch (error) {
    console.log("[DELETE_REORDER_THRESHOLD]", error);
    return { error: "Failed to delete reorder threshold" };
  }
}

export interface ReorderThresholdItem {
  id: string;
  productId: string;
  warehouseId: string;
  minQuantity: number;
  maxQuantity: number | null;
  reorderPoint: number;
  reorderQuantity: number;
  productName: string;
  productSku: string | null;
  warehouseName: string;
  currentStock: number;
  isLowStock: boolean;
}

export async function getReorderThresholds(): Promise<ReorderThresholdItem[]> {
  const thresholds = (await supabaseAdmin.from("reorderThreshold").select("*, product(id, name, sku), warehouse(id, name)").order("product", { ascending: false }).order("warehouse", { ascending: false })).data || [];

  // Get current stock for each threshold
  const stockKeys = thresholds.map((t: any) => ({
    productId: t.productId,
    warehouseId: t.warehouseId,
  }));

  const stockRecords = await Promise.all(
    stockKeys.map(async (k) =>
      (await supabaseAdmin.from("inventoryStock").select("*").eq("productId", k.productId).eq("warehouseId", k.warehouseId).single()).data
    )
  );

  const stockMap = new Map<string, number>();
  stockRecords.forEach((s, i) => {
    if (s) {
      stockMap.set(`${thresholds[i].productId}:${thresholds[i].warehouseId}`, Number(s.quantity));
    }
  });

  return thresholds.map((t: any) => {
    const currentStock = stockMap.get(`${t.productId}:${t.warehouseId}`) ?? 0;
    return {
      id: t.id,
      productId: t.productId,
      warehouseId: t.warehouseId,
      minQuantity: Number(t.minQuantity),
      maxQuantity: t.maxQuantity ? Number(t.maxQuantity) : null,
      reorderPoint: Number(t.reorderPoint),
      reorderQuantity: Number(t.reorderQuantity),
      productName: t.product.name,
      productSku: t.product.sku,
      warehouseName: t.warehouse.name,
      currentStock,
      isLowStock: currentStock <= Number(t.reorderPoint),
    };
  });
}

export async function getLowStockItems(): Promise<ReorderThresholdItem[]> {
  const items = await getReorderThresholds();
  return items.filter((item) => item.isLowStock);
}

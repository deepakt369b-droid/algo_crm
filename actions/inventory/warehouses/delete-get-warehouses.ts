"use server";


import { getSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function deleteWarehouse(id: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Check if warehouse has stock
    const stockCount = (await supabaseAdmin.from("inventoryStock").select("*", { count: 'exact', head: true }).eq("warehouseId", id).gt("quantity", 0)).count;
    if (stockCount > 0) {
      return { error: "Cannot delete warehouse with existing stock. Transfer stock first." };
    }

    (await supabaseAdmin.from("inventoryWarehouse").delete().eq("id", id).select("*").single()).data;
    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return {};
  } catch (error) {
    console.log("[DELETE_WAREHOUSE]", error);
    return { error: "Failed to delete warehouse" };
  }
}

export async function getWarehouses() {
  const warehouses = (await supabaseAdmin.from("inventoryWarehouse").select("*").order("name", { ascending: true })).data;
  return warehouses.map((w) => ({
    ...w,
  }));
}

export async function getWarehouseById(id: string) {
  const warehouse = (await supabaseAdmin.from("inventoryWarehouse").select("*, stock(*, product(id, name, sku, unit_price, currency)), thresholds").eq("id", id).single()).data;
  return warehouse;
}

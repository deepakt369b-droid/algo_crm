"use server";
import { getSession } from "@/lib/auth-server";
import { AdjustStock } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { productId, warehouseId, newQuantity, note } = data;

  try {
    const product = (await supabaseAdmin.from("crm_Products").select("*").eq("id", productId).single()).data;
    if (!product || product.deletedAt) {
      return { error: "Product not found" };
    }

    const warehouse = (await supabaseAdmin.from("inventoryWarehouse").select("*").eq("id", warehouseId).single()).data;
    if (!warehouse) {
      return { error: "Warehouse not found" };
    }

    // Get current stock
    const existingStock = (await supabaseAdmin.from("inventoryStock").select("*").eq("productId", productId).eq("warehouseId", warehouseId).single()).data;

    const currentQuantity = existingStock ? Number(existingStock.quantity) : 0;
    const quantityDiff = newQuantity - currentQuantity;

    // Upsert stock record
    await supabaseAdmin.from("inventoryStock").upsert({
      productId, warehouseId, quantity: newQuantity
    }, { onConflict: "productId,warehouseId" });

    // Record movement if quantity changed
    if (quantityDiff !== 0) {
      (await supabaseAdmin.from("inventoryMovement").insert({
                        productId,
                        warehouseId,
                        type: "ADJUSTMENT",
                        quantity: Math.abs(quantityDiff),
                        reference: note || "Manual adjustment",
                        note: note || undefined,
                        createdBy: session.user.id,
                      }).select("*").single()).data;
    }

    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return { data: { productId, warehouseId, quantity: newQuantity } };
  } catch (error) {
    console.log("[ADJUST_STOCK]", error);
    return { error: "Failed to adjust stock" };
  }
};

export const adjustStock = createSafeAction(AdjustStock, handler);

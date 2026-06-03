"use server";
import { getSession } from "@/lib/auth-server";
import { TransferStock } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { productId, fromWarehouseId, toWarehouseId, quantity, note } = data;

  try {
    if (fromWarehouseId === toWarehouseId) {
      return { error: "Source and destination warehouses must be different" };
    }

    const product = (await supabaseAdmin.from("crm_Products").select("*").eq("id", productId).single()).data;
    if (!product || product.deletedAt) {
      return { error: "Product not found" };
    }

    const fromWarehouse = (await supabaseAdmin.from("inventoryWarehouse").select("*").eq("id", fromWarehouseId).single()).data;
    const toWarehouse = (await supabaseAdmin.from("inventoryWarehouse").select("*").eq("id", toWarehouseId).single()).data;
    if (!fromWarehouse || !toWarehouse) {
      return { error: "Warehouse not found" };
    }

    // Get source stock
    const fromStock = (await supabaseAdmin.from("inventoryStock").select("*").eq("productId", productId).eq("warehouseId", fromWarehouseId).single()).data;

    const fromQuantity = fromStock ? Number(fromStock.quantity) : 0;
    if (fromQuantity < quantity) {
      return { error: `Insufficient stock. Available: ${fromQuantity}, Requested: ${quantity}` };
    }

    const toStock = (await supabaseAdmin.from("inventoryStock").select("*").eq("productId", productId).eq("warehouseId", toWarehouseId).single()).data;
    const toQuantity = toStock ? Number(toStock.quantity) : 0;

    // Deduct from source
    await supabaseAdmin.from("inventoryStock").upsert({
      productId, warehouseId: fromWarehouseId, quantity: fromQuantity - quantity
    }, { onConflict: "productId,warehouseId" });

    // Add to destination
    await supabaseAdmin.from("inventoryStock").upsert({
      productId, warehouseId: toWarehouseId, quantity: toQuantity + quantity
    }, { onConflict: "productId,warehouseId" });

    // Record movements
    await supabaseAdmin.from("inventoryMovement").insert({
      productId,
      warehouseId: fromWarehouseId,
      type: "TRANSFER_OUT",
      quantity,
      reference: `Transferred to ${toWarehouse.name}`,
      note: note || undefined,
      createdBy: session.user.id,
    });

    await supabaseAdmin.from("inventoryMovement").insert({
      productId,
      warehouseId: toWarehouseId,
      type: "TRANSFER_IN",
      quantity,
      reference: `Transferred from ${fromWarehouse.name}`,
      note: note || undefined,
      createdBy: session.user.id,
    });

    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return { data: { productId, fromWarehouseId, toWarehouseId, quantity } };
  } catch (error) {
    console.log("[TRANSFER_STOCK]", error);
    return { error: "Failed to transfer stock" };
  }
};

export const transferStock = createSafeAction(TransferStock, handler);

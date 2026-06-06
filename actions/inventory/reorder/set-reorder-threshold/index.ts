"use server";
import { getSession } from "@/lib/auth-server";
import { SetReorderThreshold } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { productId, warehouseId, minQuantity, maxQuantity, reorderPoint, reorderQuantity } = data;

  try {
    const product = (await supabaseAdmin.from("crm_Products").select("*").eq("id", productId).single()).data;
    if (!product || product.deletedAt) {
      return { error: "Product not found" };
    }

    const warehouse = (await supabaseAdmin.from("InventoryWarehouse").select("*").eq("id", warehouseId).single()).data;
    if (!warehouse) {
      return { error: "Warehouse not found" };
    }

    const thresholdResp = await supabaseAdmin.from("ReorderThreshold").upsert({
      productId,
      warehouseId,
      minQuantity,
      maxQuantity: maxQuantity || null,
      reorderPoint,
      reorderQuantity,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    }, { onConflict: "productId,warehouseId" }).select("*").single();
    
    if (thresholdResp.error) throw thresholdResp.error;
    const threshold = thresholdResp.data;

    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return { data: { productId: threshold.productId, warehouseId: threshold.warehouseId, reorderPoint: Number(threshold.reorderPoint) } };
  } catch (error) {
    console.log("[SET_REORDER_THRESHOLD]", error);
    return { error: "Failed to set reorder threshold" };
  }
};

export const setReorderThreshold = createSafeAction(SetReorderThreshold, handler);

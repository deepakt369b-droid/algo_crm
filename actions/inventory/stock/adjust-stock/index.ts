"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { AdjustStock } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { productId, warehouseId, newQuantity, note } = data;

  try {
    const product = await prismadb.crm_Products.findUnique({ where: { id: productId } });
    if (!product || product.deletedAt) {
      return { error: "Product not found" };
    }

    const warehouse = await prismadb.inventoryWarehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) {
      return { error: "Warehouse not found" };
    }

    // Get current stock
    const existingStock = await prismadb.inventoryStock.findUnique({
      where: { productId_warehouseId: { productId, warehouseId } },
    });

    const currentQuantity = existingStock ? Number(existingStock.quantity) : 0;
    const quantityDiff = newQuantity - currentQuantity;

    // Upsert stock record
    await prismadb.inventoryStock.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      update: { quantity: newQuantity },
      create: { productId, warehouseId, quantity: newQuantity },
    });

    // Record movement if quantity changed
    if (quantityDiff !== 0) {
      await prismadb.inventoryMovement.create({
        data: {
          productId,
          warehouseId,
          type: "ADJUSTMENT",
          quantity: Math.abs(quantityDiff),
          reference: note || "Manual adjustment",
          note: note || undefined,
          createdBy: session.user.id,
        },
      });
    }

    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return { data: { productId, warehouseId, quantity: newQuantity } };
  } catch (error) {
    console.log("[ADJUST_STOCK]", error);
    return { error: "Failed to adjust stock" };
  }
};

export const adjustStock = createSafeAction(AdjustStock, handler);

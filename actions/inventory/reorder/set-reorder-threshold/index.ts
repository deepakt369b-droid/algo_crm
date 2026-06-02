"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { SetReorderThreshold } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { productId, warehouseId, minQuantity, maxQuantity, reorderPoint, reorderQuantity } = data;

  try {
    const product = await prismadb.crm_Products.findUnique({ where: { id: productId } });
    if (!product || product.deletedAt) {
      return { error: "Product not found" };
    }

    const warehouse = await prismadb.inventoryWarehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) {
      return { error: "Warehouse not found" };
    }

    const threshold = await prismadb.reorderThreshold.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      update: {
        minQuantity,
        maxQuantity: maxQuantity || undefined,
        reorderPoint,
        reorderQuantity,
        updatedBy: session.user.id,
      },
      create: {
        productId,
        warehouseId,
        minQuantity,
        maxQuantity: maxQuantity || undefined,
        reorderPoint,
        reorderQuantity,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      },
    });

    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return { data: { productId: threshold.productId, warehouseId: threshold.warehouseId, reorderPoint: Number(threshold.reorderPoint) } };
  } catch (error) {
    console.log("[SET_REORDER_THRESHOLD]", error);
    return { error: "Failed to set reorder threshold" };
  }
};

export const setReorderThreshold = createSafeAction(SetReorderThreshold, handler);

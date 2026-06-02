"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { TransferStock } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";

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

    const product = await prismadb.crm_Products.findUnique({ where: { id: productId } });
    if (!product || product.deletedAt) {
      return { error: "Product not found" };
    }

    const fromWarehouse = await prismadb.inventoryWarehouse.findUnique({ where: { id: fromWarehouseId } });
    const toWarehouse = await prismadb.inventoryWarehouse.findUnique({ where: { id: toWarehouseId } });
    if (!fromWarehouse || !toWarehouse) {
      return { error: "Warehouse not found" };
    }

    // Get source stock
    const fromStock = await prismadb.inventoryStock.findUnique({
      where: { productId_warehouseId: { productId, warehouseId: fromWarehouseId } },
    });

    const fromQuantity = fromStock ? Number(fromStock.quantity) : 0;
    if (fromQuantity < quantity) {
      return { error: `Insufficient stock. Available: ${fromQuantity}, Requested: ${quantity}` };
    }

    // Deduct from source
    await prismadb.inventoryStock.upsert({
      where: { productId_warehouseId: { productId, warehouseId: fromWarehouseId } },
      update: { quantity: { decrement: quantity } },
      create: { productId, warehouseId: fromWarehouseId, quantity: -quantity },
    });

    // Add to destination
    await prismadb.inventoryStock.upsert({
      where: { productId_warehouseId: { productId, warehouseId: toWarehouseId } },
      update: { quantity: { increment: quantity } },
      create: { productId, warehouseId: toWarehouseId, quantity },
    });

    // Record movements
    await prismadb.inventoryMovement.create({
      data: {
        productId,
        warehouseId: fromWarehouseId,
        type: "TRANSFER_OUT",
        quantity,
        reference: `Transferred to ${toWarehouse.name}`,
        note: note || undefined,
        createdBy: session.user.id,
      },
    });

    await prismadb.inventoryMovement.create({
      data: {
        productId,
        warehouseId: toWarehouseId,
        type: "TRANSFER_IN",
        quantity,
        reference: `Transferred from ${fromWarehouse.name}`,
        note: note || undefined,
        createdBy: session.user.id,
      },
    });

    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return { data: { productId, fromWarehouseId, toWarehouseId, quantity } };
  } catch (error) {
    console.log("[TRANSFER_STOCK]", error);
    return { error: "Failed to transfer stock" };
  }
};

export const transferStock = createSafeAction(TransferStock, handler);

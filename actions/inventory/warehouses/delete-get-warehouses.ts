"use server";

import { prismadb } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

export async function deleteWarehouse(id: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Check if warehouse has stock
    const stockCount = await prismadb.inventoryStock.count({ where: { warehouseId: id, quantity: { gt: 0 } } });
    if (stockCount > 0) {
      return { error: "Cannot delete warehouse with existing stock. Transfer stock first." };
    }

    await prismadb.inventoryWarehouse.delete({ where: { id } });
    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return {};
  } catch (error) {
    console.log("[DELETE_WAREHOUSE]", error);
    return { error: "Failed to delete warehouse" };
  }
}

export async function getWarehouses() {
  const warehouses = await prismadb.inventoryWarehouse.findMany({
    orderBy: { name: "asc" },
  });
  return warehouses.map((w) => ({
    ...w,
  }));
}

export async function getWarehouseById(id: string) {
  const warehouse = await prismadb.inventoryWarehouse.findUnique({
    where: { id },
    include: {
      stock: {
        include: {
          product: { select: { id: true, name: true, sku: true, unit_price: true, currency: true } },
        },
      },
      thresholds: true,
    },
  });
  return warehouse;
}

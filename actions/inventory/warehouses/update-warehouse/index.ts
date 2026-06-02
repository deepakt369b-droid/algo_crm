"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { UpdateWarehouse } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { id, code, ...fields } = data;

  try {
    const existing = await prismadb.inventoryWarehouse.findUnique({ where: { id } });
    if (!existing) {
      return { error: "Warehouse not found" };
    }

    // Check code uniqueness if changed
    if (code && code !== existing.code) {
      const duplicate = await prismadb.inventoryWarehouse.findUnique({ where: { code } });
      if (duplicate) {
        return { error: "A warehouse with this code already exists" };
      }
    }

    const warehouse = await prismadb.inventoryWarehouse.update({
      where: { id },
      data: {
        ...fields,
        ...(code ? { code: code.toUpperCase() } : {}),
        updatedBy: session.user.id,
      },
    });

    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return { data: { id: warehouse.id, name: warehouse.name, code: warehouse.code } };
  } catch (error) {
    console.log("[UPDATE_WAREHOUSE]", error);
    return { error: "Failed to update warehouse" };
  }
};

export const updateWarehouse = createSafeAction(UpdateWarehouse, handler);

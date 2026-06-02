"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { CreateWarehouse } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { name, code, description, address, city, country, isActive } = data;

  try {
    // Check for duplicate code
    const existing = await prismadb.inventoryWarehouse.findUnique({ where: { code } });
    if (existing) {
      return { error: "A warehouse with this code already exists" };
    }

    const warehouse = await prismadb.inventoryWarehouse.create({
      data: {
        name,
        code: code.toUpperCase(),
        description: description || undefined,
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
        isActive,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      },
    });

    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return { data: { id: warehouse.id, name: warehouse.name, code: warehouse.code } };
  } catch (error) {
    console.log("[CREATE_WAREHOUSE]", error);
    return { error: "Failed to create warehouse" };
  }
};

export const createWarehouse = createSafeAction(CreateWarehouse, handler);

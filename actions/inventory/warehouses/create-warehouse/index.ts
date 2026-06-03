"use server";
import { getSession } from "@/lib/auth-server";

import { CreateWarehouse } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { name, code, description, address, city, country, isActive } = data;

  try {
    // Check for duplicate code
    const existing = (await supabaseAdmin.from("inventoryWarehouse").select("*").eq("code", code).single()).data;
    if (existing) {
      return { error: "A warehouse with this code already exists" };
    }

    const warehouse = (await supabaseAdmin.from("inventoryWarehouse").insert({
                name,
                code: code.toUpperCase(),
                description: description || undefined,
                address: address || undefined,
                city: city || undefined,
                country: country || undefined,
                isActive,
                createdBy: session.user.id,
                updatedBy: session.user.id,
              }).select("*").single()).data;

    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return { data: { id: warehouse.id, name: warehouse.name, code: warehouse.code } };
  } catch (error) {
    console.log("[CREATE_WAREHOUSE]", error);
    return { error: "Failed to create warehouse" };
  }
};

export const createWarehouse = createSafeAction(CreateWarehouse, handler);

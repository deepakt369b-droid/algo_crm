"use server";
import { getSession } from "@/lib/auth-server";

import { UpdateWarehouse } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { id, code, ...fields } = data;

  try {
    const existing = (await supabaseAdmin.from("inventoryWarehouse").select("*").eq("id", id).single()).data;
    if (!existing) {
      return { error: "Warehouse not found" };
    }

    // Check code uniqueness if changed
    if (code && code !== existing.code) {
      const duplicate = (await supabaseAdmin.from("inventoryWarehouse").select("*").eq("code", code).single()).data;
      if (duplicate) {
        return { error: "A warehouse with this code already exists" };
      }
    }

    const warehouse = (await supabaseAdmin.from("inventoryWarehouse").update({
                ...fields,
                ...(code ? { code: code.toUpperCase() } : {}),
                updatedBy: session.user.id,
              }).select("*").single().eq("id", id).select("*").single()).data;

    revalidatePath("/[locale]/(routes)/admin/inventory", "page");
    return { data: { id: warehouse.id, name: warehouse.name, code: warehouse.code } };
  } catch (error) {
    console.log("[UPDATE_WAREHOUSE]", error);
    return { error: "Failed to update warehouse" };
  }
};

export const updateWarehouse = createSafeAction(UpdateWarehouse, handler);

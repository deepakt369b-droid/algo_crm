"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const updateTargetList = async (data: {
  id: string;
  name?: string;
  description?: string;
  status?: boolean;
}) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { id, name, description, status } = data;
  if (!id) return { error: "id is required" };

  try {
    const existing = (await supabaseAdmin.from("crm_TargetLists").select("*").eq("id", id).eq("deletedAt", null).single()).data;
    if (!existing) return { error: "Target list not found" };
    const list = (await supabaseAdmin.from("crm_TargetLists").update({ name, description, status }).eq("id", id).select("*").single()).data;
    revalidatePath("/[locale]/(routes)/crm/target-lists", "page");
    return { data: list };
  } catch (error) {
    return { error: "Failed to update target list" };
  }
};

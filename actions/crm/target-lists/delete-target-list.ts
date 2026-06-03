"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const deleteTargetList = async (targetListId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  if (!targetListId) return { error: "targetListId is required" };

  try {
    (await supabaseAdmin.from("crm_TargetLists").update({ deletedAt: new Date(), deletedBy: session.user.id }).eq("id", targetListId).select("*").single()).data;
    revalidatePath("/[locale]/(routes)/crm/target-lists", "page");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete target list" };
  }
};

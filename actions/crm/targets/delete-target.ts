"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const deleteTarget = async (targetId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  if (!targetId) return { error: "targetId is required" };

  try {
    (await supabaseAdmin.from("crm_Targets").update({ deletedAt: new Date(), deletedBy: session.user.id }).eq("id", targetId).select("*").single()).data;
    revalidatePath("/[locale]/(routes)/crm/targets", "page");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete target" };
  }
};

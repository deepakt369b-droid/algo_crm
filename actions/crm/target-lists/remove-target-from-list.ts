"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const removeTargetFromList = async (targetListId: string, targetId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  if (!targetId) return { error: "targetId is required" };

  try {
    (await supabaseAdmin.from("TargetsToTargetLists").delete().select("*").single()).data;
    revalidatePath("/[locale]/(routes)/crm/target-lists", "page");
    return { success: true };
  } catch (error) {
    return { error: "Failed to remove target from list" };
  }
};

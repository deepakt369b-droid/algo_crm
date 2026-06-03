"use server";
import { getSession } from "@/lib/auth-server";

import { junctionTableHelpers } from "@/lib/junction-helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const unwatchAccount = async (accountId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  if (!accountId) return { error: "accountId is required" };

  try {
    (await supabaseAdmin.from("crm_Accounts").update({
                  watchers: junctionTableHelpers.removeAccountWatcher(
                    accountId,
                    session.user.id
                  ),
                }).select("*").single().eq("id", accountId).select("*").single()).data;
    return { success: true };
  } catch (error) {
    console.log("[UNWATCH_ACCOUNT]", error);
    return { error: "Failed to unwatch account" };
  }
};

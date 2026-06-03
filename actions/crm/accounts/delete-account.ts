"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit-log";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const deleteAccount = async (accountId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  if (!accountId) return { error: "accountId is required" };

  try {
    (await supabaseAdmin.from("crm_Accounts").update({ deletedAt: new Date(), deletedBy: session.user.id }).eq("id", accountId).select("*").single()).data;
    await writeAuditLog({
      entityType: "account",
      entityId: accountId,
      action: "deleted",
      changes: null,
      userId: session.user.id,
    });
    revalidatePath("/[locale]/(routes)/crm/accounts", "page");
    return { success: true };
  } catch (error) {
    console.log("[DELETE_ACCOUNT]", error);
    return { error: "Failed to delete account" };
  }
};

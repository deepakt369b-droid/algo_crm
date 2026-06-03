"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit-log";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const restoreAccount = async (accountId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  if (session.user.role !== "admin") return { error: "Forbidden" };
  if (!accountId) return { error: "accountId is required" };

  try {
    (await supabaseAdmin.from("crm_Accounts").update({ deletedAt: null, deletedBy: null }).eq("id", accountId).select("*").single()).data;
    await writeAuditLog({
      entityType: "account",
      entityId: accountId,
      action: "restored",
      changes: null,
      userId: session.user.id,
    });
    revalidatePath("/[locale]/(routes)/crm/accounts", "page");
    revalidatePath("/[locale]/(routes)/admin/audit-log", "page");
    return { success: true };
  } catch (error) {
    console.log("[RESTORE_ACCOUNT]", error);
    return { error: "Failed to restore account" };
  }
};

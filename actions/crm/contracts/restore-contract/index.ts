"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit-log";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const restoreContract = async (contractId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  if (session.user.role !== "admin") return { error: "Forbidden" };
  if (!contractId) return { error: "contractId is required" };

  try {
    (await supabaseAdmin.from("crm_Contracts").update({ deletedAt: null, deletedBy: null }).select("*").single().eq("id", contractId).select("*").single()).data;
    await writeAuditLog({
      entityType: "contract",
      entityId: contractId,
      action: "restored",
      changes: null,
      userId: session.user.id,
    });
    revalidatePath("/[locale]/(routes)/crm/contracts", "page");
    revalidatePath("/[locale]/(routes)/admin/audit-log", "page");
    return { success: true };
  } catch (error) {
    console.log("[RESTORE_CONTRACT]", error);
    return { error: "Failed to restore contract" };
  }
};

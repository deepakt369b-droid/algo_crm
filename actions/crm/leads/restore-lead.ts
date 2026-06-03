"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit-log";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const restoreLead = async (leadId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  if (session.user.role !== "admin") return { error: "Forbidden" };
  if (!leadId) return { error: "leadId is required" };

  try {
    (await supabaseAdmin.from("crm_Leads").update({ deletedAt: null, deletedBy: null }).eq("id", leadId).select("*").single()).data;
    await writeAuditLog({
      entityType: "lead",
      entityId: leadId,
      action: "restored",
      changes: null,
      userId: session.user.id,
    });
    revalidatePath("/[locale]/(routes)/crm/leads", "page");
    revalidatePath("/[locale]/(routes)/admin/audit-log", "page");
    return { success: true };
  } catch (error) {
    console.log("[RESTORE_LEAD]", error);
    return { error: "Failed to restore lead" };
  }
};

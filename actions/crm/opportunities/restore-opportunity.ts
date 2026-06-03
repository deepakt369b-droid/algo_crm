"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit-log";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const restoreOpportunity = async (opportunityId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  if (session.user.role !== "admin") return { error: "Forbidden" };
  if (!opportunityId) return { error: "opportunityId is required" };

  try {
    (await supabaseAdmin.from("crm_Opportunities").update({ deletedAt: null, deletedBy: null }).eq("id", opportunityId).select("*").single()).data;
    await writeAuditLog({
      entityType: "opportunity",
      entityId: opportunityId,
      action: "restored",
      changes: null,
      userId: session.user.id,
    });
    revalidatePath("/[locale]/(routes)/crm/opportunities", "page");
    revalidatePath("/[locale]/(routes)/admin/audit-log", "page");
    return { success: true };
  } catch (error) {
    console.log("[RESTORE_OPPORTUNITY]", error);
    return { error: "Failed to restore opportunity" };
  }
};

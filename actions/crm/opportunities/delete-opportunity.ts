"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit-log";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const deleteOpportunity = async (opportunityId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  if (!opportunityId) return { error: "opportunityId is required" };

  try {
    (await supabaseAdmin.from("crm_Opportunities").update({ deletedAt: new Date(), deletedBy: session.user.id }).eq("id", opportunityId).select("*").single()).data;
    await writeAuditLog({
      entityType: "opportunity",
      entityId: opportunityId,
      action: "deleted",
      changes: null,
      userId: session.user.id,
    });
    revalidatePath("/[locale]/(routes)/crm/opportunities", "page");
    return { success: true };
  } catch (error) {
    console.log("[DELETE_OPPORTUNITY]", error);
    return { error: "Failed to delete opportunity" };
  }
};

"use server";
import { getSession } from "@/lib/auth-server";

import { writeAuditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { sumLineTotals } from "@/lib/line-items";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const removeOpportunityLineItem = async (id: string) => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const lineItem = (await supabaseAdmin.from("crm_OpportunityLineItems").select("*").eq("id", id).single()).data;
    if (!lineItem) {
      return { error: "Line item not found" };
    }

    (await supabaseAdmin.from("crm_OpportunityLineItems").delete().eq("id", id).select("*").single()).data;

    const remaining = (await supabaseAdmin.from("crm_OpportunityLineItems").select("*").eq("opportunityId", lineItem.opportunityId)).data;
    if (remaining.length > 0) {
      const newTotal = sumLineTotals(remaining);
      (await supabaseAdmin.from("crm_Opportunities").update({ expected_revenue: newTotal }).eq("id", lineItem.opportunityId).select("*").single()).data;
    }

    await writeAuditLog({
      entityType: "opportunity_line_item",
      entityId: id,
      action: "deleted",
      changes: null,
      userId: session.user.id,
    });

    revalidatePath("/[locale]/(routes)/crm/opportunities/[opportunityId]", "page");
    return { data: { id } };
  } catch (error) {
    console.log("[REMOVE_OPPORTUNITY_LINE_ITEM]", error);
    return { error: "Failed to remove line item" };
  }
};

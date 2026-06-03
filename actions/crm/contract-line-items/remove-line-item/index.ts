"use server";
import { getSession } from "@/lib/auth-server";

import { writeAuditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { sumLineTotals } from "@/lib/line-items";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const removeContractLineItem = async (id: string) => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const lineItem = (await supabaseAdmin.from("crm_ContractLineItems").select("*").eq("id", id).single()).data;
    if (!lineItem) {
      return { error: "Line item not found" };
    }

    (await supabaseAdmin.from("crm_ContractLineItems").delete().select("*").single().eq("id", id).select("*").single()).data;

    const remaining = (await supabaseAdmin.from("crm_ContractLineItems").select("*").eq("contractId", lineItem.contractId)).data;
    if (remaining.length > 0) {
      const newTotal = sumLineTotals(remaining);
      (await supabaseAdmin.from("crm_Contracts").update({ value: newTotal }).select("*").single().eq("id", lineItem.contractId).select("*").single()).data;
    }

    await writeAuditLog({
      entityType: "contract_line_item",
      entityId: id,
      action: "deleted",
      changes: null,
      userId: session.user.id,
    });

    revalidatePath("/[locale]/(routes)/crm/contracts/[contractId]", "page");
    return { data: { id } };
  } catch (error) {
    console.log("[REMOVE_CONTRACT_LINE_ITEM]", error);
    return { error: "Failed to remove line item" };
  }
};

"use server";
import { getSession } from "@/lib/auth-server";

import { writeAuditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { sumLineTotals } from "@/lib/line-items";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const copyLineItemsFromOpportunity = async (
  contractId: string,
  opportunityId: string
) => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    const [contract, opportunity] = await Promise.all([
      (await supabaseAdmin.from("crm_Contracts").select("*").eq("id", contractId).single()).data,
      (await supabaseAdmin.from("crm_Opportunities").select("*").eq("id", opportunityId).single()).data,
    ]);

    if (!contract || contract.deletedAt) return { error: "Contract not found" };
    if (!opportunity || opportunity.deletedAt) return { error: "Opportunity not found" };

    const contractCurrency = contract.currency || "EUR";
    const opportunityCurrency = opportunity.currency || "EUR";
    if (contractCurrency !== opportunityCurrency) {
      return {
        error: `Currency mismatch: contract uses ${contractCurrency} but opportunity uses ${opportunityCurrency}. Cannot copy line items across currencies.`,
      };
    }

    const sourceItems = (await supabaseAdmin.from("crm_OpportunityLineItems").select("*").eq("opportunityId", opportunityId).order("sort_order", { ascending: true })).data;

    if (sourceItems.length === 0) {
      return { error: "No line items found on the source opportunity" };
    }

    const existingItems = (await supabaseAdmin.from("crm_ContractLineItems").select("*").eq("contractId", contractId).order("sort_order", { ascending: false }).limit(1)).data;
    const startOrder = existingItems.length > 0 ? existingItems[0].sort_order + 1 : 0;

    await supabaseAdmin.from("crm_ContractLineItems").insertMany({
      data: sourceItems.map((item, index) => ({
        contractId,
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_type: item.discount_type,
        discount_value: item.discount_value,
        line_total: item.line_total,
        currency: item.currency,
        sort_order: startOrder + index,
        createdBy: userId,
        updatedBy: userId,
      })),
    });

    const allContractItems = (await supabaseAdmin.from("crm_ContractLineItems").select("*").eq("contractId", contractId)).data;
    const newTotal = sumLineTotals(allContractItems);
    (await supabaseAdmin.from("crm_Contracts").update({ value: newTotal }).eq("id", contractId).select("*").single()).data;

    await writeAuditLog({
      entityType: "contract_line_item",
      entityId: contractId,
      action: "created",
      changes: null,
      userId,
    });

    revalidatePath("/[locale]/(routes)/crm/contracts/[contractId]", "page");
    return { data: { copied: sourceItems.length } };
  } catch (error) {
    console.log("[COPY_LINE_ITEMS_FROM_OPPORTUNITY]", error);
    return { error: "Failed to copy line items" };
  }
};

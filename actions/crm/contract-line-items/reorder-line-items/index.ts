"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const reorderContractLineItems = async (
  items: { id: string; sort_order: number }[]
) => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await Promise.all(
      items.map((item) =>
        (await supabaseAdmin.from("crm_ContractLineItems").update({ sort_order: item.sort_order }).select("*").single().eq("id", item.id).select("*").single()).data
      )
    );

    revalidatePath("/[locale]/(routes)/crm/contracts/[contractId]", "page");
    return { data: { success: true } };
  } catch (error) {
    console.log("[REORDER_CONTRACT_LINE_ITEMS]", error);
    return { error: "Failed to reorder line items" };
  }
};

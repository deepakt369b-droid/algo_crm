import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getContractLineItems = cache(async (contractId: string) => {
  return (await supabaseAdmin.from("crm_ContractLineItems").select("*, product(id, name, status)").eq("contractId", contractId).order("sort_order", { ascending: true })).data;
});

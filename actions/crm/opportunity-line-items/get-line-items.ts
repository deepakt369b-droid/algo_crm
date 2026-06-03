import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getOpportunityLineItems = cache(async (opportunityId: string) => {
  return (await supabaseAdmin.from("crm_OpportunityLineItems").select("*, product(id, name, status)").eq("opportunityId", opportunityId).order("sort_order", { ascending: true })).data;
});

import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAccountsByOpportunityId = async (opportunityId: string) => {
  const data = (await supabaseAdmin.from("crm_Accounts").select("*").is("deletedAt", null).order("createdAt", { ascending: false })).data;
  return data;
};

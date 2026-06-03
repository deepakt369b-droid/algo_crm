import { supabaseAdmin } from "@/lib/supabase-admin";

export const getOpportunitiesCount = async () => {
  const data = (await supabaseAdmin.from("crm_Opportunities").select("*", { count: 'exact', head: true }).eq("deletedAt", null)).count;
  return data;
};

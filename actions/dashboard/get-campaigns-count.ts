import { supabaseAdmin } from "@/lib/supabase-admin";

export const getCampaignsCount = async () => {
  const data = (await supabaseAdmin.from("crm_campaigns").select("*", { count: 'exact', head: true })).count;
  return data;
};

import { supabaseAdmin } from "@/lib/supabase-admin";

export const getCampaigns = async () => {
  const data = (await supabaseAdmin.from("crm_campaigns").select("*")).data;
  return data;
};

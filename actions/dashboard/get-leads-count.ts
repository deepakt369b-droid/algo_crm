import { supabaseAdmin } from "@/lib/supabase-admin";

export const getLeadsCount = async () => {
  const data = (await supabaseAdmin.from("crm_Leads").select("*", { count: 'exact', head: true }).eq("deletedAt", null)).count;
  return data;
};

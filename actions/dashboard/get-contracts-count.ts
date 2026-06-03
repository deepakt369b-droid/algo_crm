import { supabaseAdmin } from "@/lib/supabase-admin";

export const getContractsCount = async () => {
  const data = (await supabaseAdmin.from("crm_Contracts").select("*", { count: 'exact', head: true }).eq("deletedAt", null)).count;
  return data;
};

import { supabaseAdmin } from "@/lib/supabase-admin";

export const getTargetsCount = async () => {
  const data = (await supabaseAdmin.from("crm_Targets").select("*", { count: 'exact', head: true })).count;
  return data ?? 0;
};

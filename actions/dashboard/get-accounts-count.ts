import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAccountsCount = async () => {
  const data = (await supabaseAdmin.from("crm_Accounts").select("*", { count: 'exact', head: true }).is("deletedAt", null)).count;
  return data;
};

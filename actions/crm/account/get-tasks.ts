import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAccountsTasks = async (accountId: string) => {
  const data = (await supabaseAdmin.from("crm_Accounts_Tasks").select("*, assigned_user(id, name)").eq("account", accountId)).data;
  return data;
};

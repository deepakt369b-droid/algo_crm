import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAccountsTasks = async (accountId: string) => {
  const { data, error } = await supabaseAdmin
    .from("crm_Accounts_Tasks")
    .select("*, assigned_user:Users!crm_Accounts_Tasks_user_fkey(id, name)")
    .eq("account", accountId);

  if (error) {
    console.error("[CRM_ACCOUNT_TASKS_ERROR]", error);
    return [];
  }

  return data ?? [];
};

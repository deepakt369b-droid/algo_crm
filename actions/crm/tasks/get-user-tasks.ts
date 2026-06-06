import { supabaseAdmin } from "@/lib/supabase-admin";

export const getUserCRMTasks = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from("crm_Accounts_Tasks")
    .select("*, assigned_user:Users!crm_Accounts_Tasks_user_fkey(id, name)")
    .eq("user", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("[CRM_USER_TASKS_ERROR]", error);
    return [];
  }

  return data ?? [];
};

import { supabaseAdmin } from "@/lib/supabase-admin";

export const getUserCRMTasks = async (userId: string) => {
  const data = (await supabaseAdmin.from("crm_Accounts_Tasks").select("*, assigned_user(id, name)").eq("user", userId).order("createdAt", { ascending: false })).data;

  return data;
};

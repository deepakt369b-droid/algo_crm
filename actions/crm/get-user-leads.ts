import { supabaseAdmin } from "@/lib/supabase-admin";

export const getUserLeads = async (userId: string) => {
  const data = (await supabaseAdmin.from("crm_Leads").select("*").eq("assigned_to", userId).is("deletedAt", null).order("createdAt", { ascending: false })).data;
  return data;
};

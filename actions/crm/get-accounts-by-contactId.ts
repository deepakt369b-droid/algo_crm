import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAccountsByContactId = async (contactId: string) => {
  const data = (await supabaseAdmin.from("crm_Accounts").select("*").eq("deletedAt", null).order("createdAt", { ascending: false })).data;
  return data;
};

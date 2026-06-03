import { supabaseAdmin } from "@/lib/supabase-admin";

export const getContactCount = async () => {
  const data = (await supabaseAdmin.from("crm_Contacts").select("*", { count: 'exact', head: true }).eq("deletedAt", null)).count;
  return data;
};

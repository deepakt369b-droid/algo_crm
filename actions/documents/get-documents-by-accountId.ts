import { supabaseAdmin } from "@/lib/supabase-admin";

export const getDocumentsByAccountId = async (accountId: string) => {
  // Query through DocumentsToAccounts junction table
  const data = (await supabaseAdmin.from("Documents").select("*").order("date_created", { ascending: false })).data;
  return data;
};

import { supabaseAdmin } from "@/lib/supabase-admin";

export const getDocumentsByContactId = async (contactId: string) => {
  // Query through DocumentsToContacts junction table
  const data = (await supabaseAdmin.from("Documents").select("*").order("date_created", { ascending: false })).data;
  return data;
};

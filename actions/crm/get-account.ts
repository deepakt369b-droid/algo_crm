import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAccount = async (accountId: string) => {
  const data = (await supabaseAdmin.from("crm_Accounts").select("*, contacts, opportunities, documents(*, document(id, document_name, document_type, document_file_url, document_file_mimeType, createdAt, created_by(id, name, email))), assigned_to_user(name), watchers(*, user(id, name, email, avatar))").eq("id", accountId).eq("deletedAt", null).single()).data;
  return data;
};

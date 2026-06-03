import { supabaseAdmin } from "@/lib/supabase-admin";

export const getCrMTask = async (taskId: string) => {
  const data = (await supabaseAdmin.from("crm_Accounts_Tasks").select("*, assigned_user(id, name), documents(*, document(id, document_name, document_file_url, document_file_mimeType, assigned_to_user(name), created_by(name))), comments(id, comment, createdAt, assigned_user(id, name, avatar))").eq("id", taskId).single()).data;
  return data;
};

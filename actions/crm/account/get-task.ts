import { supabaseAdmin } from "@/lib/supabase-admin";

export const getCrMTask = async (taskId: string) => {
  const { data, error } = await supabaseAdmin
    .from("crm_Accounts_Tasks")
    .select(`
      *,
      assigned_user:Users!crm_Accounts_Tasks_user_fkey(id, name),
      documents:DocumentsToCrmAccountsTasks!DocumentsToCrmAccountsTasks_crm_accounts_task_id_fkey(
        *,
        document:Documents!DocumentsToCrmAccountsTasks_document_id_fkey(
          id,
          document_name,
          document_file_url,
          document_file_mimeType,
          assigned_to_user:Users!Documents_assigned_user_fkey(name),
          created_by:Users!Documents_created_by_user_fkey(name)
        )
      ),
      comments:tasksComments!tasksComments_assigned_crm_account_task_fkey(
        id,
        comment,
        createdAt,
        assigned_user:Users!tasksComments_user_fkey(id, name, avatar)
      )
    `)
    .eq("id", taskId)
    .maybeSingle();

  if (error) {
    console.error("[CRM_ACCOUNT_TASK_ERROR]", error);
    return null;
  }

  return data;
};

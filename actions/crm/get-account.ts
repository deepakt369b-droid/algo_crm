import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAccount = async (accountId: string) => {
  const { data, error } = await supabaseAdmin
    .from("crm_Accounts")
    .select(`
      *,
      contacts:crm_Contacts!crm_Contacts_accountsIDs_fkey(*),
      opportunities:crm_Opportunities!crm_Opportunities_account_fkey(*),
      documents:DocumentsToAccounts!DocumentsToAccounts_account_id_fkey(
        *,
        document:Documents!DocumentsToAccounts_document_id_fkey(
          id,
          document_name,
          document_type,
          document_file_url,
          document_file_mimeType,
          createdAt,
          created_by:Users!Documents_created_by_user_fkey(id, name, email)
        )
      ),
      assigned_to_user:Users!crm_Accounts_assigned_to_fkey(name),
      watchers:AccountWatchers!AccountWatchers_account_id_fkey(
        *,
        user:Users!AccountWatchers_user_id_fkey(id, name, email, avatar)
      )
    `)
    .eq("id", accountId)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) {
    console.error("[CRM_ACCOUNT_DETAIL_ERROR]", error);
    return null;
  }

  return data;
};

"use server";
import {
  requireAuthenticated,
  documentReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getDocuments = async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  const { data: documents, error } = await supabaseAdmin
    .from("Documents")
    .select(`
      *,
      created_by:Users!Documents_created_by_user_fkey(id, name, email),
      assigned_to_user:Users!Documents_assigned_user_fkey(id, name, email),
      accounts:DocumentsToAccounts!DocumentsToAccounts_document_id_fkey(
        account:crm_Accounts!DocumentsToAccounts_account_id_fkey(id, name)
      )
    `)
    .is("parent_document_id", null)
    .order("date_created", { ascending: false });

  if (error) {
    console.error("[DOCUMENTS_LIST_ERROR]", error);
    return [];
  }

  return documents ?? [];
};

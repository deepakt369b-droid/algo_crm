import { cache } from "react";

import {
  requireAuthenticated,
  leadReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getLeads = cache(async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  const { data, error } = await supabaseAdmin
    .from("crm_Leads")
    .select(`
      *,
      assigned_to_user:Users!crm_Leads_assigned_to_fkey(name),
      assigned_accounts:crm_Accounts!crm_Leads_accountsIDs_fkey(id, name),
      documents:DocumentsToLeads!DocumentsToLeads_lead_id_fkey(
        *,
        document:Documents!DocumentsToLeads_document_id_fkey(id, document_name)
      )
    `)
    .order("createdAt", { ascending: false });
  if (error) {
    console.error("[CRM_LEADS_LIST_ERROR]", error);
    return [];
  }
  return data ?? [];
});

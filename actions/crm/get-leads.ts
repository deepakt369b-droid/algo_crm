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

  // Build the query, then apply the read scope. PostgREST's `or()`
  // takes a comma-separated list of filter conditions. Empty string
  // for admins/superadmins (no extra filter needed).
  const scope = leadReadScopeWhere(user);
  const baseQuery = supabaseAdmin
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
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

  const query = scope ? baseQuery.or(scope) : baseQuery;

  const { data, error } = await query;
  if (error) {
    console.error("[CRM_LEADS_LIST_ERROR]", error);
    return [];
  }
  return data ?? [];
});

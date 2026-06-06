
import {
  requireAuthenticated,
  assertCanReadLead,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getLead = async (leadId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }

  try {
    await assertCanReadLead(user, leadId);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }

  const { data, error } = await supabaseAdmin
    .from("crm_Leads")
    .select(`
      *,
      lead_source:crm_Lead_Sources!crm_Leads_lead_source_id_fkey(id, name),
      lead_status:crm_Lead_Statuses!crm_Leads_lead_status_id_fkey(id, name),
      lead_type:crm_Lead_Types!crm_Leads_lead_type_id_fkey(id, name),
      assigned_to_user:Users!crm_Leads_assigned_to_fkey(id, name),
      assigned_accounts:crm_Accounts!crm_Leads_accountsIDs_fkey(*),
      documents:DocumentsToLeads!DocumentsToLeads_lead_id_fkey(
        *,
        document:Documents!DocumentsToLeads_document_id_fkey(
          id,
          document_name,
          document_type,
          document_file_url,
          document_file_mimeType,
          createdAt,
          created_by:Users!Documents_created_by_user_fkey(id, name, email)
        )
      )
    `)
    .eq("id", leadId)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) {
    console.error("[CRM_LEAD_DETAIL_ERROR]", error);
    return null;
  }

  return data;
};


import {
  requireAuthenticated,
  assertCanReadOpportunity,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { serializeDecimals } from "@/lib/serialize-decimals";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getOpportunity = async (opportunityId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }

  try {
    await assertCanReadOpportunity(user, opportunityId);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }

  const { data, error } = await supabaseAdmin
    .from("crm_Opportunities")
    .select(`
      *,
      assigned_account:crm_Accounts!crm_Opportunities_account_fkey(name),
      assigned_sales_stage:crm_Opportunities_Sales_Stages!crm_Opportunities_sales_stage_fkey(name),
      assigned_type:crm_Opportunities_Type!crm_Opportunities_type_fkey(name),
      contacts:ContactsToOpportunities!ContactsToOpportunities_opportunity_id_fkey(
        *,
        contact:crm_Contacts!ContactsToOpportunities_contact_id_fkey(id, first_name, last_name, office_phone, mobile_phone, email)
      ),
      assigned_to_user:Users!crm_Opportunities_assigned_to_fkey(name, email),
      created_by_user:Users!crm_Opportunities_createdBy_fkey(name, email),
      lineItems:crm_OpportunityLineItems!crm_OpportunityLineItems_opportunityId_fkey(
        *,
        product:crm_Products!crm_OpportunityLineItems_productId_fkey(id, name, status)
      ),
      documents:DocumentsToOpportunities!DocumentsToOpportunities_opportunity_id_fkey(
        *,
        document:Documents!DocumentsToOpportunities_document_id_fkey(
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
    .eq("id", opportunityId)
    .is("deletedAt", null)
    .maybeSingle();
  if (error) {
    console.error("[CRM_OPPORTUNITY_DETAIL_ERROR]", error);
    return null;
  }
  return serializeDecimals(data);
};

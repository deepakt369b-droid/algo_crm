
import {
  requireAuthenticated,
  assertCanReadContact,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getContact = async (contactId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }

  try {
    await assertCanReadContact(user, contactId);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }

  const { data, error } = await supabaseAdmin
    .from("crm_Contacts")
    .select(`
      *,
      opportunities:ContactsToOpportunities!ContactsToOpportunities_contact_id_fkey(
        *,
        opportunity:crm_Opportunities!ContactsToOpportunities_opportunity_id_fkey(id, name, sales_stage, close_date, budget)
      ),
      documents:DocumentsToContacts!DocumentsToContacts_contact_id_fkey(
        *,
        document:Documents!DocumentsToContacts_document_id_fkey(
          id,
          document_name,
          document_type,
          document_file_url,
          document_file_mimeType,
          createdAt,
          created_by:Users!Documents_created_by_user_fkey(id, name, email)
        )
      ),
      contact_type:crm_Contact_Types!crm_Contacts_contact_type_id_fkey(id, name),
      assigned_accounts:crm_Accounts!crm_Contacts_accountsIDs_fkey(*),
      assigned_to_user:Users!crm_Contacts_assigned_to_fkey(id, name, email),
      crate_by_user:Users!crm_Contacts_createdBy_fkey(id, name, email)
    `)
    .eq("id", contactId)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) {
    console.error("[CRM_CONTACT_DETAIL_ERROR]", error);
    return null;
  }

  return data;
};

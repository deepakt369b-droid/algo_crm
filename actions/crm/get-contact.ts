
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

  const data = (await supabaseAdmin.from("crm_Contacts").select("*, opportunities(*, opportunity(id, name, sales_stage, close_date, budget)), documents(*, document(id, document_name, document_type, document_file_url, document_file_mimeType, createdAt, created_by(id, name, email))), contact_type(id, name), assigned_accounts, assigned_to_user(id, name, email), crate_by_user(id, name, email)").eq("id", contactId).eq("deletedAt", null).single()).data;
  return data;
};

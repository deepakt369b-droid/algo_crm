
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

  const data = (await supabaseAdmin.from("crm_Leads").select("*, lead_source(id, name), lead_status(id, name), lead_type(id, name), assigned_to_user(id, name), assigned_accounts, documents(*, document(id, document_name, document_type, document_file_url, document_file_mimeType, createdAt, created_by(id, name, email)))").eq("id", leadId).eq("deletedAt", null).single()).data;
  return data;
};

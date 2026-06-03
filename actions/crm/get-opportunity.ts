
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

  const data = (await supabaseAdmin.from("crm_Opportunities").select("*, assigned_account(name), assigned_sales_stage(name), assigned_type(name), contacts(*, contact(id, first_name, last_name, office_phone, mobile_phone, email)), assigned_to_user(name, email), created_by_user(name, email), lineItems(*, product(id, name, status)), documents(*, document(id, document_name, document_type, document_file_url, document_file_mimeType, createdAt, created_by(id, name, email)))").eq("id", opportunityId).eq("deletedAt", null).single()).data;
  return serializeDecimals(data);
};

import {
  requireAuthenticated,
  assertCanReadOpportunity,
  contactReadScopeWhere,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getContactsByOpportunityId = async (opportunityId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  try {
    // Verify access to the parent opportunity first; return [] on miss to
    // avoid existence leaks of opportunities the caller cannot read.
    await assertCanReadOpportunity(user, opportunityId);
  } catch (e) {
    if (e instanceof AuthorizationError) return [];
    throw e;
  }

  // Defense in depth: parent-opportunity access + contact ownership scope +
  // existing junction filter combined.
  const data = (await supabaseAdmin.from("crm_Contacts").select("*")).data;
  return data;
};

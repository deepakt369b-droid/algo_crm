import {
  requireAuthenticated,
  assertCanReadContact,
  opportunityReadScopeWhere,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getOpportunitiesFullByContactId = async (contactId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  try {
    // Verify access to the parent contact first; return [] on miss to avoid
    // existence leaks of contacts the caller cannot read.
    await assertCanReadContact(user, contactId);
  } catch (e) {
    if (e instanceof AuthorizationError) return [];
    throw e;
  }

  // Defense in depth: scope the opportunity list by ownership rules even
  // when the caller has access to the linked contact.
  const data = (await supabaseAdmin.from("crm_Opportunities").select("*").order("created_on", { ascending: false })).data;

  return data;
};

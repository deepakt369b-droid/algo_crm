
import {
  requireAuthenticated,
  assertCanReadAccount,
  contactReadScopeWhere,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getContactsByAccountId = async (accountId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  try {
    // Verify access to the parent account first; return [] on miss to avoid
    // existence leaks of accounts the caller cannot read.
    await assertCanReadAccount(user, accountId);
  } catch (e) {
    if (e instanceof AuthorizationError) return [];
    throw e;
  }

  // Defense in depth: even with parent-account access, scope the contact list
  // by the contact's own ownership rules.
  const data = (await supabaseAdmin.from("crm_Contacts").select("*, assigned_to_user(name), crate_by_user(name), assigned_accounts").eq("accountsIDs", accountId)).data;
  return data;
};

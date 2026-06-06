
import {
  requireAuthenticated,
  assertCanReadAccount,
  opportunityReadScopeWhere,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getOpportunitiesFullByAccountId = async (accountId: string) => {
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

  // Defense in depth: scope the opportunity list by ownership rules even
  // when the caller has access to the parent account.
  const data = (await supabaseAdmin
    .from("crm_Opportunities")
    .select(`
      *,
      assigned_account:crm_Accounts!crm_Opportunities_account_fkey(name),
      assigned_sales_stage:crm_Opportunities_Sales_Stages!crm_Opportunities_sales_stage_fkey(name),
      assigned_to_user:Users!crm_Opportunities_assigned_to_fkey(name)
    `)
    .eq("account", accountId)
    .order("created_on", { ascending: false })).data ?? [];

  return data;
};

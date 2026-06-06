"use server";

import {
  requireAuthenticated,
  assertCanReadContract,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { serializeDecimals } from "@/lib/serialize-decimals";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getContract = async (contractId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }

  try {
    await assertCanReadContract(user, contractId);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }

  const { data, error } = await supabaseAdmin
    .from("crm_Contracts")
    .select(`
      *,
      assigned_account:crm_Accounts!crm_Contracts_account_fkey(id, name),
      assigned_to_user:Users!crm_Contracts_assigned_to_fkey(id, name),
      lineItems:crm_ContractLineItems!crm_ContractLineItems_contractId_fkey(
        *,
        product:crm_Products!crm_ContractLineItems_productId_fkey(id, name, status)
      )
    `)
    .eq("id", contractId)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) {
    console.error("[CRM_CONTRACT_DETAIL_ERROR]", error);
    return null;
  }

  if (!data) return null;
  return serializeDecimals(data);
};

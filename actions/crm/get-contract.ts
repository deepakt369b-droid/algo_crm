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

  const data = (await supabaseAdmin.from("crm_Contracts").select("*, assigned_account(id, name), assigned_to_user(id, name), lineItems(*, product(id, name, status))").eq("id", contractId).eq("deletedAt", null).single()).data;
  if (!data) return null;
  return serializeDecimals(data);
};
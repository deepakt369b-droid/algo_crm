"use server";

import { cache } from "react";

import {
  requireAuthenticated,
  contractReadScopeWhere,
  assertCanReadAccount,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { serializeDecimalsList } from "@/lib/serialize-decimals";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getContractsWithIncludes = cache(async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  const data = (await supabaseAdmin.from("crm_Contracts").select("*, assigned_to_user(name), assigned_account(name)").order("createdAt", { ascending: false })).data;
  return serializeDecimalsList(data);
});

export const getContractsByAccountId = async (accountId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  try {
    await assertCanReadAccount(user, accountId);
  } catch (e) {
    if (e instanceof AuthorizationError) return [];
    throw e;
  }

  const data = (await supabaseAdmin.from("crm_Contracts").select("*, assigned_to_user(name), assigned_account(name)").eq("account", accountId)).data;
  return serializeDecimalsList(data);
};

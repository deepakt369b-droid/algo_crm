"use server";


import {
  requireAuthenticated,
  assertCanReadAccount,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getAccountById(accountId: string) {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }

  try {
    await assertCanReadAccount(user, accountId);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }

  const account = (await supabaseAdmin.from("crm_Accounts").select("id, name").eq("id", accountId).is("deletedAt", null).single()).data;

  return account ?? null;
}

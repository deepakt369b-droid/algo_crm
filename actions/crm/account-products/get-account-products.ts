import { cache } from "react";

import {
  requireAuthenticated,
  assertCanReadAccount,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAccountProducts = cache(async (accountId: string) => {
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

  const assignments = (await supabaseAdmin.from("crm_AccountProducts").select("*, product(id, name, sku, type, status, unit_price, unit, is_recurring, billing_period)").eq("accountId", accountId).order("createdAt", { ascending: false })).data;
  return assignments;
});

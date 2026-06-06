
import {
  requireAuthenticated,
  assertCanReadAccount,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getInvoicesByAccountId(accountId: string) {
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

  return (await supabaseAdmin.from("Invoices").select("*, account(id, name), series(id, name)").eq("accountId", accountId).order("createdAt", { ascending: false })).data;
}

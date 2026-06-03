"use server";
import {
  requireAuthenticated,
  assertCanWriteDocument,
  assertCanWriteAccount,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function unlinkFromAccount(documentId: string, accountId: string) {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) throw new Error("Unauthorized");
    throw e;
  }

  try {
    await assertCanWriteDocument(user, documentId);
  } catch (e) {
    if (e instanceof AuthorizationError) throw new Error("Forbidden");
    throw e;
  }

  try {
    await assertCanWriteAccount(user, accountId);
  } catch (e) {
    if (e instanceof AuthorizationError) throw new Error("Forbidden");
    throw e;
  }

  (await supabaseAdmin.from("documentsToAccounts").delete().select("*").single()).data;

  revalidatePath("/[locale]/(routes)/documents");
  revalidatePath(`/[locale]/(routes)/crm/accounts/${accountId}`);
}

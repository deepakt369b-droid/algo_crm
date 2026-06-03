"use server";
import {
  requireAuthenticated,
  assertCanWriteDocument,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";

import { inngest } from "@/inngest/client";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function retryEnrichment(documentId: string) {
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

  (await supabaseAdmin.from("documents").update({ processing_status: "PENDING", processing_error: null }).eq("id", documentId).select("*").single()).data;

  await inngest.send({
    name: "document/uploaded",
    data: { documentId },
  });

  revalidatePath("/[locale]/(routes)/documents");
}

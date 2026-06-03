"use server";
import {
  requireAuthenticated,
  filterAuthorizedDocumentIds,
  AuthenticationError,
} from "@/lib/authz";
import { DocumentSystemType } from "@/lib/prisma-types";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function bulkChangeType(documentIds: string[], systemType: DocumentSystemType) {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) throw new Error("Unauthenticated");
    throw e;
  }

  if (!documentIds || documentIds.length === 0) return;

  // Fail-closed: every documentId must be authorized.
  const allowed = await filterAuthorizedDocumentIds(user, documentIds);
  if (allowed.length !== documentIds.length) {
    throw new Error("Forbidden");
  }

  (await supabaseAdmin.from("documents").update({ document_system_type: systemType }).in("id", documentIds)).data;

  revalidatePath("/[locale]/(routes)/documents");
}

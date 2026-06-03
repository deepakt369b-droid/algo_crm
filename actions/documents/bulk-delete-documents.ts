"use server";
import {
  requireAuthenticated,
  filterAuthorizedDocumentIds,
  AuthenticationError,
} from "@/lib/authz";

import { revalidatePath } from "next/cache";
import { minioClient, MINIO_BUCKET } from "@/lib/minio";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function bulkDeleteDocuments(documentIds: string[]) {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) throw new Error("Unauthenticated");
    throw e;
  }

  if (!documentIds || documentIds.length === 0) return;

  // Fail-closed: if any id is not authorized, reject the whole request.
  const allowed = await filterAuthorizedDocumentIds(user, documentIds);
  if (allowed.length !== documentIds.length) {
    throw new Error("Forbidden");
  }

  const documents = (await supabaseAdmin.from("documents").select("id, key").in("id", documentIds)).data;

  // Delete from Supabase storage
  await Promise.allSettled(
    documents.map((doc) => (doc.key ? supabaseAdmin.storage.from(MINIO_BUCKET).remove([doc.key]) : Promise.resolve()))
  );

  // Delete from DB (cascade handles chunks, embeddings, junction tables)
  (await supabaseAdmin.from("documents").delete().select("*").single().in("id", documentIds)).data;

  revalidatePath("/[locale]/(routes)/documents");
}

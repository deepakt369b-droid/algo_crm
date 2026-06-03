"use server";
import {
  requireAuthenticated,
  assertCanWriteDocument,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";


import { minioClient, MINIO_BUCKET } from "@/lib/minio";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function deleteDocument(documentId: string) {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) throw new Error("Unauthenticated");
    throw e;
  }

  if (!documentId) throw new Error("Document ID is required");

  try {
    await assertCanWriteDocument(user, documentId);
  } catch (e) {
    if (e instanceof AuthorizationError) throw new Error("Forbidden");
    throw e;
  }

  const document = (await supabaseAdmin.from("documents").select("*").eq("id", documentId).single()).data;

  if (!document) throw new Error("Document not found");

  (await supabaseAdmin.from("documents").delete().select("*").single().eq("id", documentId).select("*").single()).data;

  if (document.key) {
    // Remove the object from Supabase storage
    await supabaseAdmin.storage.from(MINIO_BUCKET).remove([document.key]);
  }
}

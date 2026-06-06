"use server";
import {
  requireAuthenticated,
  assertCanReadDocument,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getDocumentVersions(documentId: string) {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  // Versions inherit parent permissions: assert read on parent first.
  try {
    await assertCanReadDocument(user, documentId);
  } catch (e) {
    if (e instanceof AuthorizationError) return [];
    throw e;
  }

  const { data: versions, error } = await supabaseAdmin
    .from("Documents")
    .select("id, version, document_file_url, createdAt, size, created_by:Users!Documents_created_by_user_fkey(name)")
    .or(`id.eq.${documentId},parent_document_id.eq.${documentId}`)
    .order("version", { ascending: false });

  if (error) {
    console.error("[DOCUMENT_VERSIONS_ERROR]", error);
    return [];
  }

  return versions ?? [];
}

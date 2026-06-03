"use server";
import {
  requireAuthenticated,
  assertCanWriteDocument,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";

import { revalidatePath } from "next/cache";
import { inngest } from "@/inngest/client";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface CreateVersionInput {
  parentDocumentId: string;
  url: string;
  key: string;
  size: number;
  mimeType: string;
  contentHash?: string;
}

export async function createDocumentVersion(input: CreateVersionInput) {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) throw new Error("Unauthorized");
    throw e;
  }

  try {
    await assertCanWriteDocument(user, input.parentDocumentId);
  } catch (e) {
    if (e instanceof AuthorizationError) throw new Error("Forbidden");
    throw e;
  }

  const parent = (await supabaseAdmin.from("documents").select("id, document_name, version, accounts(account_id)").eq("id", input.parentDocumentId).single()).data;
  if (!parent) throw new Error("Parent document not found");

  const newVersion = parent.version + 1;

  const [newDoc] = await Promise.all([
    (await supabaseAdmin.from("documents").insert({
              v: 0,
              document_name: parent.document_name,
              description: `Version ${newVersion}`,
              document_file_url: input.url,
              key: input.key,
              size: input.size,
              document_file_mimeType: input.mimeType,
              content_hash: input.contentHash ?? null,
              processing_status: "PENDING",
              version: newVersion,
              parent_document_id: input.parentDocumentId,
              createdBy: user.id,
              assigned_user: user.id,
            }).select("*").single()).data,
    (await supabaseAdmin.from("documents").update({
              document_file_url: input.url,
              key: input.key,
              size: input.size,
              version: newVersion,
            }).eq("id", input.parentDocumentId).select("*").single()).data,
  ]);

  await inngest.send({
    name: "document/uploaded",
    data: { documentId: input.parentDocumentId },
  });

  revalidatePath("/[locale]/(routes)/documents");
  return newDoc;
}

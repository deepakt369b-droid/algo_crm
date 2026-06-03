"use server";
import {
  requireAuthenticated,
  assertCanWriteAccount,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";

import { revalidatePath } from "next/cache";
import { inngest } from "@/inngest/client";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface CreateDocumentInput {
  name: string;
  url: string;
  key: string;
  size: number;
  mimeType: string;
  contentHash?: string;
  accountId?: string;
}

export async function createDocument(input: CreateDocumentInput) {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) throw new Error("Unauthorized");
    throw e;
  }

  if (input.accountId) {
    try {
      await assertCanWriteAccount(user, input.accountId);
    } catch (e) {
      if (e instanceof AuthorizationError) throw new Error("Forbidden");
      throw e;
    }
  }

  const document = (await supabaseAdmin.from("documents").insert({
        v: 0,
        document_name: input.name,
        description: "new document",
        document_file_url: input.url,
        key: input.key,
        size: input.size,
        document_file_mimeType: input.mimeType,
        content_hash: input.contentHash ?? null,
        processing_status: "PENDING",
        createdBy: user.id,
        assigned_user: user.id,
        ...(input.accountId
          ? { accounts: { create: { account_id: input.accountId } } }
          : {}),
      }).select("*").single()).data;

  await inngest.send({
    name: "document/uploaded",
    data: { documentId: document.id },
  });

  revalidatePath("/[locale]/(routes)/documents");
  return document;
}

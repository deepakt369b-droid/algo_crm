"use server";
import {
  requireAuthenticated,
  documentReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface DuplicateResult {
  isDuplicate: boolean;
  existingDocument?: {
    id: string;
    name: string;
    createdAt: Date | null;
    accountName?: string;
  };
}

export async function checkDuplicate(contentHash: string): Promise<DuplicateResult> {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { isDuplicate: false };
    throw e;
  }

  const existing = (await supabaseAdmin.from("documents").select("id, document_name, createdAt, accounts(account(name))").eq("content_hash", contentHash).single()).data;

  if (!existing) return { isDuplicate: false };

  return {
    isDuplicate: true,
    existingDocument: {
      id: existing.id,
      name: existing.document_name,
      createdAt: existing.createdAt,
      accountName: existing.accounts[0]?.account.name,
    },
  };
}

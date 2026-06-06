"use server";
import {
  requireAuthenticated,
  documentReadScopeWhere,
  filterAuthorizedDocumentIds,
  AuthenticationError,
} from "@/lib/authz";

import {
  generateEmbedding,
  toVectorLiteral,
} from "@/inngest/lib/embedding-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export interface DocumentSearchResult {
  id: string;
  name: string;
  summary: string | null;
  systemType: string | null;
  accountName: string | null;
}

export async function searchDocuments(
  query: string
): Promise<DocumentSearchResult[]> {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }
  if (!query || query.trim().length < 2) return [];

  // Keyword search — scope OR (visibility/ownership) goes at top level;
  // user-supplied search OR moves into AND so it cannot replace the scope OR.
  const kwResults = (await supabaseAdmin.from("Documents").select("id, document_name, summary, document_system_type, accounts(account(name))").is("parent_document_id", null).eq("AND", [
          {
            OR: [
              { document_name: { contains: query, mode: "insensitive" } },
              { summary: { contains: query, mode: "insensitive" } },
            ],
          },
        ]).limit(5)).data;

  // Semantic search via raw pgvector. Apply post-filter for authz.
  let semResults: { id: string; similarity: number }[] = [];
  try {
    const embedding = await generateEmbedding(query.trim());
    const vec = toVectorLiteral(embedding);

    const rawResults = await supabaseAdmin.rpc("query_raw", {}) /* TODO */<
      { id: string; similarity: number }[]
    >`
      SELECT d.id, 1 - (e.embedding <=> ${vec}::vector) AS similarity
      FROM "Documents" d
      LEFT JOIN "crm_Embeddings_Documents" e ON e.document_id = d.id
      WHERE e.embedding IS NOT NULL AND d."parent_document_id" IS NULL
        AND 1 - (e.embedding <=> ${vec}::vector) > 0.7
      ORDER BY e.embedding <=> ${vec}::vector
      LIMIT 5`;

    const allowedIds = new Set(
      await filterAuthorizedDocumentIds(
        user,
        rawResults.map((r) => r.id),
      ),
    );
    semResults = rawResults.filter((r) => allowedIds.has(r.id));
  } catch {
    // Fall back to keyword-only
  }

  // Merge: keyword results first, then semantic-only results
  const kwIds = new Set(kwResults.map((r) => r.id));
  const semOnlyIds = semResults.filter((r) => !kwIds.has(r.id)).map((r) => r.id);

  let extraDocs: typeof kwResults = [];
  if (semOnlyIds.length > 0) {
    extraDocs = (await supabaseAdmin.from("Documents").select("id, document_name, summary, document_system_type").in("id", semOnlyIds).is("parent_document_id", null)).data;
  }

  return [...kwResults, ...extraDocs].map((r) => ({
    id: r.id,
    name: r.document_name,
    summary: r.summary,
    systemType: r.document_system_type,
    accountName: r.accounts?.[0]?.account?.name ?? null,
  }));
}

import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

const TOKEN_PREFIX = "nxtc__";
const TOKEN_BYTES = 24; // 48 hex chars
const MAX_TOKENS_PER_USER = 10;

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export async function generateApiToken(
  userId: string,
  name: string,
  expiresAt?: Date
): Promise<{ rawToken: string; tokenId: string }> {
  const activeCount = (await supabaseAdmin.from("apiToken").select("*", { count: 'exact', head: true }).eq("userId", userId).is("revokedAt", null).eq("OR", [{ expiresAt: null }, { expiresAt: { gt: new Date() } }])).count;

  if (activeCount >= MAX_TOKENS_PER_USER) {
    throw new Error("Maximum 10 active tokens allowed per user");
  }

  const rawSuffix = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const rawToken = TOKEN_PREFIX + rawSuffix;
  const tokenHash = hashToken(rawToken);
  const tokenPrefix = rawSuffix.slice(0, 8);

  const created = (await supabaseAdmin.from("apiToken").insert({
          name,
          tokenHash,
          tokenPrefix,
          userId,
          expiresAt: expiresAt ?? null,
        }).select("*").single()).data;

  return { rawToken, tokenId: created.id };
}

export async function validateApiToken(rawToken: string): Promise<string> {
  if (!rawToken.startsWith("nxtc__")) throw new Error("Invalid token");
  const tokenHash = hashToken(rawToken);

  const token = (await supabaseAdmin.from("apiToken").select("*").eq("tokenHash", tokenHash).single()).data;

  if (!token) throw new Error("Invalid token");
  if (token.revokedAt) throw new Error("Invalid token");
  if (token.expiresAt && token.expiresAt < new Date()) throw new Error("Invalid token");

  // Fire-and-forget lastUsedAt update — failures are intentionally silenced
  void Promise.resolve(
    (await supabaseAdmin.from("apiToken").update({ lastUsedAt: new Date() }).select("*").single().eq("id", token.id).select("*").single()).data
  ).catch(() => {});

  return token.userId;
}

export async function revokeApiToken(
  tokenId: string,
  userId: string
): Promise<void> {
  const token = (await supabaseAdmin.from("apiToken").select("*").eq("id", tokenId).single()).data;
  if (!token || token.userId !== userId) throw new Error("Not found");

  (await supabaseAdmin.from("apiToken").update({ revokedAt: new Date() }).select("*").single().eq("id", tokenId).select("*").single()).data;
}

export async function listApiTokens(userId: string) {
  return (await supabaseAdmin.from("apiToken").select("id, name, tokenPrefix, expiresAt, revokedAt, createdAt, lastUsedAt").eq("userId", userId).order("createdAt", { ascending: false })).data;
}

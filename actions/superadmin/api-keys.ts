"use server";

import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/email-crypto";
import { ApiKeyProvider } from "@/lib/prisma-types";
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";

import { getSession } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function ensureSuperAdmin(): Promise<void> {
  const session = await getSession();
  if (!session?.user?.isSuperAdmin && session?.user?.role !== "superadmin" && session?.user?.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Access denied. Superadmin privileges required.");
  }
}

const PROVIDER_ENV_MAP: Record<ApiKeyProvider, string> = {
  OPENAI: "OPENAI_API_KEY",
  FIRECRAWL: "FIRECRAWL_API_KEY",
  ANTHROPIC: "ANTHROPIC_API_KEY",
  GROQ: "GROQ_API_KEY",
};

export type ProviderStatus = {
  provider: ApiKeyProvider;
  source: "ENV_ACTIVE" | "SYSTEM_SET" | "NOT_CONFIGURED";
  maskedKey?: string;
};

export async function getSystemApiKeys(): Promise<ProviderStatus[]> {
  await ensureSuperAdmin();

  const providers = Object.values(ApiKeyProvider) as ApiKeyProvider[];

  return Promise.all(
    providers.map(async (provider): Promise<ProviderStatus> => {
      const envValue = process.env[PROVIDER_ENV_MAP[provider]];
      if (envValue) {
        return {
          provider,
          source: "ENV_ACTIVE",
          maskedKey: "••••" + envValue.slice(-4),
        };
      }

      const row = (await supabaseAdmin.from("ApiKeys").select("encryptedKey").eq("scope", "SYSTEM").eq("provider", provider).single()).data;

      if (row) {
        const plaintext = decrypt(row.encryptedKey);
        return {
          provider,
          source: "SYSTEM_SET",
          maskedKey: "••••" + plaintext.slice(-4),
        };
      }

      return { provider, source: "NOT_CONFIGURED" };
    })
  );
}

export async function upsertSystemApiKey(
  provider: ApiKeyProvider,
  key: string
): Promise<void> {
  await ensureSuperAdmin();

  const encryptedKey = encrypt(key);

  await Promise.all([
    supabaseAdmin.from("ApiKeys").deleteMany({
      where: { scope: "SYSTEM", provider },
    }),
    (await supabaseAdmin.from("ApiKeys").insert({
                  scope: "SYSTEM",
                  provider,
                  encryptedKey,
                }).select("*").single()).data,
  ]);

  revalidatePath("/(en)/admin/llm-keys");
}

export async function deleteSystemApiKey(provider: ApiKeyProvider): Promise<void> {
  await ensureSuperAdmin();

  await supabaseAdmin.from("ApiKeys").deleteMany({
    where: { scope: "SYSTEM", provider },
  });

  revalidatePath("/(en)/admin/llm-keys");
}

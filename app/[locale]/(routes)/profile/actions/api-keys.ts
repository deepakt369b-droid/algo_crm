"use server";
import { getSession } from "@/lib/auth-server";


import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/email-crypto";
import { ApiKeyProvider } from "@/lib/prisma-types";
import { supabaseAdmin } from "@/lib/supabase-admin";

const PROVIDER_ENV_MAP: Record<ApiKeyProvider, string> = {
  OPENAI: "OPENAI_API_KEY",
  FIRECRAWL: "FIRECRAWL_API_KEY",
  ANTHROPIC: "ANTHROPIC_API_KEY",
  GROQ: "GROQ_API_KEY",
};

export type UserProviderStatus = {
  provider: ApiKeyProvider;
  source: "ENV_ACTIVE" | "SYSTEM_SET" | "USER_SET" | "NOT_CONFIGURED";
  maskedKey?: string;
  higherTierActive: boolean;
};

export async function getUserApiKeys(): Promise<UserProviderStatus[]> {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const providers = Object.values(ApiKeyProvider) as ApiKeyProvider[];

  return Promise.all(
    providers.map(async (provider): Promise<UserProviderStatus> => {
      // 1. Check ENV
      const envValue = process.env[PROVIDER_ENV_MAP[provider]];
      if (envValue) {
        return {
          provider,
          source: "ENV_ACTIVE",
          maskedKey: "••••" + envValue.slice(-4),
          higherTierActive: true,
        };
      }

      // 2. Check SYSTEM row
      const systemRow = (await supabaseAdmin.from("apiKeys").select("encryptedKey").eq("scope", "SYSTEM").eq("provider", provider).single()).data;

      if (systemRow) {
        const plaintext = decrypt(systemRow.encryptedKey);
        return {
          provider,
          source: "SYSTEM_SET",
          maskedKey: "••••" + plaintext.slice(-4),
          higherTierActive: true,
        };
      }

      // 3. Check USER row
      const userRow = (await supabaseAdmin.from("apiKeys").select("encryptedKey").eq("scope", "USER").eq("provider", provider).eq("userId", userId).single()).data;

      if (userRow) {
        const plaintext = decrypt(userRow.encryptedKey);
        return {
          provider,
          source: "USER_SET",
          maskedKey: "••••" + plaintext.slice(-4),
          higherTierActive: false,
        };
      }

      // 4. Not configured
      return { provider, source: "NOT_CONFIGURED", higherTierActive: false };
    })
  );
}

export async function upsertUserApiKey(
  provider: ApiKeyProvider,
  key: string
): Promise<void> {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const encryptedKey = encrypt(key);

  await Promise.all([
    supabaseAdmin.from("apiKeys").deleteMany({
      where: { scope: "USER", provider, userId },
    }),
    (await supabaseAdmin.from("apiKeys").insert({
                  scope: "USER",
                  provider,
                  userId,
                  encryptedKey,
                }).select("*").single()).data,
  ]);

  revalidatePath("/(en)/profile");
}

export async function deleteUserApiKey(provider: ApiKeyProvider): Promise<void> {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  await supabaseAdmin.from("apiKeys").deleteMany({
    where: { scope: "USER", provider, userId },
  });

  revalidatePath("/(en)/profile");
}

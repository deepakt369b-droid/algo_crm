"use server";

import { getSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/email-crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getSystemSettings() {
  const session = await getSession();
  if (!session?.user?.isSuperAdmin && session?.user?.role !== "superadmin" && session?.user?.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Access denied. Superadmin privileges required.");
  }

  const settings = (await supabaseAdmin.from("crm_SystemSettings").select("*")).data;
  const settingsMap = new Map(settings.map(s => [s.key, s.value]));

  const openaiKeyRow = (await supabaseAdmin.from("apiKeys").select("encryptedKey").eq("scope", "SYSTEM").eq("provider", "OPENAI").single()).data;

  const anthropicKeyRow = (await supabaseAdmin.from("apiKeys").select("encryptedKey").eq("scope", "SYSTEM").eq("provider", "ANTHROPIC").single()).data;
  
  let maskedOpenaiApiKey = "";
  if (process.env.OPENAI_API_KEY) {
    maskedOpenaiApiKey = "••••" + process.env.OPENAI_API_KEY.slice(-4) + " (ENV)";
  } else if (openaiKeyRow) {
    const plaintext = decrypt(openaiKeyRow.encryptedKey);
    maskedOpenaiApiKey = "••••" + plaintext.slice(-4) + " (SYSTEM)";
  }

  let maskedAnthropicApiKey = "";
  if (process.env.ANTHROPIC_API_KEY) {
    maskedAnthropicApiKey = "••••" + process.env.ANTHROPIC_API_KEY.slice(-4) + " (ENV)";
  } else if (anthropicKeyRow) {
    const plaintext = decrypt(anthropicKeyRow.encryptedKey);
    maskedAnthropicApiKey = "••••" + plaintext.slice(-4) + " (SYSTEM)";
  }

  // Handle encrypted SMTP password
  let maskedSmtpPassword = "";
  const encryptedSmtpPassword = settingsMap.get("smtpPassword");
  if (encryptedSmtpPassword) {
    try {
      const plaintext = decrypt(encryptedSmtpPassword);
      maskedSmtpPassword = "••••" + plaintext.slice(-4);
    } catch {
      maskedSmtpPassword = "••••";
    }
  }

  return {
    appName: settingsMap.get("appName") || "Flowline Pro",
    supportEmail: settingsMap.get("supportEmail") || "support@flowlinepro.io",
    supportUrl: settingsMap.get("supportUrl") || "https://help.flowlinepro.io",
    selfSignup: settingsMap.get("selfSignup") !== "false", // default true
    autoApproveTenants: settingsMap.get("autoApproveTenants") === "true", // default false
    sandbox: settingsMap.get("sandbox") !== "false", // default true
    mfa: settingsMap.get("mfa") !== "false", // default true
    otpVerify: settingsMap.get("otpVerify") !== "false", // default true
    sessionTimeout: settingsMap.get("sessionTimeout") || "7",
    senderName: settingsMap.get("senderName") || "Flowline Pro Security",
    senderEmail: settingsMap.get("senderEmail") || "noreply@flowlinepro.io",
    
    // SMTP fields
    smtpHost: settingsMap.get("smtpHost") || "",
    smtpPort: settingsMap.get("smtpPort") || "",
    smtpUser: settingsMap.get("smtpUser") || "",
    smtpPassword: maskedSmtpPassword,

    aiEnrichment: settingsMap.get("aiEnrichment") !== "false", // default true
    agentChat: settingsMap.get("agentChat") !== "false", // default true
    
    // AI Integrations
    aiPlatform: settingsMap.get("aiPlatform") || "openai", // openai, anthropic, custom
    primaryOpenaiModel: settingsMap.get("primaryOpenaiModel") || "gpt-4o",
    tokenLimit: settingsMap.get("tokenLimit") || "5000000",
    openaiApiKey: maskedOpenaiApiKey,
    anthropicApiKey: maskedAnthropicApiKey,
    customAiBaseUrl: settingsMap.get("customAiBaseUrl") || "",
  };
}

export async function saveSystemSettings(data: Record<string, string>) {
  const session = await getSession();
  if (!session?.user?.isSuperAdmin && session?.user?.role !== "superadmin" && session?.user?.email !== process.env.ADMIN_EMAIL) {
    return { error: "Access denied. Superadmin privileges required." };
  }

  try {
    const operations: any[] = [];
    
    // Handle OpenAI API Key separately
    if (data.openaiApiKey && !data.openaiApiKey.includes("••••")) {
      const encryptedKey = encrypt(data.openaiApiKey);
      operations.push(
        (await supabaseAdmin.from("apiKeys").delete().eq("scope", "SYSTEM").eq("provider", "OPENAI")).data
      );
      operations.push(
        (await supabaseAdmin.from("apiKeys").insert({
                      scope: "SYSTEM",
                      provider: "OPENAI",
                      encryptedKey,
                    }).select("*").single()).data
      );
    }

    // Handle Anthropic API Key separately
    if (data.anthropicApiKey && !data.anthropicApiKey.includes("••••")) {
      const encryptedKey = encrypt(data.anthropicApiKey);
      operations.push(
        (await supabaseAdmin.from("apiKeys").delete().eq("scope", "SYSTEM").eq("provider", "ANTHROPIC")).data
      );
      operations.push(
        (await supabaseAdmin.from("apiKeys").insert({
                      scope: "SYSTEM",
                      provider: "ANTHROPIC",
                      encryptedKey,
                    }).select("*").single()).data
      );
    }
    
    // Filter out keys before saving to SystemSettings
    const filteredData = { ...data };
    delete filteredData.openaiApiKey;
    delete filteredData.anthropicApiKey;

    // Handle SMTP Password encryption
    if (filteredData.smtpPassword) {
      if (!filteredData.smtpPassword.includes("••••")) {
        filteredData.smtpPassword = encrypt(filteredData.smtpPassword);
      } else {
        delete filteredData.smtpPassword; // Don't save the masked version
      }
    }

    Object.entries(filteredData).forEach(([key, value]) => {
      operations.push(
        supabaseAdmin.from("crm_SystemSettings").upsert({
          key,
          value: String(value)
        }, { onConflict: "key" })
      );
    });

    await Promise.all(operations);
    revalidatePath("/superadmin/settings");
    return { success: true };
  } catch (error: any) {
    console.error("[SAVE_SYSTEM_SETTINGS_ERROR]", error);
    return { error: error.message || "Failed to save system settings." };
  }
}

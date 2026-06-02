"use server";

import { getApiKey } from "@/lib/api-keys";
import { getSession } from "@/lib/auth-server";

export type AiTemplateInput = {
  prompt: string;
};

export type GeneratedTemplateSpec = {
  name: string;
  slug: string;
  industry: string;
  description: string;
  icon: string;
  features: string[];
  crmCustomFields: Array<{
    name: string;
    type: "TEXT" | "NUMBER" | "BOOLEAN" | "DATE";
    label: string;
  }>;
};

export async function generateAiTemplate(
  data: AiTemplateInput
): Promise<{ success: boolean; data?: GeneratedTemplateSpec; error?: string }> {
  const session = await getSession();
  if (!session?.user?.isSuperAdmin && session?.user?.role !== "superadmin") {
    return { success: false, error: "Access denied. Superadmin privileges required." };
  }

  const { prompt } = data;
  if (!prompt?.trim()) {
    return { success: false, error: "Prompt is required." };
  }

  // Tier 1: Retrieve OpenAI API key from system settings/ENV
  const apiKey = await getApiKey("OPENAI");
  if (!apiKey) {
    return {
      success: false,
      error: "No OpenAI API key configured. Please add an OpenAI API key in your Profile -> LLMs or as system settings to use the AI generator.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an advanced self-improving CRM AI Architect. 
Your goal is to autonomously design, enhance, and optimize industry-specific CRM configurations.
When given a user prompt, you don't just execute it—you self-improve the design by anticipating missing modules, adding high-value custom fields, and crafting an excellent configuration that elevates the entire app experience.
Return ONLY valid JSON in this exact format, with no markdown block wrapping:
{
  "name": "Industry Template Name",
  "slug": "url-friendly-slug-lowercase",
  "industry": "Broad Industry Category",
  "description": "Engaging description of this custom CRM system",
  "icon": "IconName (e.g. Building, ShoppingCart, Landmark, Plane, Heart, Trophy, Car, Briefcase, Stethoscope, Wrench, Hotel, Hammer, GraduationCap, Scale, Flame)",
  "features": ["accounts", "contacts", "leads", "opportunities", "projects", "invoices"], // Important: these should map to real module IDs if possible
  "crmCustomFields": [
    { "name": "fieldKey1", "type": "TEXT", "label": "Field Display Label" },
    { "name": "fieldKey2", "type": "NUMBER", "label": "Another Label" }
  ]
}

Available field types: "TEXT", "NUMBER", "BOOLEAN", "DATE".
Ensure features are valid module IDs from this list: accounts, contacts, leads, opportunities, products, contracts, emails, campaigns, whatsapp, projects, documents, invoices.`,
          },
          { role: "user", content: `Craft a self-improved, highly optimized custom CRM template spec for: ${prompt}. Analyze the niche and include the best possible fields and modules.` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned status ${response.status}: ${response.statusText}`);
    }

    const resJson = await response.json();
    let content = resJson.choices[0]?.message?.content ?? "{}";
    
    // Clean potential markdown wrap
    content = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    
    const parsed = JSON.parse(content) as GeneratedTemplateSpec;

    return {
      success: true,
      data: parsed,
    };
  } catch (err: any) {
    console.error("[AI_TEMPLATE_GENERATION_FAILED]", err);
    return {
      success: false,
      error: err.message || "Failed to generate AI template configuration. Please check your credentials.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

"use server";

import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { requireAuthenticated } from "@/lib/authz";
import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getOrganizationInsights = async () => {
  try {
    const user = await requireAuthenticated();

    // Verify AI upsell check (e.g. check if AI is enabled for this account or globally)
    // Since we don't have a specific table, we will check if an OpenAI key is configured globally
    const { data: openaiService, error: serviceError } = await supabaseAdmin
      .from("systemServices")
      .select("*")
      .eq("name", "OpenAI")
      .maybeSingle();

    if (serviceError) {
      console.error("Error fetching AI service config:", serviceError);
    }

    if (!openaiService || !openaiService.serviceKey) {
      return { error: "AI features are not configured. Please contact the administrator." };
    }

    const crmData = await getAllCrmData();
    const openai = new OpenAI({ apiKey: openaiService.serviceKey });

    const prompt = `
    You are an expert CRM analyst. Provide a brief, high-level business insight summary based on the following CRM data for the organization.
    Focus on sales performance, upcoming opportunities, and areas that need attention.
    Keep the response under 150 words.

    CRM Data Summary:
    Total Opportunities: ${crmData.opportunities.length}
    Total Contacts: ${crmData.contacts.length}
    
    Top 5 Opportunities:
    ${crmData.opportunities
      .slice(0, 5)
      .map((o: any) => `- ${o.name}: $${o.budget || 0} (${o.sales_stage})`)
      .join("\n")}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return { insight: completion.choices[0].message.content };
  } catch (error: any) {
    console.error("AI Insight Error:", error);
    return { error: error.message || "Failed to generate insights." };
  }
};

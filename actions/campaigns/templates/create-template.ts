"use server";

import { requireAuthenticated, AuthenticationError } from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const createTemplate = async (data: {
  name: string;
  description?: string;
  subject_default?: string;
  content_html: string;
  content_json: object;
}) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  return (await supabaseAdmin.from("crm_campaign_templates").insert({ ...data, created_by: user.id }).select("*").single()).data;
};

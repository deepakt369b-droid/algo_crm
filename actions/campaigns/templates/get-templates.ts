"use server";

import {
  requireAuthenticated,
  campaignTemplateReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getTemplates = async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  return (await supabaseAdmin.from("crm_campaign_templates").select("*, created_by_user(name)").order("created_on", { ascending: false })).data;
};

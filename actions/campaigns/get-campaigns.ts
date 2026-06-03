"use server";
import {
  requireAuthenticated,
  campaignReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getCampaigns = async (filters?: { status?: string; search?: string }) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  return (await supabaseAdmin.from("crm_campaigns").select("*").order("created_on", { ascending: false })).data;
};

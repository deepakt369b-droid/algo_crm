"use server";

import { cache } from "react";

import {
  requireAuthenticated,
  opportunityReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getOpportunitiesFull = cache(async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  const data = (await supabaseAdmin.from("crm_Opportunities").select("*, assigned_account(name), assigned_sales_stage(name), assigned_to_user(name)").order("created_on", { ascending: false })).data;

  return data;
});

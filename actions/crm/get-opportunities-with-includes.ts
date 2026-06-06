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

  const data = (await supabaseAdmin
    .from("crm_Opportunities")
    .select(`
      *,
      assigned_account:crm_Accounts!crm_Opportunities_account_fkey(name),
      assigned_sales_stage:crm_Opportunities_Sales_Stages!crm_Opportunities_sales_stage_fkey(name),
      assigned_to_user:Users!crm_Opportunities_assigned_to_fkey(name)
    `)
    .order("created_on", { ascending: false })).data ?? [];

  return data;
});

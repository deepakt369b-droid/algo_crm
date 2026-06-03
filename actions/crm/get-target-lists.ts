"use server";

import {
  requireAuthenticated,
  targetListReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getTargetLists = async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  const targetLists = (await supabaseAdmin.from("crm_TargetLists").select("*, crate_by_user(name), _count(targets)").order("created_on", { ascending: false })).data;
  return targetLists;
};

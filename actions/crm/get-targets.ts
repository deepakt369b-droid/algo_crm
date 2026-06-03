"use server";

import {
  requireAuthenticated,
  targetReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getTargets = async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  const targets = (await supabaseAdmin.from("crm_Targets").select("*, crate_by_user(name), target_lists(*, target_list(id, name))").order("created_on", { ascending: false })).data;
  return targets;
};

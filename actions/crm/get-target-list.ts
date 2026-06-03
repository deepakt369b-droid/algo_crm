"use server";

import {
  requireAuthenticated,
  assertCanReadTargetList,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getTargetList = async (id: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }

  try {
    await assertCanReadTargetList(user, id);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }

  const targetList = (await supabaseAdmin.from("crm_TargetLists").select("*, crate_by_user(name), targets(*, target)").eq("id", id).single()).data;
  return targetList;
};

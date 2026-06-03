
import {
  requireAuthenticated,
  boardReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getSections = async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  const data = (await supabaseAdmin.from("sections").select("*").eq("board_relation", boardReadScopeWhere(user))).data;

  return data;
};

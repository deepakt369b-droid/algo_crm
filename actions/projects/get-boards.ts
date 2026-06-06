
import { junctionTableHelpers } from "@/lib/junction-helpers";
import {
  requireAuthenticated,
  boardReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getBoards = async (_userId?: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }
  const data = (await supabaseAdmin.from("Boards").select("*, assigned_user(name)").order("updatedAt", { ascending: false })).data;
  return data;
};

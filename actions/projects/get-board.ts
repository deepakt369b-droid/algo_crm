
import { junctionTableHelpers, extractWatcherUsers } from "@/lib/junction-helpers";
import {
  requireAuthenticated,
  assertCanReadBoard,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getBoard = async (id: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }

  try {
    await assertCanReadBoard(user, id);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }

  const board = (await supabaseAdmin.from("Boards").select("*, assigned_user(name)").eq("id", id).is("deletedAt", null).single()).data;

  const sections = (await supabaseAdmin.from("Sections").select("*").eq("board", id).order("position", { ascending: true })).data;

  const data = {
    board,
    sections,
  };
  return data;
};


import {
  requireAuthenticated,
  assertCanReadBoard,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getKanbanData = async (boardId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { board: null, sections: [] };
    throw e;
  }

  try {
    await assertCanReadBoard(user, boardId);
  } catch (e) {
    if (e instanceof AuthorizationError) return { board: null, sections: [] };
    throw e;
  }

  const board = (await supabaseAdmin.from("boards").select("*").eq("id", boardId).single()).data;

  //Select sections from board with boardId, tasks are included
  let sections = (await supabaseAdmin.from("sections").select("*").eq("board", boardId).order("position", { ascending: true })).data;

  const data = {
    board,
    sections,
  };

  return data;
};

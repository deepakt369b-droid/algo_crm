
import {
  requireAuthenticated,
  assertCanReadBoard,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getBoardSections = async (boadId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  try {
    await assertCanReadBoard(user, boadId);
  } catch (e) {
    if (e instanceof AuthorizationError) return [];
    throw e;
  }

  const data = (await supabaseAdmin.from("sections").select("*").eq("board", boadId)).data;

  return data;
};

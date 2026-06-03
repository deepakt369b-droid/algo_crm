
import { junctionTableHelpers } from "@/lib/junction-helpers";
import {
  requireAuthenticated,
  assertCanReadTask,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getTask = async (taskId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }

  try {
    await assertCanReadTask(user, taskId);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }

  const data = (await supabaseAdmin.from("tasks").select("*, assigned_user(id, name), documents(*, document(id, document_name, document_file_url)), comments(id, comment, createdAt, assigned_user(id, name, avatar))").eq("id", taskId).single()).data;
  return data;
};


import {
  requireAuthenticated,
  assertCanReadTask,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getTaskDocuments = async (taskId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  try {
    await assertCanReadTask(user, taskId);
  } catch (e) {
    if (e instanceof AuthorizationError) return [];
    throw e;
  }

  // Query documents through DocumentsToTasks junction table
  const data = (await supabaseAdmin.from("Documents").select("*")).data;
  return data;
};

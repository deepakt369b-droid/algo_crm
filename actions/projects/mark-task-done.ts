"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import {
  requireAuthenticated,
  assertCanWriteTask,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const markTaskDone = async (taskId: string) => {
  let authzUser;
  try {
    authzUser = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  if (!taskId) return { error: "Missing task ID" };

  try {
    await assertCanWriteTask(authzUser, taskId);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  try {
    (await supabaseAdmin.from("tasks").update({
                  taskStatus: "COMPLETE",
                  updatedBy: session.user.id,
                }).select("*").single().eq("id", taskId).select("*").single()).data;

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[MARK_TASK_DONE]", error);
    return { error: "Failed to mark task as done" };
  }
};

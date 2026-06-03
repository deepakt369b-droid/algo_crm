"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import {
  requireAuthenticated,
  assertCanWriteBoard,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const deleteTask = async (data: { id: string; section?: string }) => {
  let authzUser;
  try {
    authzUser = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { id } = data;
  if (!id) return { error: "Missing task ID" };

  const existing = (await supabaseAdmin.from("tasks").select("id, section, assigned_section(board_relation(id))").eq("id", id).single()).data;
  const parentBoardId = existing?.assigned_section?.board_relation?.id;
  if (!parentBoardId) return { error: "Not found" };

  try {
    await assertCanWriteBoard(authzUser, parentBoardId);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  try {
    const currentTask = (await supabaseAdmin.from("tasks").select("*").eq("id", id).single()).data;

    // Delete all task comments first (foreign key constraint)
    (await supabaseAdmin.from("tasksComments").delete().select("*").single().eq("task", id)).data;

    (await supabaseAdmin.from("tasks").delete().select("*").single().eq("id", id).select("*").single()).data;

    if (currentTask) {
      // Reorder remaining tasks in the section
      const tasks = (await supabaseAdmin.from("tasks").select("*").eq("section", currentTask.section).order("position", { ascending: true })).data;

      for (const key in tasks) {
        const position = parseInt(key);
        (await supabaseAdmin.from("tasks").update({
                              updatedBy: session.user.id,
                              position,
                            }).select("*").single().eq("id", tasks[key].id).select("*").single()).data;
      }
    }

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[DELETE_TASK]", error);
    return { error: "Failed to delete task" };
  }
};

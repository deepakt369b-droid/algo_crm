"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import UpdatedTaskFromProject from "@/emails/UpdatedTaskFromProject";
import resendHelper from "@/lib/resend";
import {
  requireAuthenticated,
  assertCanWriteBoard,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const updateTask = async (data: {
  taskId: string;
  title: string;
  user: string;
  board?: string;
  boardId?: string;
  priority: string;
  content: string;
  dueDateAt?: Date;
}) => {
  let authzUser;
  try {
    authzUser = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { taskId, title, user, boardId, priority, content, dueDateAt } = data;
  const resolvedBoardId = boardId || data.board;

  if (!taskId) return { error: "Missing task ID" };
  if (!title || !user || !priority || !content) {
    return { error: "Missing one of the task data" };
  }

  const existing = (await supabaseAdmin.from("tasks").select("assigned_section(board_relation(id))").eq("id", taskId).single()).data;
  const parentBoardId = existing?.assigned_section?.board_relation?.id;
  if (!parentBoardId) return { error: "Not found" };

  try {
    await assertCanWriteBoard(authzUser, parentBoardId);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  try {
    const task = (await supabaseAdmin.from("tasks").update({
            priority,
            title,
            content,
            updatedBy: user,
            dueDateAt,
            user,
          }).eq("id", taskId).select("*").single()).data;

    if (resolvedBoardId) {
      (await supabaseAdmin.from("boards").update({ updatedAt: new Date() }).eq("id", resolvedBoardId).select("*").single()).data;
    }

    // Send email notification if assigning to a different user
    if (user !== session.user.id && resolvedBoardId) {
      try {
        let resend;
        try {
          resend = await resendHelper();
        } catch {
          resend = null;
        }

        if (resend) {
          const notifyRecipient = (await supabaseAdmin.from("users").select("*").eq("id", user).single()).data;

          const boardData = (await supabaseAdmin.from("boards").select("*").eq("id", resolvedBoardId).single()).data;

          if (notifyRecipient?.email) {
            await resend.emails.send({
              from:
                process.env.NEXT_PUBLIC_APP_NAME +
                " <" +
                process.env.EMAIL_FROM +
                ">",
              to: notifyRecipient.email,
              subject:
                session.user.userLanguage === "en"
                  ? `Task - ${title} - was updated.`
                  : `Úkol - ${title} - byl aktualizován.`,
              text: "",
              react: UpdatedTaskFromProject({
                taskFromUser: session.user.name!,
                username: notifyRecipient.name!,
                userLanguage: notifyRecipient.userLanguage!,
                taskData: task,
                boardData,
              }),
            });
          }
        }
      } catch (emailError) {
        console.log("[UPDATE_TASK_EMAIL]", emailError);
      }
    }

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[UPDATE_TASK]", error);
    return { error: "Failed to update task" };
  }
};

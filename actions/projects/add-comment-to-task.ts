"use server";
import { getSession } from "@/lib/auth-server";

import { junctionTableHelpers } from "@/lib/junction-helpers";
import { revalidatePath } from "next/cache";
import NewTaskCommentEmail from "@/emails/NewTaskComment";
import resendHelper from "@/lib/resend";
import {
  requireAuthenticated,
  assertCanWriteBoard,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const addCommentToTask = async (data: {
  taskId: string;
  comment: string;
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

  const { taskId, comment } = data;
  if (!taskId) return { error: "Missing task ID" };
  if (!comment) return { error: "Missing comment" };

  // Resolve parent board (if any) via assigned_section relation for scope check.
  const taskBoardLookup = (await supabaseAdmin.from("Tasks").select("assigned_section(board_relation(id))").eq("id", taskId).single()).data;
  const parentBoardId =
    taskBoardLookup?.assigned_section?.board_relation?.id;
  if (parentBoardId) {
    try {
      await assertCanWriteBoard(authzUser, parentBoardId);
    } catch (e) {
      if (e instanceof AuthorizationError) return { error: "Forbidden" };
      throw e;
    }
  }

  try {
    const task = (await supabaseAdmin.from("Tasks").select("*").eq("id", taskId).single()).data;

    if (!task) return { error: "Task not found" };
    if (!task.section) return { error: "Task section not found" };

    const section = (await supabaseAdmin.from("Sections").select("*").eq("id", task.section).single()).data;

    if (section) {
      // Task from Projects module - add user as board watcher
      (await supabaseAdmin.from("Boards").update({
                        watchers: junctionTableHelpers.addWatcher(session.user.id),
                      }).select("*").single().eq("id", section.board).select("*").single()).data;

      const newComment = (await supabaseAdmin.from("tasksComments").insert({
                      v: 0,
                      comment,
                      task: taskId,
                      user: session.user.id,
                    }).select("*").single()).data;

      // Send email to all board watchers except the commenter
      try {
        let resend;
        try {
          resend = await resendHelper();
        } catch {
          resend = null;
        }

        if (resend) {
          const boardWatchers = (await supabaseAdmin.from("BoardWatchers").select("*").eq("board_id", section.board)).data;

          const emailRecipients = boardWatchers.map(
            (w: (typeof boardWatchers)[number]) => w.user
          );

          // Also add task creator if different from commenter
          if (task.createdBy) {
            const taskCreator = (await supabaseAdmin.from("Users").select("*").eq("id", task.createdBy).single()).data;
            if (taskCreator && taskCreator.id !== session.user.id) {
              emailRecipients.push(taskCreator);
            }
          }

          for (const user of emailRecipients) {
            await resend.emails.send({
              from:
                process.env.NEXT_PUBLIC_APP_NAME +
                " <" +
                process.env.EMAIL_FROM +
                ">",
              to: user?.email!,
              subject:
                session.user.userLanguage === "en"
                  ? `New comment on task ${task.title}.`
                  : `Nový komentář k úkolu ${task.title}.`,
              text: "",
              react: NewTaskCommentEmail({
                commentFromUser: session.user.name!,
                username: user?.name!,
                userLanguage: user?.userLanguage!,
                taskId: task.id,
                comment,
              }),
            });
          }
        }
      } catch (emailError) {
        console.log("[ADD_COMMENT_EMAIL]", emailError);
      }

      revalidatePath("/[locale]/(routes)/projects", "page");
      return { data: newComment };
    } else {
      // Task from CRM module (no section board)
      const newComment = (await supabaseAdmin.from("tasksComments").insert({
                      v: 0,
                      comment,
                      task: taskId,
                      user: session.user.id,
                    }).select("*").single()).data;

      revalidatePath("/[locale]/(routes)/projects", "page");
      return { data: newComment };
    }
  } catch (error) {
    console.log("[ADD_COMMENT_TO_TASK]", error);
    return { error: "Failed to add comment" };
  }
};

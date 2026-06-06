"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import NewTaskFromProject from "@/emails/NewTaskFromProject";
import resendHelper from "@/lib/resend";
import {
  requireAuthenticated,
  assertCanWriteBoard,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const createTaskInBoard = async (data: {
  boardId: string;
  section: string;
  title?: string;
  priority?: string;
  content?: string;
  user?: string;
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

  const { boardId, section, title, priority, content, user, dueDateAt } = data;

  if (!section) return { error: "Missing section ID" };

  try {
    await assertCanWriteBoard(authzUser, boardId);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  // Quick-add path: no title/user/priority/content - create a blank task
  if (!title || !user || !priority || !content) {
    try {
      const tasksCount = (await supabaseAdmin.from("Tasks").select("*", { count: 'exact', head: true }).eq("section", section)).count;

      (await supabaseAdmin.from("Tasks").insert({
                        v: 0,
                        priority: "normal",
                        title: "New task",
                        content: "",
                        section,
                        createdBy: session.user.id,
                        updatedBy: session.user.id,
                        position: tasksCount > 0 ? tasksCount : 0,
                        user: session.user.id,
                        taskStatus: "ACTIVE",
                      }).select("*").single()).data;

      (await supabaseAdmin.from("Boards").update({ updatedAt: new Date() }).select("*").single().eq("id", boardId).select("*").single()).data;

      revalidatePath("/[locale]/(routes)/projects", "page");
      return { success: true };
    } catch (error) {
      console.log("[CREATE_TASK_IN_BOARD_QUICK]", error);
      return { error: "Failed to create task" };
    }
  }

  // Full-detail path
  try {
    const tasksCount = (await supabaseAdmin.from("Tasks").select("*", { count: 'exact', head: true }).eq("section", section)).count;

    const task = (await supabaseAdmin.from("Tasks").insert({
                v: 0,
                priority,
                title,
                content,
                dueDateAt,
                section,
                createdBy: user,
                updatedBy: user,
                position: tasksCount > 0 ? tasksCount : 0,
                user,
                taskStatus: "ACTIVE",
              }).select("*").single()).data;

    (await supabaseAdmin.from("Boards").update({ updatedAt: new Date() }).select("*").single().eq("id", boardId).select("*").single()).data;

    // Send email notification if assigning to a different user
    if (user !== session.user.id) {
      try {
        let resend;
        try {
          resend = await resendHelper();
        } catch {
          // Email not configured, skip silently
          resend = null;
        }

        if (resend) {
          const notifyRecipient = (await supabaseAdmin.from("Users").select("*").eq("id", user).single()).data;

          const boardData = (await supabaseAdmin.from("Boards").select("*").eq("id", boardId).single()).data;

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
                  ? `New task - ${title}.`
                  : `Nový úkol - ${title}.`,
              text: "",
              react: NewTaskFromProject({
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
        console.log("[CREATE_TASK_IN_BOARD_EMAIL]", emailError);
      }
    }

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[CREATE_TASK_IN_BOARD]", error);
    return { error: "Failed to create task" };
  }
};

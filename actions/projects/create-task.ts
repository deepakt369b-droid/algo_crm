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

export const createTask = async (data: {
  title: string;
  user: string;
  board: string;
  priority: string;
  content: string;
  dueDateAt?: Date;
  account?: string;
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

  const { title, user, board, priority, content, dueDateAt } = data;

  if (!title || !user || !board || !priority || !content) {
    return { error: "Missing one of the task data" };
  }

  try {
    await assertCanWriteBoard(authzUser, board);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  try {
    const sectionId = (await supabaseAdmin.from("sections").select("*").eq("board", board).order("position", { ascending: true }).single()).data;

    if (!sectionId) return { error: "No section found" };

    const tasksCount = (await supabaseAdmin.from("tasks").select("*", { count: 'exact', head: true }).eq("section", sectionId.id)).count;

    const task = (await supabaseAdmin.from("tasks").insert({
            v: 0,
            priority,
            title,
            content,
            dueDateAt,
            section: sectionId.id,
            createdBy: session.user.id,
            updatedBy: session.user.id,
            position: tasksCount > 0 ? tasksCount : 0,
            user,
            taskStatus: "ACTIVE",
          }).select("*").single()).data;

    (await supabaseAdmin.from("boards").update({ updatedAt: new Date() }).eq("id", board).select("*").single()).data;

    // Send email notification if assigning to a different user
    if (user !== session.user.id) {
      try {
        let resend;
        try {
          resend = await resendHelper();
        } catch {
          resend = null;
        }

        if (resend) {
          const notifyRecipient = (await supabaseAdmin.from("users").select("*").eq("id", user).single()).data;

          const boardData = (await supabaseAdmin.from("boards").select("*").eq("id", board).single()).data;

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
        console.log("[CREATE_TASK_EMAIL]", emailError);
      }
    }

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[CREATE_TASK]", error);
    return { error: "Failed to create task" };
  }
};

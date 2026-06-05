"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import resendHelper from "@/lib/resend";
import NewTaskFromCRMEmail from "@/emails/NewTaskFromCRM";
import NewTaskFromCRMToWatchersEmail from "@/emails/NewTaskFromCRMToWatchers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const createTask = async (data: {
  title: string;
  user: string;
  priority: string;
  content: string;
  account: string;
  dueDateAt?: Date;
}) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { title, user, priority, content, account, dueDateAt } = data;

  if (!title || !user || !priority || !content || !account) {
    return { error: "Missing one of the task data" };
  }

  let resend;
  try {
    resend = await resendHelper();
  } catch (error: any) {
    return { error: error?.message || "Resend API key is not configured" };
  }

  try {
    const task = (await supabaseAdmin.from("crm_Accounts_Tasks").insert({
                v: 0,
                priority,
                title,
                content,
                account,
                dueDateAt,
                createdBy: user,
                updatedBy: user,
                user,
                taskStatus: "ACTIVE",
              }).select("*").single()).data;

    // Notification to user who is not a task creator
    if (user !== session.user.id) {
      try {
        const notifyRecipient = (await supabaseAdmin.from("Users").select("*").eq("id", user).single()).data;

        await resend.emails.send({
          from:
            process.env.NEXT_PUBLIC_APP_NAME +
            " <" +
            process.env.EMAIL_FROM +
            ">",
          to: notifyRecipient?.email!,
          subject:
            session.user.userLanguage === "en"
              ? `New task - ${title}.`
              : `Nový úkol - ${title}.`,
          text: "",
          react: NewTaskFromCRMEmail({
            taskFromUser: session.user.name!,
            username: notifyRecipient?.name!,
            userLanguage: notifyRecipient?.userLanguage!,
            taskData: task,
          }),
        });
      } catch (error) {
        console.log(error);
      }
    }

    // Notification to account watchers
    try {
      const accountWatchers = (await supabaseAdmin.from("accountWatchers").select("*").eq("account_id", account)).data;

      for (const watcher of accountWatchers) {
        await resend.emails.send({
          from:
            process.env.NEXT_PUBLIC_APP_NAME +
            " <" +
            process.env.EMAIL_FROM +
            ">",
          to: watcher.user?.email!,
          subject:
            session.user.userLanguage === "en"
              ? `New task - ${title}.`
              : `Nový úkol - ${title}.`,
          text: "",
          react: NewTaskFromCRMToWatchersEmail({
            taskFromUser: session.user.name!,
            username: watcher.user?.name!,
            userLanguage: watcher.user?.userLanguage!,
            taskData: task,
          }),
        });
      }
    } catch (error) {
      console.log(error);
    }

    revalidatePath("/[locale]/(routes)/crm/accounts", "page");
    return { data: task };
  } catch (error) {
    console.log("[CREATE_TASK]", error);
    return { error: "Failed to create task" };
  }
};

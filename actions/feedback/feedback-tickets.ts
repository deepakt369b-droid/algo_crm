"use server";

import { getSession } from "@/lib/auth-server";

import resendHelper from "@/lib/resend";
import { FeedbackPriority, FeedbackStatus } from "@/lib/prisma-types";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type CreateTicketInput = {
  subject?: string;
  message: string;
  priority: FeedbackPriority;
  category?: string;
};

/**
 * Creates a new feedback ticket and persists it to the database,
 * then triggers an optional notification email.
 */
export async function createFeedbackTicket(data: CreateTicketInput) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const { subject, message, priority, category } = data;
  if (!message) {
    return { error: "Message is required" };
  }

  try {
    // 1. Create ticket in the database
    const ticket = (await supabaseAdmin.from("FeedbackTicket").insert({
            userId: session.user.id,
            subject: subject || "No Subject",
            message,
            priority: priority || FeedbackPriority.MEDIUM,
            category: category || "General",
            status: FeedbackStatus.OPEN,
          }).select("*").single()).data;

    if (!ticket) throw new Error("Failed to insert ticket.");

    // 2. Try sending an email notification
    try {
      const resend = await resendHelper();
      if (resend) {
        const appName = process.env.NEXT_PUBLIC_APP_NAME || "Flowline Pro";
        const emailFrom = process.env.EMAIL_FROM || "noreply@domain.com";
        const adminEmail = process.env.ADMIN_EMAIL || "info@domain.com";

        await resend.emails.send({
          from: `${appName} <${emailFrom}>`,
          to: adminEmail,
          subject: `[FEEDBACK #${ticket.ticketRef.substring(0, 8)}] New ${ticket.priority} Ticket`,
          text: `A new feedback ticket has been raised.
          
Ticket Ref: ${ticket.ticketRef}
Submitted By: ${ticket.user.name} (${ticket.user.email})
Priority: ${ticket.priority}
Subject: ${ticket.subject}

Message:
${ticket.message}
`,
        });
      }
    } catch (emailErr) {
      console.warn("[FEEDBACK_EMAIL_WARN] Failed to send email notice, persisted to DB only.", emailErr);
    }

    revalidatePath("/superadmin/feedback");
    return { success: true, ticket };
  } catch (error: any) {
    console.error("[FEEDBACK_CREATE_ERROR]", error);
    return { error: error.message || "Failed to create feedback ticket." };
  }
}

/**
 * Fetches all feedback tickets across all users (Superadmin only).
 */
export async function getSuperadminFeedbackTickets() {
  const session = await getSession();
  if (!session?.user?.isSuperAdmin && session?.user?.role !== "superadmin" && session?.user?.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Access denied. Superadmin privileges required.");
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Hard delete tickets older than 30 days to keep the log only for one month
    await supabaseAdmin.from("FeedbackTicket").delete().lt("createdAt", thirtyDaysAgo.toISOString());

    return (await supabaseAdmin.from("FeedbackTicket").select("*, user(id, name, email, avatar), responder(id, name, email)").order("createdAt", { ascending: false })).data ?? [];
  } catch (error) {
    console.error("[FEEDBACK_FETCH_ALL_ERROR]", error);
    throw new Error("Failed to retrieve feedback tickets.");
  }
}

/**
 * Superadmin updates a ticket's status and optionally appends a response.
 */
export async function updateTicketStatus(
  ticketId: string,
  status: FeedbackStatus,
  response?: string
) {
  const session = await getSession();
  if (!session?.user?.isSuperAdmin && session?.user?.role !== "superadmin" && session?.user?.email !== process.env.ADMIN_EMAIL) {
    return { error: "Access denied. Superadmin privileges required." };
  }

  try {
    const updateData: any = { status };
    if (response !== undefined) {
      updateData.response = response;
      updateData.respondedBy = session?.user?.id;
      updateData.respondedAt = new Date();
    }

    const ticket = (await supabaseAdmin.from("FeedbackTicket").update(updateData).eq("id", ticketId).select("*").single()).data;

    revalidatePath("/superadmin/feedback");
    return { success: true, ticket };
  } catch (error: any) {
    console.error("[FEEDBACK_UPDATE_ERROR]", error);
    return { error: error.message || "Failed to update feedback ticket status." };
  }
}

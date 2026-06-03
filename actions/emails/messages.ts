"use server";
import { getSession } from "@/lib/auth-server";


import { decrypt } from "@/lib/email-crypto";
import nodemailer from "nodemailer";
import { EmailFolder } from "@/lib/prisma-types";
import { supabaseAdmin } from "@/lib/supabase-admin";

const PAGE_SIZE = 50;
const MAX_COUNT = 10_000;

async function requireSession() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id as string;
}

export async function getEmails(
  accountId: string,
  folder: EmailFolder,
  page: number,
  search?: string
) {
  const userId = await requireSession();

  const baseWhere = {
    userId,
    emailAccountId: accountId,
    folder,
    isDeleted: false,
  } as const;

  // Build where clause with optional text search fallback
  const where =
    search && search.length >= 3
      ? {
          ...baseWhere,
          OR: [
            { subject: { contains: search, mode: "insensitive" as const } },
            { fromEmail: { contains: search, mode: "insensitive" as const } },
            { fromName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : baseWhere;

  const [emails, rawCount] = await Promise.all([
    (await supabaseAdmin.from("email").select("id, subject, fromName, fromEmail, sentAt, isRead, folder").order("sentAt", { ascending: false }).limit(PAGE_SIZE).range((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + (PAGE_SIZE - 1))).data,
    (await supabaseAdmin.from("email").select("*", { count: 'exact', head: true })).count,
  ]);

  const total = Math.min(rawCount, MAX_COUNT);
  return { emails, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getEmail(id: string) {
  const userId = await requireSession();
  const email = (await supabaseAdmin.from("email").select("*, contacts(*, contact(id, first_name, last_name)), accounts(*, account(id, name))").eq("id", id).eq("userId", userId).eq("isDeleted", false).single()).data;
  if (!email) throw new Error("Not found");

  // Lazy body fetch for emails not yet CRM-linked at sync time
  if (!email.bodyText && !email.bodyHtml && email.imapUid) {
    try {
      const account = (await supabaseAdmin.from("emailAccount").select("username, passwordEncrypted, imapHost, imapPort, imapSsl, sentFolderName").eq("id", email.emailAccountId).single()).data;

      if (account) {
        const { fetchBodyByUid } = await import("@/inngest/lib/imap-utils");
        const folderName = email.folder === "SENT" ? (account.sentFolderName || "Sent") : "INBOX";
        const body = await fetchBodyByUid(
          {
            username: account.username,
            password: decrypt(account.passwordEncrypted),
            imapHost: account.imapHost,
            imapPort: account.imapPort,
            imapSsl: account.imapSsl,
          },
          folderName,
          email.imapUid
        );

        if (body.bodyText || body.bodyHtml) {
          (await supabaseAdmin.from("email").update({ bodyText: body.bodyText ?? null, bodyHtml: body.bodyHtml ?? null }).select("*").single().eq("id", id).select("*").single()).data;
          // Patch in-memory so caller gets the body immediately (before any send that may throw)
          email.bodyText = body.bodyText ?? null;
          email.bodyHtml = body.bodyHtml ?? null;
          // Trigger embed only if already CRM-linked (avoids embedding unrelated emails)
          const isLinked = email.contacts.length > 0 || email.accounts.length > 0;
          if (isLinked) {
            const { inngest } = await import("@/inngest/client");
            inngest.send({ name: "email/embed-email", data: { emailId: id } });
          }
        }
      }
    } catch {
      // Body fetch failed — return email without body; display will show a fallback
    }
  }

  // Mark as read (fire-and-forget)
  if (!email.isRead) {
    (await supabaseAdmin.from("email").update({ isRead: true }).select("*").single().eq("id", id).select("*").single()).data.catch(() => {});
  }

  return email;
}

export async function deleteEmail(id: string) {
  const userId = await requireSession();
  const email = (await supabaseAdmin.from("email").select("*").eq("id", id).eq("userId", userId).eq("isDeleted", false).single()).data;
  if (!email) throw new Error("Not found");
  (await supabaseAdmin.from("email").update({ isDeleted: true }).select("*").single().eq("id", id).select("*").single()).data;
}

type SendInput = {
  accountId: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  inReplyTo?: string;   // parent's Message-ID
  references?: string;  // parent's References + parent's Message-ID (space-separated)
};

export async function sendEmail(input: SendInput) {
  const userId = await requireSession();

  const account = (await supabaseAdmin.from("emailAccount").select("*").eq("id", input.accountId).eq("userId", userId).single()).data;
  if (!account) throw new Error("Account not found");

  const password = decrypt(account.passwordEncrypted);

  const transporter = nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpSsl,
    auth: { user: account.username, pass: password },
  });

  const info = await transporter.sendMail({
    from: account.username,
    to: input.to.join(", "),
    cc: input.cc?.join(", "),
    bcc: input.bcc?.join(", "),
    subject: input.subject,
    text: input.body,
    inReplyTo: input.inReplyTo,
    references: input.references,
  });

  // Write sent message to DB immediately so it appears in Sent view
  (await supabaseAdmin.from("email").insert({
            emailAccountId: input.accountId,
            userId,
            rfcMessageId: info.messageId ?? `local-${crypto.randomUUID()}@flowlinepro`,
            folder: EmailFolder.SENT,
            subject: input.subject,
            fromEmail: account.username,
            toRecipients: input.to.map((e) => ({ email: e })),
            ccRecipients: input.cc?.map((e) => ({ email: e })) ?? [],
            bccRecipients: input.bcc?.map((e) => ({ email: e })) ?? [],
            bodyText: input.body,
            sentAt: new Date(),
            isRead: true,
          }).select("*").single()).data;
}

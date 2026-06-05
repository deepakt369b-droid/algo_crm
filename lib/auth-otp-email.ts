import { sendEmail as sendWorkerEmail } from "@/lib/email";
import resendHelper from "@/lib/resend";

const importOptionalModule = async <T = any>(pkg: string): Promise<T | null> => {
  try {
    return (await eval("import(pkg)") as Promise<T>);
  } catch {
    return null;
  }
};

function firstEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value?.trim()) return value.trim();
  }
  return undefined;
}

function getFromAddress() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Flowline CRM";
  const from = firstEnv(
    "EMAIL_FROM",
    "SMTP_FROM",
    "GMAIL_FROM",
    "EMAIL_USERNAME",
    "SMTP_USER",
    "SMTP_USERNAME",
    "GMAIL_USER"
  );
  return from ? `${appName} <${from}>` : undefined;
}

function getOtpEmailContent(otp: string) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Flowline CRM";

  return {
    subject: `${otp} is your ${appName} login code`,
    text: `Your ${appName} verification code is: ${otp}\n\nEnter this code in the app to continue. This code expires shortly.\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin: 0 0 12px;">Your ${appName} login code</h2>
        <p style="margin: 0 0 16px;">Enter this 6-digit code in the app:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${otp}</div>
        <p style="margin: 0; color: #6b7280;">This code expires shortly. If you did not request it, ignore this email.</p>
      </div>
    `,
  };
}

async function sendViaSmtp(to: string, subject: string, text: string, html: string) {
  const host = firstEnv("EMAIL_HOST", "SMTP_HOST", "GMAIL_SMTP_HOST") || "smtp.gmail.com";
  const username = firstEnv("EMAIL_USERNAME", "SMTP_USER", "SMTP_USERNAME", "GMAIL_USER");
  const password = firstEnv(
    "EMAIL_PASSWORD",
    "SMTP_PASSWORD",
    "SMTP_PASS",
    "GMAIL_APP_PASSWORD",
    "GMAIL_PASSWORD"
  );

  if (!username || !password) {
    return false;
  }

  const nodemailer = await importOptionalModule<typeof import("nodemailer")>("nodemailer");
  if (!nodemailer) return false;

  const port = Number(firstEnv("EMAIL_PORT", "SMTP_PORT", "GMAIL_SMTP_PORT") || 465);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: username,
      pass: password,
    },
  });

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  });

  return true;
}

export async function sendAuthOtpEmail(to: string, otp: string) {
  const { subject, text, html } = getOtpEmailContent(otp);
  const errors: string[] = [];

  try {
    const sent = await sendWorkerEmail({ to, subject, text, html });
    if (sent) return;
  } catch (error: any) {
    errors.push(error?.message || "Worker Mailer failed");
  }

  try {
    const from = getFromAddress();
    if (from) {
      const resend = await resendHelper();
      await resend.emails.send({ from, to, subject, text, html });
      return;
    }
  } catch (error: any) {
    errors.push(error?.message || "Resend failed");
  }

  try {
    const sent = await sendViaSmtp(to, subject, text, html);
    if (sent) return;
  } catch (error: any) {
    errors.push(error?.message || "SMTP failed");
  }

  throw new Error(
    errors.length
      ? `No OTP email provider succeeded: ${errors.join("; ")}`
      : "No OTP email provider is configured. Configure either WORKER_MAILER_URL/WORKER_MAILER_API_KEY, RESEND_API_KEY with EMAIL_FROM, or SMTP env vars: EMAIL_USERNAME + EMAIL_PASSWORD (aliases: SMTP_USER/SMTP_PASSWORD or GMAIL_USER/GMAIL_APP_PASSWORD)."
  );
}

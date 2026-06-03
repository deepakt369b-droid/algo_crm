interface EmailOptions {
  from: string | undefined;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export default async function sendEmail(emailOptions: EmailOptions): Promise<void> {
  // Prefer Resend if available, then fallback to Nodemailer if installed. If
  // neither is available, log the email (no-op) so the app can run without
  // optional email packages during this Supabase-only migration.
  try {
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: emailOptions.from || process.env.RESEND_FROM_EMAIL || "noreply@example.com",
          to: emailOptions.to,
          subject: emailOptions.subject,
          html: emailOptions.html,
          text: emailOptions.text,
        });
        console.log(`Email (Resend) queued to ${emailOptions.to}`);
        return;
      } catch {
        // Resend package not installed or failed — continue to next option
      }
    }

    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 465),
        secure: (process.env.EMAIL_SECURE || "true") === "true",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      await transporter.sendMail(emailOptions as any);
      console.log(`Email sent to ${emailOptions.to}`);
      return;
    } catch {
      // Nodemailer not present or send failed — fallthrough to logging
    }
  } catch (err) {
    console.error("Unexpected error sending email:", err);
  }

  // Fallback: log email so system remains operational in environments without
  // an email provider configured.
  console.info("[sendEmail stub] to=", emailOptions.to, "subject=", emailOptions.subject);
}

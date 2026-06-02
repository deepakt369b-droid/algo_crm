/**
 * Email service integrating with `worker-mailer` (https://github.com/zou-yu/worker-mailer)
 * This allows us to send transactional emails directly from Cloudflare Workers 
 * without relying on heavy Node.js SMTP libraries.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const mailerUrl = process.env.WORKER_MAILER_URL;
  const apiKey = process.env.WORKER_MAILER_API_KEY;

  if (!mailerUrl || !apiKey) {
    console.warn("Worker Mailer is not configured. Skipping email send.");
    return false;
  }

  try {
    const response = await fetch(`${mailerUrl}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Email Service] Failed to send email: ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[Email Service] Network error sending email:`, error);
    return false;
  }
}

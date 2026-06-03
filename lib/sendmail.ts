const importOptionalModule = async <T = any>(pkg: string): Promise<T | null> => {
  try {
    return (await eval("import(pkg)") as Promise<T>);
  } catch {
    return null;
  }
};

export interface EmailOptions {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  inReplyTo?: string;
  references?: string;
}

export default async function sendEmail(
  emailOptions: EmailOptions
): Promise<{ messageId?: string } | null> {
  const nodemailer = await importOptionalModule<typeof import("nodemailer")>("nodemailer");
  if (!nodemailer) {
    throw new Error(
      "nodemailer is not installed. Install nodemailer or configure an alternate email provider."
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail(emailOptions as any);
    console.log(`Email sent to ${emailOptions.to}`);
    return { messageId: info?.messageId };
  } catch (error: any | Error) {
    console.error(`Error occurred while sending email: ${error.message}`);
    throw error;
  }
}

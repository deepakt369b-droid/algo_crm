import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function resendHelper() {
  const resendKey = (await supabaseAdmin.from("systemServices").select("*").eq("name", "resend_smtp").single()).data;
  const apiKey = process.env.RESEND_API_KEY || resendKey?.serviceKey;
  if (!apiKey) {
    throw new Error("Resend API key is not configured. Please add it in Admin settings or set RESEND_API_KEY environment variable.");
  }

  try {
    const mod = await import("resend");
    const Resend = (mod as any).Resend ?? (mod as any).default ?? mod;
    return new Resend(apiKey);
  } catch (err) {
    throw new Error("Resend package is not installed. Install 'resend' or configure another email provider.");
  }
}

import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function resendHelper() {
  const resendKey = (await supabaseAdmin.from("systemServices").select("*").eq("name", "resend_smtp").single()).data;

  const apiKey = process.env.RESEND_API_KEY || resendKey?.serviceKey;

  if (!apiKey) {
    throw new Error("Resend API key is not configured. Please add it in Admin settings or set RESEND_API_KEY environment variable.");
  }

  const resend = new Resend(apiKey);

  return resend;
}

import { supabaseAdmin } from "@/lib/supabase-admin";

const importOptionalModule = async <T = any>(pkg: string): Promise<T | null> => {
  try {
    return (await eval("import(pkg)") as Promise<T>);
  } catch {
    return null;
  }
};

export default async function resendHelper() {
  const resendKey = (await supabaseAdmin.from("systemServices").select("*").eq("name", "resend_smtp").single()).data;

  const apiKey = process.env.RESEND_API_KEY || resendKey?.serviceKey;

  if (!apiKey) {
    throw new Error("Resend API key is not configured. Please add it in Admin settings or set RESEND_API_KEY environment variable.");
  }

  const resendModule = await importOptionalModule<typeof import("resend")>("resend");
  const ResendClass = resendModule?.Resend ?? resendModule?.default;

  if (!ResendClass) {
    throw new Error(
      "resend is not installed. Install resend or configure another email provider to use Resend features."
    );
  }

  return new ResendClass(apiKey);
}

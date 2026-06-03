import { createClient } from "@supabase/supabase-js";

const isValidHttpUrl = (value?: string) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const validSupabaseUrl = isValidHttpUrl(supabaseUrl) ? supabaseUrl : undefined;

if (!validSupabaseUrl || !supabaseServiceKey) {
  console.warn(
    "Missing or invalid SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables. Using dummy client for build-time initialization."
  );
}

export const supabaseAdmin = createClient(
  validSupabaseUrl || "https://dummy.supabase.co",
  supabaseServiceKey || "dummy-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

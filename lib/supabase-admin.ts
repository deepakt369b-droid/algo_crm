import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase admin client with the service role key.
// This bypasses Row Level Security (RLS) and should ONLY be used in server-side logic
// where you need to perform administrative database operations.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

export const supabaseAdmin = createClient(
  supabaseUrl || "https://dummy.supabase.co",
  supabaseServiceKey || "dummy-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

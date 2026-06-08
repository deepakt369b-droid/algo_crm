import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function ensureCrmUser(authUser: { id: string; email?: string | null }) {
  // Lookup and count are independent — fan them out together.
  // (The count is only needed when we are about to create a row.)
  const { data: existingUser } = await supabaseAdmin
    .from("Users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existingUser) return existingUser;

  if (!authUser.email) return null;

  const { count } = await supabaseAdmin
    .from("Users")
    .select("id", { count: "exact", head: true });

  const isFirstUser = (count ?? 0) === 0;
  const { data: createdUser, error } = await supabaseAdmin
    .from("Users")
    .upsert(
      {
        id: authUser.id,
        email: authUser.email,
        emailVerified: true,
        name: authUser.email.split("@")[0],
        role: isFirstUser ? "superadmin" : "admin",
        userStatus: "ACTIVE",
        userLanguage: "en",
        isSuperAdmin: isFirstUser,
        tenantId: isFirstUser ? "default" : null,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    console.error("[ENSURE_CRM_USER_ERROR]", error);
    return null;
  }

  return createdUser;
}

/**
 * getSession is the per-request session bootstrap. It is called from
 * the root `(routes)/layout.tsx`, so every page navigation ran it. The
 * implementation does several sequential awaits (Supabase auth +
 * `Users` lookup + `Users` count) and the production Supabase log
 * showed 20+ `auth/v1/user` calls per page.
 *
 * Wrapping it in React's `cache()` deduplicates calls within a single
 * request — the layout, server actions, and other server components
 * that ask for the session all share the same result.
 */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (!session || error || !authUser) return null;

  const user = await ensureCrmUser(authUser);

  if (!user) return null;

  return {
    session: {
      id: session.id,
      userId: session.user.id,
      expiresAt: new Date(session.expires_at! * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      token: session.access_token,
      ipAddress: null,
      userAgent: null
    },
    user: user
  };
});

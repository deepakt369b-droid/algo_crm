import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function ensureCrmUser(authUser: { id: string; email?: string | null }) {
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

export async function getSession() {
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
}

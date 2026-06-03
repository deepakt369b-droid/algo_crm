import { createClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;
  
  // Fetch user data from User table
  const { data: user } = await supabase
    .from('User')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
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

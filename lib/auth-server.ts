import { createClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();
  
  if (!session || error || !authUser) return null;
  
  const { data: user } = await supabase
    .from('Users')
    .select('*')
    .eq('id', authUser.id)
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

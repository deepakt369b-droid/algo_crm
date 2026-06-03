
import { getSession } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getUser = async () => {
  const session = await getSession();
  const data = (await supabaseAdmin.from("users").select("*").eq("id", session?.user?.id).single()).data;
  if (!data) throw new Error("User not found");
  return data;
};

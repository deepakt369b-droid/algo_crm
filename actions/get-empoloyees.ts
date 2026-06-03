import { supabaseAdmin } from "@/lib/supabase-admin";

export const getEmployees = async () => {
  const data = (await supabaseAdmin.from("employees").select("*")).data;
  return data;
};

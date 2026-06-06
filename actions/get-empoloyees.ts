import { supabaseAdmin } from "@/lib/supabase-admin";

export const getEmployees = async () => {
  const data = (await supabaseAdmin.from("Employees").select("*")).data;
  return data;
};

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getInvoices() {
  return (await supabaseAdmin.from("Invoices").select("*, account(id, name), series(id, name)").order("createdAt", { ascending: false }).limit(100)).data;
}

export async function getInvoiceById(id: string) {
  return (await supabaseAdmin.from("Invoices").select("*").single()).data;
}

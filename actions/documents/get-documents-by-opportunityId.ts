import { supabaseAdmin } from "@/lib/supabase-admin";

export const getDocumentsByOpportunityId = async (opportunityId: string) => {
  // Query through DocumentsToOpportunities junction table
  const data = (await supabaseAdmin.from("Documents").select("*").order("date_created", { ascending: false })).data;
  return data;
};

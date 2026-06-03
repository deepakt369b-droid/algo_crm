"use server";
import { getSession } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function setInactiveOpportunity(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthenticated" };
  }

  console.log(id, "id");

  if (!id) {
    console.log("Opportunity id is required");
  }
  try {
    const opportunity = (await supabaseAdmin.from("crm_Opportunities").select("assigned_to").eq("id", id).eq("deletedAt", null).single()).data;

    if (!opportunity) {
      return { error: "Opportunity not found" };
    }

    if (session.user.role !== "admin" && opportunity.assigned_to !== session.user.id) {
      return { error: "Forbidden" };
    }

    const result = (await supabaseAdmin.from("crm_Opportunities").update({
            status: "INACTIVE",
          }).eq("id", id).select("*").single()).data;

    console.log(result, "result");

    console.log("Opportunity has been set to inactive");
  } catch (error) {
    console.error(error);
  }
}

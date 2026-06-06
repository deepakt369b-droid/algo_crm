
import {
  requireAuthenticated,
  AuthenticationError,
} from "@/lib/authz";
import { serializeDecimalsList } from "@/lib/serialize-decimals";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getUserOpportunities = async (userId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  // A plain "user" can only fetch their own opportunity list. Manager/admin
  // can list opportunities for any user.
  if (user.role === "user" && userId !== user.id) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("crm_Opportunities")
    .select("*, assigned_sales_stage:crm_Opportunities_Sales_Stages!crm_Opportunities_sales_stage_fkey(name)")
    .eq("assigned_to", userId)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("[CRM_USER_OPPORTUNITIES_ERROR]", error);
    return [];
  }

  return serializeDecimalsList(data);
};

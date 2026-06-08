
import {
  requireAuthenticated,
  opportunityReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { serializeDecimalsList } from "@/lib/serialize-decimals";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { unstable_cache } from "next/cache";

export const getOpportunities = async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  return unstable_cache(
    async () => {
      const { data, error } = await supabaseAdmin
        .from("crm_Opportunities")
        .select(`
          *,
          assigned_to_user:Users!crm_Opportunities_assigned_to_fkey(avatar, name),
          created_by_user:Users!crm_Opportunities_createdBy_fkey(name),
          contacts:ContactsToOpportunities!ContactsToOpportunities_opportunity_id_fkey(
            *,
            contact:crm_Contacts!ContactsToOpportunities_contact_id_fkey(id, first_name, last_name)
          ),
          documents:DocumentsToOpportunities!DocumentsToOpportunities_opportunity_id_fkey(
            *,
            document:Documents!DocumentsToOpportunities_document_id_fkey(id, document_name)
          )
        `);
      if (error) {
        console.error("[CRM_OPPORTUNITIES_LIST_ERROR]", error);
        return [];
      }
      return serializeDecimalsList(data);
    },
    ["crm-opportunities"],
    { tags: ["crm-opportunities"], revalidate: 300 }
  )();
};

//Get opportunities by month for chart
export const getOpportunitiesByMonth = async () => {
  const opportunities = (await supabaseAdmin.from("crm_Opportunities").select("created_on").is("deletedAt", null)).data;

  if (!opportunities) {
    return {};
  }

  const opportunitiesByMonth = opportunities.reduce(
    (acc: any, opportunity: any) => {
      const month = new Date(opportunity.created_on).toLocaleString("default", {
        month: "long",
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    },
    {}
  );

  const chartData = Object.keys(opportunitiesByMonth).map((month: any) => {
    return {
      name: month,
      Number: opportunitiesByMonth[month],
    };
  });

  return chartData;
};

//Get opportunities by sales_stage name for chart
export const getOpportunitiesByStage = async () => {
  const opportunities = (await supabaseAdmin
    .from("crm_Opportunities")
    .select("assigned_sales_stage:crm_Opportunities_Sales_Stages!crm_Opportunities_sales_stage_fkey(name)")
    .is("deletedAt", null)).data;

  console.log(opportunities, "opportunities");
  if (!opportunities) {
    return {};
  }

  const opportunitiesByStage = opportunities.reduce(
    (acc: any, opportunity: any) => {
      const stage = opportunity.assigned_sales_stage?.name;
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    },
    {}
  );

  const chartData = Object.keys(opportunitiesByStage).map((stage: any) => {
    return {
      name: stage,
      Number: opportunitiesByStage[stage],
    };
  });

  return chartData;
};

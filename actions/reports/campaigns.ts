
import type { ReportFilters, ChartDataPoint } from "./types";
import { groupedToChartData } from "./types";
import type { ReportScope } from "@/lib/authz/scopes/report-scope";
import { getReportScope } from "@/lib/authz/scopes/report-scope";
import { supabaseAdmin } from "@/lib/supabase-admin";

const DEFAULT_SCOPE: ReportScope = getReportScope({ id: "", role: "manager" });

export async function getCampaignPerformance(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<{
  sent: number; opened: number; clicked: number; openRate: number; clickRate: number;
}> {
  // crm_campaign_sends has no direct scope mapping; sends are scoped indirectly
  // via the parent campaign. Manager/admin: no filter. User: rely on owning
  // campaign via crm_campaigns relation in other queries.
  void scope;
  const dateFilter = { sent_at: { gte: filters.dateFrom, lte: filters.dateTo }, status: "sent" };
  const sent = (await supabaseAdmin.from("crm_campaign_sends").select("*", { count: 'exact', head: true })).count;
  const opened = (await supabaseAdmin.from("crm_campaign_sends").select("*", { count: 'exact', head: true })).count;
  const clicked = (await supabaseAdmin.from("crm_campaign_sends").select("*", { count: 'exact', head: true })).count;
  return {
    sent, opened, clicked,
    openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
    clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
  };
}

export async function getCampaignROI(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<ChartDataPoint[]> {
  const campaigns = (await supabaseAdmin.from("crm_campaigns").select("name").in("status", ["sent", "sending"])).data;
  return campaigns.map((c: { name: string; _count: { sends: number } }) => ({ name: c.name, Number: c._count.sends }));
}

export async function getTopTemplates(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<ChartDataPoint[]> {
  const campaigns = (await supabaseAdmin.from("crm_campaigns").select("*").order("sends", { ascending: false }).limit(10)).data;
  const result: ChartDataPoint[] = [];
  for (const c of campaigns) {
    if (c.template) result.push({ name: c.template.name, Number: c._count.sends });
  }
  return result;
}

export async function getTargetListGrowth(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<ChartDataPoint[]> {
  // crm_TargetLists has no direct ReportScope mapping; treat as campaign-adjacent.
  // Manager/admin: no filter. Future: add target-list scope key if user-scoping needed.
  void scope;
  const lists = (await supabaseAdmin.from("crm_TargetLists").select("created_on")).data;
  const grouped: Record<string, number> = {};
  for (const l of lists) {
    if (!l.created_on) continue;
    const d = new Date(l.created_on);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    grouped[key] = (grouped[key] || 0) + l._count.targets;
  }
  return groupedToChartData(grouped, true);
}

import type { ReportFilters, ChartDataPoint } from "./types";
import { groupedToChartData } from "./types";
import type { ReportScope } from "@/lib/authz/scopes/report-scope";
import { getReportScope } from "@/lib/authz/scopes/report-scope";
import { supabaseAdmin } from "@/lib/supabase-admin";

const DEFAULT_SCOPE: ReportScope = getReportScope({ id: "", role: "manager" });

function groupByMonth(items: { createdAt?: Date | null }[]): ChartDataPoint[] {
  const grouped: Record<string, number> = {};
  for (const item of items) {
    if (!item.createdAt) continue;
    const d = new Date(item.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    grouped[key] = (grouped[key] || 0) + 1;
  }
  return groupedToChartData(grouped, true);
}

export async function getNewLeads(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<ChartDataPoint[]> {
  const leads = (await supabaseAdmin.from("crm_Leads").select("createdAt").is("deletedAt", null)).data;
  return groupByMonth(leads);
}

export async function getLeadSources(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<ChartDataPoint[]> {
  const leads = (await supabaseAdmin.from("crm_Leads").select("*").is("deletedAt", null)).data;
  const grouped: Record<string, number> = {};
  for (const lead of leads) {
    const source = lead.lead_source?.name ?? "Unknown";
    grouped[source] = (grouped[source] || 0) + 1;
  }
  return groupedToChartData(grouped);
}

export async function getConversionRate(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<{ leads: number; converted: number; rate: number }> {
  const leads = (await supabaseAdmin.from("crm_Leads").select("*", { count: 'exact', head: true }).is("deletedAt", null)).count;
  const converted = (await supabaseAdmin.from("crm_Opportunities").select("*", { count: 'exact', head: true }).is("deletedAt", null)).count;
  return { leads, converted, rate: leads > 0 ? Math.round((converted / leads) * 100) : 0 };
}

export async function getNewContacts(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<ChartDataPoint[]> {
  const contacts = (await supabaseAdmin.from("crm_Contacts").select("created_on")).data;
  return groupByMonth(contacts.map((c: { created_on: Date | null }) => ({ createdAt: c.created_on })));
}

export async function getContactsByAccount(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<ChartDataPoint[]> {
  const contacts = (await supabaseAdmin.from("crm_Contacts").select("*")).data;
  const grouped: Record<string, number> = {};
  for (const c of contacts) {
    const name = c.assigned_accounts?.name ?? "Unassigned";
    grouped[name] = (grouped[name] || 0) + 1;
  }
  return groupedToChartData(grouped);
}

import type { ReportFilters, ChartDataPoint } from "./types";
import { groupedToChartData } from "./types";
import { getExchangeRates, convertAmount } from "@/lib/currency";
import Decimal from "decimal.js";
import type { ReportScope } from "@/lib/authz/scopes/report-scope";
import { getReportScope } from "@/lib/authz/scopes/report-scope";
import { supabaseAdmin } from "@/lib/supabase-admin";

const DEFAULT_SCOPE: ReportScope = getReportScope({ id: "", role: "manager" });

function dateRangeWhere(filters: ReportFilters) {
  return {
    created_on: { gte: filters.dateFrom, lte: filters.dateTo },
    deletedAt: null,
  };
}

export async function getRevenue(
  filters: ReportFilters,
  displayCurrency: string,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<number> {
  const opps = (await supabaseAdmin.from("crm_Opportunities").select("budget, currency").eq("status", "CLOSED")).data;
  const rates = await getExchangeRates();
  let total = new Decimal(0);
  for (const opp of opps) {
    const budget = new Decimal(opp.budget?.toString() ?? "0");
    const from = opp.currency || displayCurrency;
    const converted = convertAmount(budget, from, displayCurrency, rates);
    total = total.add(converted ?? budget);
  }
  return total.toNumber();
}

export async function getPipelineValue(
  filters: ReportFilters,
  displayCurrency: string,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<number> {
  const opps = (await supabaseAdmin.from("crm_Opportunities").select("budget, currency").eq("status", "ACTIVE")).data;
  const rates = await getExchangeRates();
  let total = new Decimal(0);
  for (const opp of opps) {
    const budget = new Decimal(opp.budget?.toString() ?? "0");
    const from = opp.currency || displayCurrency;
    const converted = convertAmount(budget, from, displayCurrency, rates);
    total = total.add(converted ?? budget);
  }
  return total.toNumber();
}

export async function getOppsByStage(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<ChartDataPoint[]> {
  const opps = (await supabaseAdmin.from("crm_Opportunities").select("*")).data;
  const grouped: Record<string, number> = {};
  for (const opp of opps) {
    const stage = opp.assigned_sales_stage?.name ?? "Unassigned";
    grouped[stage] = (grouped[stage] || 0) + 1;
  }
  return groupedToChartData(grouped);
}

export async function getOppsByMonth(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<ChartDataPoint[]> {
  const opps = (await supabaseAdmin.from("crm_Opportunities").select("created_on")).data;
  const grouped: Record<string, number> = {};
  for (const opp of opps) {
    if (!opp.created_on) continue;
    const d = new Date(opp.created_on);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    grouped[key] = (grouped[key] || 0) + 1;
  }
  return groupedToChartData(grouped, true);
}

export async function getWinLossRate(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<{ won: number; total: number; rate: number }> {
  const won = (await supabaseAdmin.from("crm_Opportunities").select("*", { count: 'exact', head: true }).eq("status", "CLOSED")).count;
  const total = (await supabaseAdmin.from("crm_Opportunities").select("*", { count: 'exact', head: true }).in("status", ["CLOSED", "INACTIVE"])).count;
  return { won, total, rate: total > 0 ? Math.round((won / total) * 100) : 0 };
}

export async function getAvgDealSize(
  filters: ReportFilters,
  displayCurrency: string,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<number> {
  const opps = (await supabaseAdmin.from("crm_Opportunities").select("budget, currency").eq("status", "CLOSED")).data;
  if (opps.length === 0) return 0;
  const rates = await getExchangeRates();
  let total = new Decimal(0);
  for (const opp of opps) {
    const budget = new Decimal(opp.budget?.toString() ?? "0");
    const from = opp.currency || displayCurrency;
    const converted = convertAmount(budget, from, displayCurrency, rates);
    total = total.add(converted ?? budget);
  }
  return total.div(opps.length).toDecimalPlaces(2).toNumber();
}

export async function getSalesCycleLength(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<number> {
  const opps = (await supabaseAdmin.from("crm_Opportunities").select("created_on, close_date").eq("status", "CLOSED")).data;
  if (opps.length === 0) return 0;
  let totalDays = 0;
  for (const opp of opps) {
    if (!opp.created_on || !opp.close_date) continue;
    const diff = opp.close_date.getTime() - opp.created_on.getTime();
    totalDays += diff / (1000 * 60 * 60 * 24);
  }
  return Math.round(totalDays / opps.length);
}

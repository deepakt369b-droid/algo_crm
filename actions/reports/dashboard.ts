
import type { ReportFilters, KPIData } from "./types";
import { getExchangeRates, convertAmount } from "@/lib/currency";
import Decimal from "decimal.js";
import type { ReportScope } from "@/lib/authz/scopes/report-scope";
import { getReportScope } from "@/lib/authz/scopes/report-scope";
import { supabaseAdmin } from "@/lib/supabase-admin";

const DEFAULT_SCOPE: ReportScope = getReportScope({ id: "", role: "manager" });

function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function prevPeriod(filters: ReportFilters): { dateFrom: Date; dateTo: Date } {
  const duration = filters.dateTo.getTime() - filters.dateFrom.getTime();
  return {
    dateFrom: new Date(filters.dateFrom.getTime() - duration),
    dateTo: new Date(filters.dateFrom.getTime()),
  };
}

export async function getDashboardKPIs(
  filters: ReportFilters,
  displayCurrency: string = "EUR",
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<KPIData[]> {
  const prev = prevPeriod(filters);
  const rates = await getExchangeRates();

  const [
    revOppsCurr,
    revOppsPrev,
    pipeOppsCurr,
    pipeOppsPrev,
    leadsCurr,
    leadsPrev,
    convCurr,
    convPrev,
    contactsCurr,
    contactsPrev,
    usersCurr,
    usersPrev,
    tasksCurr,
    tasksPrev,
    tasksOpenCurr,
    tasksOpenPrev,
    campaignsCurr,
    campaignsPrev,
    accountsCurr,
    accountsPrev,
    contractsCurr,
    contractsPrev,
  ] = await Promise.all([
    // totalRevenue
    (await supabaseAdmin.from("crm_Opportunities").select("budget, currency").eq("deletedAt", null).eq("status", "CLOSED")).data,
    (await supabaseAdmin.from("crm_Opportunities").select("budget, currency").eq("deletedAt", null).eq("status", "CLOSED")).data,
    // pipelineValue
    (await supabaseAdmin.from("crm_Opportunities").select("budget, currency").eq("deletedAt", null).eq("status", "ACTIVE")).data,
    (await supabaseAdmin.from("crm_Opportunities").select("budget, currency").eq("deletedAt", null).eq("status", "ACTIVE")).data,
    // newLeads
    (await supabaseAdmin.from("crm_Leads").select("*", { count: 'exact', head: true }).eq("deletedAt", null)).count,
    (await supabaseAdmin.from("crm_Leads").select("*", { count: 'exact', head: true }).eq("deletedAt", null)).count,
    // conversionRate: closed opps count
    (await supabaseAdmin.from("crm_Opportunities").select("*", { count: 'exact', head: true }).eq("deletedAt", null).eq("status", "CLOSED")).count,
    (await supabaseAdmin.from("crm_Opportunities").select("*", { count: 'exact', head: true }).eq("deletedAt", null).eq("status", "CLOSED")).count,
    // newContacts (crm_Contacts has created_on, no deletedAt)
    (await supabaseAdmin.from("crm_Contacts").select("*", { count: 'exact', head: true })).count,
    (await supabaseAdmin.from("crm_Contacts").select("*", { count: 'exact', head: true })).count,
    // activeUsers (status = ACTIVE, not date-filtered) - global; manager/admin only typically read this KPI
    (await supabaseAdmin.from("Users").select("*", { count: 'exact', head: true }).eq("userStatus", "ACTIVE")).count,
    (await supabaseAdmin.from("Users").select("*", { count: 'exact', head: true }).eq("userStatus", "ACTIVE").lte("created_on", prev.dateTo)).count,
    // tasks total
    (await supabaseAdmin.from("tasks").select("*", { count: 'exact', head: true })).count,
    (await supabaseAdmin.from("tasks").select("*", { count: 'exact', head: true })).count,
    // open tasks (ACTIVE = not completed)
    (await supabaseAdmin.from("tasks").select("*", { count: 'exact', head: true }).eq("taskStatus", "ACTIVE")).count,
    (await supabaseAdmin.from("tasks").select("*", { count: 'exact', head: true }).eq("taskStatus", "ACTIVE")).count,
    // campaignsSent (sends have no direct scope; manager/admin = no-op)
    (await supabaseAdmin.from("crm_campaign_sends").select("*", { count: 'exact', head: true })).count,
    (await supabaseAdmin.from("crm_campaign_sends").select("*", { count: 'exact', head: true })).count,
    // newAccounts
    (await supabaseAdmin.from("crm_Accounts").select("*", { count: 'exact', head: true }).eq("deletedAt", null)).count,
    (await supabaseAdmin.from("crm_Accounts").select("*", { count: 'exact', head: true }).eq("deletedAt", null)).count,
    // contractsExpiring (no direct scope; manager/admin = no-op)
    (await supabaseAdmin.from("crm_Contracts").select("*", { count: 'exact', head: true }).eq("deletedAt", null)).count,
    (await supabaseAdmin.from("crm_Contracts").select("*", { count: 'exact', head: true }).eq("deletedAt", null)).count,
  ]);

  function sumConverted(opps: { budget: unknown; currency: string | null }[]): number {
    let total = new Decimal(0);
    for (const opp of opps) {
      const budget = new Decimal(opp.budget?.toString() ?? "0");
      const from = opp.currency || displayCurrency;
      const converted = convertAmount(budget, from, displayCurrency, rates);
      total = total.add(converted ?? budget);
    }
    return total.toNumber();
  }

  const totalRevenueCurr = sumConverted(revOppsCurr);
  const totalRevenuePrev = sumConverted(revOppsPrev);
  const pipelineCurr = sumConverted(pipeOppsCurr);
  const pipelinePrev = sumConverted(pipeOppsPrev);

  // suppress unused vars
  void tasksCurr;
  void tasksPrev;

  return [
    {
      label: "totalRevenue",
      value: totalRevenueCurr,
      previousValue: totalRevenuePrev,
      changePercent: calcChange(totalRevenueCurr, totalRevenuePrev),
      sparkline: [],
      href: "/reports/sales",
    },
    {
      label: "pipelineValue",
      value: pipelineCurr,
      previousValue: pipelinePrev,
      changePercent: calcChange(pipelineCurr, pipelinePrev),
      sparkline: [],
      href: "/reports/sales",
    },
    {
      label: "newLeads",
      value: leadsCurr,
      previousValue: leadsPrev,
      changePercent: calcChange(leadsCurr, leadsPrev),
      sparkline: [],
      href: "/reports/leads",
    },
    {
      label: "conversionRate",
      value: leadsCurr > 0 ? Math.round((convCurr / leadsCurr) * 100) : 0,
      previousValue: leadsPrev > 0 ? Math.round((convPrev / leadsPrev) * 100) : 0,
      changePercent: calcChange(
        leadsCurr > 0 ? Math.round((convCurr / leadsCurr) * 100) : 0,
        leadsPrev > 0 ? Math.round((convPrev / leadsPrev) * 100) : 0
      ),
      sparkline: [],
      href: "/reports/sales",
    },
    {
      label: "newContacts",
      value: contactsCurr,
      previousValue: contactsPrev,
      changePercent: calcChange(contactsCurr, contactsPrev),
      sparkline: [],
      href: "/reports/leads",
    },
    {
      label: "activeUsers",
      value: usersCurr,
      previousValue: usersPrev,
      changePercent: calcChange(usersCurr, usersPrev),
      sparkline: [],
      href: "/reports/users",
    },
    {
      label: "openTasks",
      value: tasksOpenCurr,
      previousValue: tasksOpenPrev,
      changePercent: calcChange(tasksOpenCurr, tasksOpenPrev),
      sparkline: [],
      href: "/reports/activity",
    },
    {
      label: "campaignsSent",
      value: campaignsCurr,
      previousValue: campaignsPrev,
      changePercent: calcChange(campaignsCurr, campaignsPrev),
      sparkline: [],
      href: "/reports/campaigns",
    },
    {
      label: "newAccounts",
      value: accountsCurr,
      previousValue: accountsPrev,
      changePercent: calcChange(accountsCurr, accountsPrev),
      sparkline: [],
      href: "/reports/accounts",
    },
    {
      label: "contractsExpiring",
      value: contractsCurr,
      previousValue: contractsPrev,
      changePercent: calcChange(contractsCurr, contractsPrev),
      sparkline: [],
      href: "/reports/accounts",
    },
  ];
}

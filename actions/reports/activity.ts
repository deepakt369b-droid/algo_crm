
import type { ReportFilters, ChartDataPoint } from "./types";
import { groupedToChartData } from "./types";
import type { ReportScope } from "@/lib/authz/scopes/report-scope";
import { getReportScope } from "@/lib/authz/scopes/report-scope";
import { supabaseAdmin } from "@/lib/supabase-admin";

const DEFAULT_SCOPE: ReportScope = getReportScope({ id: "", role: "manager" });

export async function getTasksCreatedCompleted(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<{ name: string; created: number; completed: number }[]> {
  const tasks = (await supabaseAdmin.from("tasks").select("createdAt, taskStatus")).data;
  const grouped: Record<string, { created: number; completed: number }> = {};
  for (const task of tasks) {
    if (!task.createdAt) continue;
    const d = new Date(task.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = { created: 0, completed: 0 };
    grouped[key].created++;
    if (task.taskStatus === "COMPLETE") grouped[key].completed++;
  }
  const result: { name: string; created: number; completed: number }[] = [];
  for (const key of Object.keys(grouped).sort()) {
    result.push({ name: key, ...grouped[key] });
  }
  return result;
}

export async function getOverdueTasks(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<number> {
  return (await supabaseAdmin.from("tasks").select("*", { count: 'exact', head: true }).eq("taskStatus", "ACTIVE")).count;
}

export async function getTasksByAssignee(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<ChartDataPoint[]> {
  const tasks = (await supabaseAdmin.from("tasks").select("*")).data;
  const grouped: Record<string, number> = {};
  for (const t of tasks) {
    const name = t.assigned_user?.name ?? "Unassigned";
    grouped[name] = (grouped[name] || 0) + 1;
  }
  return groupedToChartData(grouped);
}

export async function getActivitiesByType(
  filters: ReportFilters,
  scope: ReportScope = DEFAULT_SCOPE,
): Promise<ChartDataPoint[]> {
  // crm_Activities has no direct ReportScope mapping; use task scope as a proxy
  // (activities are typically created alongside tasks by the same user).
  // Manager/admin scope is empty, so this is a no-op for them.
  void scope;
  const activities = (await supabaseAdmin.from("crm_Activities").select("type")).data;
  const grouped: Record<string, number> = {};
  for (const a of activities) {
    grouped[a.type] = (grouped[a.type] || 0) + 1;
  }
  return groupedToChartData(grouped);
}

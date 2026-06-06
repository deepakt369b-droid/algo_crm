import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function SuperAdminOverviewPage() {
  const [usersCount, tenantsCount, templatesCount, activeSubscriptionsCount] = await Promise.all([
    (await supabaseAdmin.from("Users").select("id", { count: "exact", head: true })).count ?? 0,
    (await supabaseAdmin.from("Users").select("tenantId", { count: "exact", head: true }).not("tenantId", "is", null)).count ?? 0,
    (await supabaseAdmin.from("crm_Industry_Templates").select("id", { count: "exact", head: true })).count ?? 0,
    (await supabaseAdmin.from("crm_Tenant_Subscriptions").select("id", { count: "exact", head: true }).eq("status", "active")).count ?? 0,
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenantsCount}</div>
            <p className="text-xs text-muted-foreground">Signed-up workspaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptionsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industry Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templatesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed-up Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

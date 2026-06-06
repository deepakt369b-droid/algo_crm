import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function SuperAdminTenantsPage() {
  const { data: tenants, error } = await supabaseAdmin
    .from("Users")
    .select("id, name, email, role, userStatus, tenantId, created_on")
    .order("created_on", { ascending: false });

  const rows = error ? [] : tenants ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((tenant: any) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name || "Unnamed account"}</TableCell>
                  <TableCell>{tenant.email}</TableCell>
                  <TableCell>{tenant.tenantId || "not assigned"}</TableCell>
                  <TableCell className="capitalize">{tenant.role || "user"}</TableCell>
                  <TableCell>
                    <Badge variant={tenant.userStatus === "ACTIVE" ? "default" : "secondary"}>
                      {tenant.userStatus || "UNKNOWN"}
                    </Badge>
                  </TableCell>
                  <TableCell>{tenant.created_on ? new Date(tenant.created_on).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {error ? "Could not load signed-up accounts." : "No signed-up accounts found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

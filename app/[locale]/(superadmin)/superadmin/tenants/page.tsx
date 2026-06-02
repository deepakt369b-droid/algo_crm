import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function SuperAdminTenantsPage() {
  const tenants: any[] = [];

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
                <TableHead>Slug</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant: any) => (
                <TableRow key={tenant._id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>{tenant.slug}</TableCell>
                  <TableCell className="capitalize">{tenant.plan}</TableCell>
                  <TableCell>
                    <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No tenants found.
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

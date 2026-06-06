import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShoppingCart, ClipboardList, CheckCircle2, Clock, XCircle } from "lucide-react";

import { PurchaseOrdersList } from "./_components/PurchaseOrdersList";
import { getPurchaseOrders } from "@/actions/purchase-orders/get-purchase-orders";
import CrmTableSkeleton from "@/components/skeletons/crm-table-skeleton";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminPurchasePage(props: Props) {
  const params = await props.params;
  const { locale } = params;

  const [totalOrders, draftCount, pendingApprovalCount, approvedCount, orders] = await Promise.all([
    (await supabaseAdmin.from("PurchaseOrders").select("*", { count: 'exact', head: true }).is("deletedAt", null)).count ?? 0,
    (await supabaseAdmin.from("PurchaseOrders").select("*", { count: 'exact', head: true }).is("deletedAt", null).eq("status", "DRAFT")).count ?? 0,
    (await supabaseAdmin.from("PurchaseOrders").select("*", { count: 'exact', head: true }).is("deletedAt", null).eq("status", "PENDING_APPROVAL")).count ?? 0,
    (await supabaseAdmin.from("PurchaseOrders").select("*", { count: 'exact', head: true }).is("deletedAt", null).eq("status", "APPROVED")).count ?? 0,
    getPurchaseOrders(),
  ]);

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: ClipboardList, color: "text-blue-600" },
    { label: "Drafts", value: draftCount, icon: Clock, color: "text-amber-500" },
    { label: "Pending Approval", value: pendingApprovalCount, icon: Clock, color: "text-orange-500" },
    { label: "Approved", value: approvedCount, icon: CheckCircle2, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Purchase Orders
          </h2>
          <p className="text-muted-foreground mt-1">
            Create and manage purchase orders, track approvals, and receive inventory.
          </p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/admin/purchase/new`}>
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Purchase Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="py-8"><CrmTableSkeleton /></div>}>
            <PurchaseOrdersList orders={orders} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Vendors & Suppliers</CardTitle>
                <p className="text-sm text-muted-foreground">Manage vendor accounts and procurement</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${locale}/crm/accounts`}>View All Accounts</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Product Catalog</CardTitle>
                <p className="text-sm text-muted-foreground">Browse products and services for ordering</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${locale}/crm/products`}>View Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


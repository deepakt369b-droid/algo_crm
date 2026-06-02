import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Warehouse, BarChart3, AlertTriangle, TrendingUp, Plus, Layers } from "lucide-react";
import { prismadb } from "@/lib/prisma";
import CrmTableSkeleton from "@/components/skeletons/crm-table-skeleton";
import { WarehousesTab } from "./_components/WarehousesTab";
import { StockTab } from "./_components/StockTab";
import { ReorderTab } from "./_components/ReorderTab";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminInventoryPage(props: Props) {
  const params = await props.params;
  const { locale } = params;

  const [
    totalProducts,
    activeProducts,
    categories,
    servicesCount,
    totalWarehouses,
    lowStockCount,
    totalStockValue,
  ] = await Promise.all([
    prismadb.crm_Products.count({ where: { deletedAt: null } }),
    prismadb.crm_Products.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prismadb.crm_ProductCategories.count({ where: { isActive: true } }),
    prismadb.crm_Products.count({ where: { type: "SERVICE", deletedAt: null } }),
    prismadb.inventoryWarehouse.count({ where: { isActive: true } }),
    prismadb.reorderThreshold.count({
      where: {
        reorderPoint: { gt: 0 },
      },
    }),
    prismadb.inventoryStock.aggregate({
      _sum: { quantity: true },
    }),
  ]);

  // Count actual low stock items by comparing stock vs reorder points
  const thresholdsWithStockData = await prismadb.reorderThreshold.findMany({
    select: {
      id: true,
      reorderPoint: true,
      productId: true,
      warehouseId: true,
    },
  });

  // Get current stock for each threshold
  const stockRecords = await Promise.all(
    thresholdsWithStockData.map((t) =>
      prismadb.inventoryStock.findUnique({
        where: { productId_warehouseId: { productId: t.productId, warehouseId: t.warehouseId } },
        select: { quantity: true },
      }),
    ),
  );

  const actualLowStock = thresholdsWithStockData.filter((t, i) => {
    const stockQty = stockRecords[i] ? Number(stockRecords[i].quantity) : 0;
    return stockQty <= Number(t.reorderPoint);
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Inventory Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Track stock levels across warehouses, manage reorder points, and monitor inventory movements.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/${locale}/crm/products`}>
              <Package className="h-4 w-4 mr-2" />
              Product Catalog
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/purchase`}>
              <Plus className="h-4 w-4 mr-2" />
              Purchase Orders
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWarehouses}</div>
            <p className="text-xs text-muted-foreground">
              Active locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories}</div>
            <p className="text-xs text-muted-foreground">
              {servicesCount} services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${actualLowStock > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${actualLowStock > 0 ? "text-red-500" : ""}`}>
              {actualLowStock}
            </div>
            <p className="text-xs text-muted-foreground">
              Below reorder point
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Inventory Sections */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="warehouses" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Warehouses
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Stock Levels
          </TabsTrigger>
          <TabsTrigger value="reorder" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Reorder Thresholds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Product Catalog</CardTitle>
                    <CardDescription>Manage products, services, and categories</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Add, edit, or archive products and services. Organize by categories and set pricing.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/crm/products">Open Product Catalog</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Stock Overview</CardTitle>
                    <CardDescription>View stock levels across all warehouses</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Monitor inventory quantities, track movements, and set reorder thresholds for each product.
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                  <div className="bg-muted p-2 rounded-lg">
                    <div className="font-bold text-lg">{totalProducts}</div>
                    <div className="text-xs text-muted-foreground">Products</div>
                  </div>
                  <div className="bg-muted p-2 rounded-lg">
                    <div className="font-bold text-lg">{totalWarehouses}</div>
                    <div className="text-xs text-muted-foreground">Warehouses</div>
                  </div>
                  <div className="bg-muted p-2 rounded-lg">
                    <div className="font-bold text-lg">{actualLowStock}</div>
                    <div className="text-xs text-muted-foreground">Low Stock</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-4">
          <Suspense fallback={<CrmTableSkeleton />}>
            <WarehousesTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <Suspense fallback={<CrmTableSkeleton />}>
            <StockTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4">
          <Suspense fallback={<CrmTableSkeleton />}>
            <ReorderTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

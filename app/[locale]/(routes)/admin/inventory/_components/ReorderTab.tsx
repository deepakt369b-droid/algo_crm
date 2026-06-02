"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Bell, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getProductsForSelect } from "@/actions/inventory/get-products-for-select";
import { getWarehouses } from "@/actions/inventory/warehouses/delete-get-warehouses";
import { getReorderThresholds, deleteReorderThreshold, ReorderThresholdItem } from "@/actions/inventory/reorder/delete-get-reorder-thresholds";
import { setReorderThreshold } from "@/actions/inventory/reorder/set-reorder-threshold";
import { useAction } from "@/hooks/use-action";

interface ProductOption {
  id: string;
  name: string;
  sku: string | null;
}

export function ReorderTab() {
  const router = useRouter();
  const [thresholds, setThresholds] = useState<ReorderThresholdItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<ReorderThresholdItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);

  // Form state
  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [minQuantity, setMinQuantity] = useState("0");
  const [maxQuantity, setMaxQuantity] = useState("");
  const [reorderPoint, setReorderPoint] = useState("0");
  const [reorderQuantity, setReorderQuantity] = useState("0");

  const loadData = useCallback(async () => {
    const [thresholdData, productData, whData] = await Promise.all([
      getReorderThresholds(),
      getProductsForSelect(),
      getWarehouses(),
    ]);
    setThresholds(thresholdData);
    setLowStockItems(thresholdData.filter((t) => t.isLowStock));
    setProducts(productData as ProductOption[]);
    setWarehouses(whData as { id: string; name: string; code: string }[]);
    setLoaded(true);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const { execute: executeSet, isLoading: isSetting } = useAction(setReorderThreshold, {
    onSuccess: () => {
      toast({ title: "Reorder threshold set successfully" });
      resetForm();
      loadData();
      router.refresh();
    },
    onError: (error) => {
      toast({ title: "Error", description: error, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setProductId("");
    setWarehouseId("");
    setMinQuantity("0");
    setMaxQuantity("");
    setReorderPoint("0");
    setReorderQuantity("0");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reorder threshold?")) return;
    const result = await deleteReorderThreshold(id);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Threshold deleted" });
      loadData();
      router.refresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSet({
      productId,
      warehouseId,
      minQuantity: parseFloat(minQuantity),
      maxQuantity: maxQuantity ? parseFloat(maxQuantity) : undefined,
      reorderPoint: parseFloat(reorderPoint),
      reorderQuantity: parseFloat(reorderQuantity),
    });
  };

  const filteredThresholds = thresholds.filter(
    (t) =>
      !search ||
      t.productName.toLowerCase().includes(search.toLowerCase()) ||
      t.productSku?.toLowerCase().includes(search.toLowerCase()) ||
      t.warehouseName.toLowerCase().includes(search.toLowerCase())
  );

  if (!loaded) {
    return <div className="text-center py-8 text-muted-foreground">Loading thresholds...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Low Stock Alert */}
      {showLowStock && lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-muted-foreground">
                    Stock: {item.currentStock} / Reorder at: {item.reorderPoint}
                  </span>
                </div>
              ))}
              {lowStockItems.length > 10 && (
                <p className="text-sm text-muted-foreground">...and {lowStockItems.length - 10} more</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reorder Thresholds</h3>
          <p className="text-sm text-muted-foreground">
            Set minimum stock levels and reorder points to automate restocking
            {lowStockItems.length > 0 && (
              <span className="text-red-500 font-medium ml-2">
                ({lowStockItems.length} below threshold)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {lowStockItems.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setShowLowStock(!showLowStock)}>
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              Alerts ({lowStockItems.length})
            </Button>
          )}
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Bell className="h-4 w-4 mr-2" />
              Set Threshold
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Reorder Threshold</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {p.sku ? `(${p.sku})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Warehouse *</Label>
                  <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Min Quantity</Label>
                  <Input type="number" step="0.0001" min="0" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Max Quantity</Label>
                  <Input type="number" step="0.0001" min="0" value={maxQuantity} onChange={(e) => setMaxQuantity(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Reorder Point *</Label>
                  <Input type="number" step="0.0001" min="0" value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Reorder Qty *</Label>
                  <Input type="number" step="0.0001" min="0" value={reorderQuantity} onChange={(e) => setReorderQuantity(e.target.value)} required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
                <Button type="submit" size="sm" disabled={isSetting || !productId || !warehouseId}>
                  {isSetting ? "Saving..." : "Save Threshold"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by product name, SKU, or warehouse..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Thresholds Table */}
      {filteredThresholds.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No thresholds configured. Set reorder points to automate stock monitoring.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Min</TableHead>
                  <TableHead className="text-right">Max</TableHead>
                  <TableHead className="text-right">Reorder Point</TableHead>
                  <TableHead className="text-right">Reorder Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredThresholds.map((t) => (
                  <TableRow key={t.id} className={t.isLowStock ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
                    <TableCell>
                      <div className="font-medium">{t.productName}</div>
                      <div className="text-xs text-muted-foreground">{t.productSku || ""}</div>
                    </TableCell>
                    <TableCell>{t.warehouseName}</TableCell>
                    <TableCell className={`text-right font-mono ${t.isLowStock ? "text-red-600 font-bold" : ""}`}>
                      {t.currentStock}
                    </TableCell>
                    <TableCell className="text-right font-mono">{t.minQuantity}</TableCell>
                    <TableCell className="text-right font-mono">{t.maxQuantity ?? "-"}</TableCell>
                    <TableCell className="text-right font-mono">{t.reorderPoint}</TableCell>
                    <TableCell className="text-right font-mono">{t.reorderQuantity}</TableCell>
                    <TableCell>
                      {t.isLowStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          OK
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

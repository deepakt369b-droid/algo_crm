"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Layers, Search, ArrowUpDown, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getInventoryStock, InventoryStockItem } from "@/actions/inventory/stock/get-inventory-stock";
import { getStockMovements, StockMovementItem } from "@/actions/inventory/stock/get-stock-movements";
import { getWarehouses } from "@/actions/inventory/warehouses/delete-get-warehouses";
import { adjustStock } from "@/actions/inventory/stock/adjust-stock";
import { transferStock } from "@/actions/inventory/stock/transfer-stock";
import { useAction } from "@/hooks/use-action";

export function StockTab() {
  const router = useRouter();
  const [stock, setStock] = useState<InventoryStockItem[]>([]);
  const [movements, setMovements] = useState<StockMovementItem[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"stock" | "movements">("stock");
  const [search, setSearch] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("all");

  // Adjust form state
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustWarehouseId, setAdjustWarehouseId] = useState("");
  const [adjustQuantity, setAdjustQuantity] = useState("0");
  const [adjustNote, setAdjustNote] = useState("");

  // Transfer form state
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferProductId, setTransferProductId] = useState("");
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferQty, setTransferQty] = useState("");
  const [transferNote, setTransferNote] = useState("");

  const loadData = useCallback(async () => {
    const [stockData, movementData, whData] = await Promise.all([
      getInventoryStock(),
      getStockMovements({ limit: 20 }),
      getWarehouses(),
    ]);
    setStock(stockData);
    setMovements(movementData);
    setWarehouses(whData as { id: string; name: string; code: string }[]);
    setLoaded(true);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const { execute: executeAdjust, isLoading: isAdjusting } = useAction(adjustStock, {
    onSuccess: () => {
      toast({ title: "Stock adjusted successfully" });
      setShowAdjust(false);
      loadData();
      router.refresh();
    },
    onError: (error) => {
      toast({ title: "Error", description: error, variant: "destructive" });
    },
  });

  const { execute: executeTransfer, isLoading: isTransferring } = useAction(transferStock, {
    onSuccess: () => {
      toast({ title: "Stock transferred successfully" });
      setShowTransfer(false);
      loadData();
      router.refresh();
    },
    onError: (error) => {
      toast({ title: "Error", description: error, variant: "destructive" });
    },
  });

  const filteredStock = stock.filter((s) => {
    const matchesSearch = !search || s.product?.name.toLowerCase().includes(search.toLowerCase()) || s.product?.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesWh = filterWarehouse === "all" || s.warehouseId === filterWarehouse;
    return matchesSearch && matchesWh;
  });

  const lowStockItems = stock.filter(
    (s) => s.threshold && s.quantity <= s.threshold.reorderPoint
  );

  if (!loaded) {
    return <div className="text-center py-8 text-muted-foreground">Loading stock data...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">
              {lowStockItems.length} product{lowStockItems.length > 1 ? "s" : ""} {" "} below reorder point. Review and restock soon.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button size="sm" variant={activeTab === "stock" ? "default" : "outline"} onClick={() => setActiveTab("stock")}>
          <Layers className="h-4 w-4 mr-2" />
          Stock Levels
        </Button>
        <Button size="sm" variant={activeTab === "movements" ? "default" : "outline"} onClick={() => setActiveTab("movements")}>
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Movements
        </Button>
      </div>

      {activeTab === "stock" && (
        <>
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterWarehouse} onValueChange={setFilterWarehouse}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Reorder Point</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No stock records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStock.map((s) => {
                      const isLow = s.threshold && s.quantity <= s.threshold.reorderPoint;
                      return (
                        <TableRow key={s.id} className={isLow ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
                          <TableCell className="font-medium">{s.product?.name || "Unknown"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{s.product?.sku || "-"}</TableCell>
                          <TableCell>{s.warehouse?.name || "-"}</TableCell>
                          <TableCell className={`text-right font-mono font-medium ${isLow ? "text-red-600" : ""}`}>
                            {s.quantity}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {s.threshold?.reorderPoint ?? "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {isLow ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                In Stock
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setAdjustProductId(s.productId);
                                  setAdjustWarehouseId(s.warehouseId);
                                  setAdjustQuantity(String(s.quantity));
                                  setShowAdjust(true);
                                  setShowTransfer(false);
                                }}
                              >
                                Adjust
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setTransferProductId(s.productId);
                                  setTransferFrom(s.warehouseId);
                                  setTransferQty(String(s.quantity));
                                  setShowTransfer(true);
                                  setShowAdjust(false);
                                }}
                              >
                                Transfer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Adjust Stock Form */}
          {showAdjust && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adjust Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeAdjust({
                      productId: adjustProductId,
                      warehouseId: adjustWarehouseId,
                      newQuantity: parseFloat(adjustQuantity),
                      note: adjustNote || undefined,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Quantity</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={adjustQuantity}
                        onChange={(e) => setAdjustQuantity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Note (optional)</Label>
                      <Input value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} placeholder="Reason for adjustment" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAdjust(false)}>Cancel</Button>
                    <Button type="submit" size="sm" disabled={isAdjusting}>
                      {isAdjusting ? "Adjusting..." : "Save Adjustment"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Transfer Stock Form */}
          {showTransfer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transfer Stock Between Warehouses</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeTransfer({
                      productId: transferProductId,
                      fromWarehouseId: transferFrom,
                      toWarehouseId: transferTo,
                      quantity: parseFloat(transferQty),
                      note: transferNote || undefined,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>From Warehouse</Label>
                      <Select value={transferFrom} onValueChange={setTransferFrom}>
                        <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                        <SelectContent>
                          {warehouses.map((wh) => (
                            <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>To Warehouse</Label>
                      <Select value={transferTo} onValueChange={setTransferTo}>
                        <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                        <SelectContent>
                          {warehouses.map((wh) => (
                            <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        value={transferQty}
                        onChange={(e) => setTransferQty(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Note (optional)</Label>
                    <Textarea value={transferNote} onChange={(e) => setTransferNote(e.target.value)} placeholder="Transfer reason" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowTransfer(false)}>Cancel</Button>
                    <Button type="submit" size="sm" disabled={isTransferring}>
                      {isTransferring ? "Transferring..." : "Transfer Stock"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === "movements" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <ArrowUpDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No movements recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.type === "RECEIVED" || m.type === "TRANSFER_IN" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          m.type === "SHIPPED" || m.type === "TRANSFER_OUT" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          m.type === "ADJUSTMENT" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {m.type.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell>{m.product?.name || "-"}</TableCell>
                      <TableCell>{m.warehouse?.name || "-"}</TableCell>
                      <TableCell className="text-right font-mono">{m.quantity}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{m.reference || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

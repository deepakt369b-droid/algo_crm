"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Building, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createWarehouse } from "@/actions/inventory/warehouses/create-warehouse";
import { updateWarehouse } from "@/actions/inventory/warehouses/update-warehouse";
import { deleteWarehouse, getWarehouses } from "@/actions/inventory/warehouses/delete-get-warehouses";
import { useAction } from "@/hooks/use-action";

interface WarehouseItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  isActive: boolean;
  createdAt: Date;
}

export function WarehousesTab() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [isActive, setIsActive] = useState(true);

  const loadWarehouses = useCallback(async () => {
    const data = await getWarehouses();
    setWarehouses(data as WarehouseItem[]);
    setLoaded(true);
  }, []);

  // Load on mount
  useEffect(() => { loadWarehouses(); }, [loadWarehouses]);

  const { execute: executeCreate, isLoading: isCreating } = useAction(createWarehouse, {
    onSuccess: () => {
      toast({ title: "Warehouse created successfully" });
      resetForm();
      loadWarehouses();
      router.refresh();
    },
    onError: (error) => {
      toast({ title: "Error", description: error, variant: "destructive" });
    },
  });

  const { execute: executeUpdate, isLoading: isUpdating } = useAction(updateWarehouse, {
    onSuccess: () => {
      toast({ title: "Warehouse updated successfully" });
      resetForm();
      loadWarehouses();
      router.refresh();
    },
    onError: (error) => {
      toast({ title: "Error", description: error, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setCode("");
    setDescription("");
    setAddress("");
    setCity("");
    setCountry("");
    setIsActive(true);
  };

  const handleEdit = (w: WarehouseItem) => {
    setEditingId(w.id);
    setName(w.name);
    setCode(w.code);
    setDescription(w.description || "");
    setAddress(w.address || "");
    setCity(w.city || "");
    setCountry(w.country || "");
    setIsActive(w.isActive);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return;
    const result = await deleteWarehouse(id);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Warehouse deleted" });
      loadWarehouses();
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      executeUpdate({ id: editingId, name, code, description: description || undefined, address: address || undefined, city: city || undefined, country: country || undefined, isActive });
    } else {
      executeCreate({ name, code, description: description || undefined, address: address || undefined, city: city || undefined, country: country || undefined, isActive });
    }
  };

  if (!loaded) {
    return <div className="text-center py-8 text-muted-foreground">Loading warehouses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Warehouses</h3>
          <p className="text-sm text-muted-foreground">Manage storage locations and facilities</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>
        )}
      </div>

      {/* Warehouse Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingId ? "Edit Warehouse" : "New Warehouse"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wh-name">Name *</Label>
                  <Input id="wh-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Main Warehouse" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wh-code">Code *</Label>
                  <Input id="wh-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="WH-MAIN" required maxLength={20} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-desc">Description</Label>
                <Textarea id="wh-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wh-address">Address</Label>
                  <Input id="wh-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wh-city">City</Label>
                  <Input id="wh-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wh-country">Country</Label>
                  <Input id="wh-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="USA" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="wh-active" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="wh-active">Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
                <Button type="submit" size="sm" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? "Saving..." : editingId ? "Update Warehouse" : "Create Warehouse"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Warehouses Table */}
      {warehouses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No warehouses yet. Create your first warehouse to start tracking inventory.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-sm font-medium">{w.code}</TableCell>
                    <TableCell>{w.name}</TableCell>
                    <TableCell>
                      {w.city || w.country ? (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {[w.city, w.country].filter(Boolean).join(", ")}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${w.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {w.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(w)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
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

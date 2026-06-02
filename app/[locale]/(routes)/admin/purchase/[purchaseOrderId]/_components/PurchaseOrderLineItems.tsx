"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FormSheet from "@/components/sheets/form-sheet";
import { FormInput } from "@/components/form/form-input";
import { FormTextarea } from "@/components/form/form-textarea";
import { FormSubmit } from "@/components/form/form-submit";
import { useAction } from "@/hooks/use-action";
import { addPurchaseOrderLineItem } from "@/actions/purchase-orders/add-line-item";
import { removePurchaseOrderLineItem } from "@/actions/purchase-orders/remove-line-item";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number | null;
  lineTotal: number;
  receivedQuantity: number;
  sortOrder: number;
  product: { id: string; name: string; sku: string | null } | null;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  unit_price: number;
}

interface PurchaseOrderLineItemsProps {
  purchaseOrderId: string;
  lineItems: LineItem[];
  status: string;
  currency: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  products: Product[];
}

function AddLineItemForm({
  purchaseOrderId,
  products,
}: {
  purchaseOrderId: string;
  products: Product[];
}) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [selectedProductId, setSelectedProductId] = useState("");

  const { execute, fieldErrors, isLoading } = useAction(addPurchaseOrderLineItem, {
    onSuccess: () => {
      toast.success("Line item added");
      closeRef.current?.click();
      setSelectedProductId("");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const onAction = async (formData: FormData) => {
    const description = formData.get("description") as string;
    const quantity = parseFloat(formData.get("quantity") as string) || 1;
    const unitPrice = parseFloat(formData.get("unitPrice") as string) || 0;
    const taxRate = formData.get("taxRate") ? parseFloat(formData.get("taxRate") as string) : undefined;
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

    await execute({
      purchaseOrderId,
      productId: selectedProductId || undefined,
      description,
      quantity,
      unitPrice,
      taxRate,
      sortOrder,
    });
  };

  return (
    <FormSheet
      trigger="Add Line Item"
      title="Add Line Item"
      description="Add a product or custom line item to this purchase order"
      onClose={closeRef}
    >
      <form action={onAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700">
            Product (optional)
          </label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">-- Select a product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.sku ? ` (${p.sku})` : ""}
              </option>
            ))}
          </select>
        </div>

        <FormInput
          id="description"
          label="Description"
          type="text"
          errors={fieldErrors}
          defaultValue={selectedProduct?.name || ""}
          key={`desc-${selectedProductId}`}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            id="quantity"
            label="Quantity"
            type="number"
            errors={fieldErrors}
            defaultValue="1"
            step="any"
          />
          <FormInput
            id="unitPrice"
            label="Unit Price"
            type="number"
            errors={fieldErrors}
            step="0.01"
            defaultValue={selectedProduct ? String(selectedProduct.unit_price) : "0"}
            key={`price-${selectedProductId}`}
          />
        </div>

        <FormInput
          id="taxRate"
          label="Tax Rate (%)"
          type="number"
          errors={fieldErrors}
          step="0.01"
          defaultValue="0"
        />

        <FormSubmit className="w-full">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            "Add Line Item"
          )}
        </FormSubmit>
      </form>
    </FormSheet>
  );
}

export function PurchaseOrderLineItems({
  purchaseOrderId,
  lineItems,
  status,
  currency,
  subtotal,
  taxTotal,
  grandTotal,
  products,
}: PurchaseOrderLineItemsProps) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const isEditable = status === "DRAFT";
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "GBP" ? "£" : currency;

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      const result = await removePurchaseOrderLineItem(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Line item removed");
        router.refresh();
      }
    } finally {
      setRemovingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    `${symbol} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Line Items</CardTitle>
          {isEditable && (
            <AddLineItemForm purchaseOrderId={purchaseOrderId} products={products} />
          )}
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        {lineItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No line items yet.</p>
            {isEditable && (
              <p className="text-sm mt-1">Click &quot;Add Line Item&quot; to add products or services.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {status === "ORDERED" || status === "PARTIALLY_RECEIVED" ? (
                    <TableHead className="text-right">Received</TableHead>
                  ) : null}
                  {isEditable && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground text-xs">{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.description}</p>
                        {item.product && (
                          <p className="text-xs text-muted-foreground">{item.product.name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{item.taxRate ? `${item.taxRate}%` : "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.lineTotal)}</TableCell>
                    {(status === "ORDERED" || status === "PARTIALLY_RECEIVED") && (
                      <TableCell className="text-right">{item.receivedQuantity}</TableCell>
                    )}
                    {isEditable && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={removingId === item.id}
                          onClick={() => handleRemove(item.id)}
                        >
                          {removingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Totals */}
        {lineItems.length > 0 && (
          <div className="mt-4 space-y-1 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax Total</span>
              <span>{formatCurrency(taxTotal)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

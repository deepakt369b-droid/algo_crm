"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useAction } from "@/hooks/use-action";
import { createPurchaseOrder } from "@/actions/purchase-orders/create-purchase-order";

import { FormInput } from "@/components/form/form-input";
import { FormTextarea } from "@/components/form/form-textarea";
import { FormSubmit } from "@/components/form/form-submit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Vendor {
  id: string;
  name: string;
  email: string | null;
  website: string | null;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CreatePurchaseOrderFormProps {
  vendors: Vendor[];
  currencies: Currency[];
}

export function CreatePurchaseOrderForm({ vendors, currencies }: CreatePurchaseOrderFormProps) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);

  const { execute, fieldErrors, isLoading } = useAction(createPurchaseOrder, {
    onSuccess: (data) => {
      toast.success(`Purchase order ${data.orderNumber} created`);
      router.push(`/admin/purchase/${data.id}`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onAction = async (formData: FormData) => {
    const vendorId = formData.get("vendorId") as string;
    const currency = (formData.get("currency") as string) || "EUR";
    const orderDate = (formData.get("orderDate") as string) || undefined;
    const expectedDeliveryDate = (formData.get("expectedDeliveryDate") as string) || undefined;
    const notes = (formData.get("notes") as string) || undefined;
    const termsAndConditions = (formData.get("termsAndConditions") as string) || undefined;

    await execute({
      vendorId,
      currency,
      orderDate,
      expectedDeliveryDate,
      notes,
      termsAndConditions,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={onAction} className="space-y-4">
          {/* Vendor Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Vendor *</label>
            <select
              name="vendorId"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">-- Select a vendor --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}{v.email ? ` (${v.email})` : ""}
                </option>
              ))}
            </select>
            {fieldErrors?.vendorId && (
              <p className="text-sm text-destructive">{fieldErrors.vendorId[0]}</p>
            )}
            {vendors.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No vendors found.{" "}
                <Link href="/crm/accounts" className="text-primary hover:underline">
                  Create an account
                </Link>{" "}
                first.
              </p>
            )}
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <select
              name="currency"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue="EUR"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Date</label>
              <input
                type="date"
                name="orderDate"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expected Delivery Date</label>
              <input
                type="date"
                name="expectedDeliveryDate"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <FormTextarea
            id="notes"
            label="Notes"
            placeholder="Internal notes about this purchase order"
            errors={fieldErrors}
          />

          <FormTextarea
            id="termsAndConditions"
            label="Terms & Conditions"
            placeholder="Payment terms, delivery terms, etc."
            errors={fieldErrors}
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/purchase">Cancel</Link>
            </Button>
            <FormSubmit>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Purchase Order"
              )}
            </FormSubmit>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

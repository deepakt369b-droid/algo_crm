import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getPurchaseOrderById } from "@/actions/purchase-orders/get-purchase-order-by-id";

import { PurchaseOrderHeader } from "./_components/PurchaseOrderHeader";
import { PurchaseOrderLineItems } from "./_components/PurchaseOrderLineItems";
import { PurchaseOrderApprovalWorkflow } from "./_components/PurchaseOrderApprovalWorkflow";
import { serializeDecimalsList } from "@/lib/serialize-decimals";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface PageProps {
  params: Promise<{ purchaseOrderId: string }>;
}

export default async function PurchaseOrderDetailPage({ params }: PageProps) {
  const { purchaseOrderId } = await params;
  const order = await getPurchaseOrderById(purchaseOrderId);

  if (!order) {
    notFound();
  }

  const [products, vendors, currencies] = await Promise.all([
    (await supabaseAdmin.from("crm_Products").select("id, name, sku, unit_price").eq("deletedAt", null).eq("status", "ACTIVE").order("name", { ascending: true })).data,
    (await supabaseAdmin.from("crm_Accounts").select("id, name, email").eq("deletedAt", null).order("name", { ascending: true })).data,
    (await supabaseAdmin.from("currency").select("code, name, symbol").eq("isEnabled", true)).data,
  ]);

  const serializedProducts = serializeDecimalsList(products);

  return (
    <div className="space-y-6 py-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/purchase">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Purchase Orders
          </Link>
        </Button>
      </div>

      {/* Header with status, order number, and actions */}
      <PurchaseOrderHeader order={order} />

      {/* Approval Workflow */}
      <PurchaseOrderApprovalWorkflow
        order={order}
        vendors={vendors.map((v) => ({ id: v.id, name: v.name, email: v.email }))}
        currencies={currencies}
      />

      {/* Line Items */}
      <PurchaseOrderLineItems
        purchaseOrderId={order.id}
        lineItems={order.lineItems}
        status={order.status}
        currency={order.currency}
        subtotal={order.subtotal}
        taxTotal={order.taxTotal}
        grandTotal={order.grandTotal}
        products={serializedProducts.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          name: p.name as string,
          sku: (p.sku as string | null) || null,
          unit_price: typeof p.unit_price === "number" ? p.unit_price : Number(p.unit_price),
        }))}
      />
    </div>
  );
}

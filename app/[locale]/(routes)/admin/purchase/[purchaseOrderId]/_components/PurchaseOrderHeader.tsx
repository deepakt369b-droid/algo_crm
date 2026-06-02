import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, User, Hash } from "lucide-react";
import type { PurchaseOrderDetail } from "@/actions/purchase-orders/get-purchase-order-by-id";

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  PENDING_APPROVAL: "outline",
  APPROVED: "default",
  REJECTED: "destructive",
  ORDERED: "default",
  PARTIALLY_RECEIVED: "secondary",
  RECEIVED: "default",
  CANCELLED: "destructive",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ORDERED: "Ordered",
  PARTIALLY_RECEIVED: "Partially Received",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
};

const currencySymbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

interface PurchaseOrderHeaderProps {
  order: PurchaseOrderDetail;
}

export function PurchaseOrderHeader({ order }: PurchaseOrderHeaderProps) {
  const symbol = currencySymbols[order.currency] || order.currency;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
              <Badge variant={statusVariants[order.status] || "outline"} className="text-sm px-3 py-1">
                {statusLabels[order.status] || order.status}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{symbol}{order.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-muted-foreground">{order.currency}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Vendor</p>
              <p className="font-medium">{order.vendor?.name || "—"}</p>
              {order.vendor?.email && (
                <p className="text-xs text-muted-foreground">{order.vendor.email}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Order Date</p>
              <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Requested By</p>
              <p className="font-medium">{order.requestedByUser?.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Line Items</p>
              <p className="font-medium">{order.lineItems.length} items</p>
            </div>
          </div>
        </div>

        {order.expectedDeliveryDate && (
          <div className="mt-4 pt-4 border-t text-sm">
            <span className="text-muted-foreground">Expected Delivery: </span>
            <span className="font-medium">{new Date(order.expectedDeliveryDate).toLocaleDateString()}</span>
          </div>
        )}

        {order.notes && (
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Notes: </span>
            <span>{order.notes}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Send, CheckCircle2, XCircle, Truck, Package, RotateCcw, Ban } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updatePurchaseOrderStatus } from "@/actions/purchase-orders/update-purchase-order-status";
import type { PurchaseOrderDetail } from "@/actions/purchase-orders/get-purchase-order-by-id";

interface PurchaseOrderApprovalWorkflowProps {
  order: PurchaseOrderDetail;
}

// Define available transitions with labels, icons, and colors
type TransitionConfig = {
  status: string;
  label: string;
  icon: React.ElementType;
  variant: "default" | "secondary" | "destructive" | "outline";
  requiresReason?: boolean;
};

const transitions: Record<string, TransitionConfig[]> = {
  DRAFT: [
    { status: "PENDING_APPROVAL", label: "Submit for Approval", icon: Send, variant: "default" },
    { status: "CANCELLED", label: "Cancel Order", icon: Ban, variant: "destructive" },
  ],
  PENDING_APPROVAL: [
    { status: "APPROVED", label: "Approve", icon: CheckCircle2, variant: "default" },
    { status: "REJECTED", label: "Reject", icon: XCircle, variant: "destructive", requiresReason: true },
    { status: "DRAFT", label: "Return to Draft", icon: RotateCcw, variant: "secondary" },
  ],
  APPROVED: [
    { status: "ORDERED", label: "Mark as Ordered", icon: Truck, variant: "default" },
    { status: "CANCELLED", label: "Cancel Order", icon: Ban, variant: "destructive" },
  ],
  ORDERED: [
    { status: "PARTIALLY_RECEIVED", label: "Partially Received", icon: Package, variant: "secondary" },
    { status: "RECEIVED", label: "Mark as Received", icon: CheckCircle2, variant: "default" },
    { status: "CANCELLED", label: "Cancel Order", icon: Ban, variant: "destructive" },
  ],
  PARTIALLY_RECEIVED: [
    { status: "RECEIVED", label: "Mark as Fully Received", icon: CheckCircle2, variant: "default" },
    { status: "CANCELLED", label: "Cancel Order", icon: Ban, variant: "destructive" },
  ],
  REJECTED: [
    { status: "DRAFT", label: "Revise & Resubmit", icon: RotateCcw, variant: "default" },
  ],
};

export function PurchaseOrderApprovalWorkflow({ order }: PurchaseOrderApprovalWorkflowProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  const availableTransitions = transitions[order.status] || [];

  const handleTransition = async (status: string) => {
    setIsLoading(status);
    try {
      const result = await updatePurchaseOrderStatus({
        id: order.id,
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Purchase order ${status.toLowerCase().replace(/_/g, " ")}`);
        setRejectionReason("");
        setShowRejectionInput(false);
        router.refresh();
      }
    } finally {
      setIsLoading(null);
    }
  };

  if (availableTransitions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Workflow Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {availableTransitions.map((transition) => {
            const Icon = transition.icon;
            const loading = isLoading === transition.status;

            if (transition.requiresReason && showRejectionInput) {
              return (
                <div key={transition.status} className="w-full space-y-2">
                  <Textarea
                    placeholder="Reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={transition.variant}
                      disabled={loading || !rejectionReason.trim()}
                      onClick={() => handleTransition(transition.status)}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Icon className="h-4 w-4 mr-1" />
                      )}
                      {transition.label}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowRejectionInput(false);
                        setRejectionReason("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              );
            }

            if (transition.requiresReason) {
              return (
                <Button
                  key={transition.status}
                  size="sm"
                  variant={transition.variant}
                  onClick={() => setShowRejectionInput(true)}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {transition.label}
                </Button>
              );
            }

            return (
              <Button
                key={transition.status}
                size="sm"
                variant={transition.variant}
                disabled={loading}
                onClick={() => handleTransition(transition.status)}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Icon className="h-4 w-4 mr-1" />
                )}
                {transition.label}
              </Button>
            );
          })}
        </div>

        {/* Show rejection reason if rejected */}
        {order.status === "REJECTED" && order.rejectionReason && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
            <p className="text-sm mt-1">{order.rejectionReason}</p>
          </div>
        )}

        {/* Show approval info if approved */}
        {order.status === "APPROVED" && order.approvedByUser && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
            <p className="text-sm">
              Approved by <span className="font-medium">{order.approvedByUser.name}</span>
              {order.approvedAt && (
                <> on {new Date(order.approvedAt).toLocaleDateString()}</>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

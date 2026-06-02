"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { createSubscription, updateSubscription, deleteSubscription } from "@/actions/superadmin/subscriptions";
import { Plus, Edit2, Trash2, Calendar, DollarSign, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SubscriptionActionsProps {
  tenants: any[];
  editingSubscription?: any;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

export default function SubscriptionActions({
  tenants,
  editingSubscription,
  mode,
  onSuccess,
}: SubscriptionActionsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [tenantId, setTenantId] = useState(editingSubscription?.tenantId || "");
  const [stripeCustomerId, setStripeCustomerId] = useState(editingSubscription?.stripeCustomerId || "manual_cust_" + Math.random().toString(36).substr(2, 9));
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState(editingSubscription?.stripeSubscriptionId || "manual_sub_" + Math.random().toString(36).substr(2, 9));
  const [plan, setPlan] = useState(editingSubscription?.plan || "pro");
  const [status, setStatus] = useState(editingSubscription?.status || "active");
  const [billingCycle, setBillingCycle] = useState(editingSubscription?.billingCycle || "monthly");
  const [amount, setAmount] = useState<number>(editingSubscription?.amount || 29);
  const [currency, setCurrency] = useState(editingSubscription?.currency || "USD");
  
  // Format epoch to standard yyyy-mm-dd
  const getInitialDateString = () => {
    if (editingSubscription?.currentPeriodEnd) {
      const d = new Date(editingSubscription.currentPeriodEnd);
      return d.toISOString().split("T")[0];
    }
    const d = new Date();
    d.setMonth(d.getMonth() + 1); // default 1 month
    return d.toISOString().split("T")[0];
  };
  const [expiryDate, setExpiryDate] = useState(getInitialDateString());

  // Server Actions
  // We don't use useMutation anymore

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      toast.error("Please select a tenant.");
      return;
    }

    setLoading(true);
    try {
      const epochTime = new Date(expiryDate).getTime();
      if (mode === "create") {
        await createSubscription({
          tenantId,
          plan,
          status,
        });
      } else {
        await updateSubscription({
          id: editingSubscription.id,
          plan,
          status,
        });
      }

      toast.success(
        mode === "create"
          ? "Manual subscription provisioned successfully!"
          : "Subscription updated successfully!"
      );
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update subscription.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingSubscription?.id) return;
    if (!confirm("Are you sure you want to cancel and delete this subscription manually?")) return;

    setLoading(true);
    try {
      await deleteSubscription({ id: editingSubscription.id });
      toast.success("Subscription removed successfully.");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="rounded-xl h-10 gap-1.5 bg-primary text-white hover:bg-primary/95 text-xs font-semibold shadow-md active:scale-95 transition-transform">
            <Plus className="w-4 h-4" />
            Provision Subscription
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl border border-border/40 bg-background/95 backdrop-blur-md shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {mode === "create" ? "Provision SaaS Subscription" : "Edit Subscription Settings"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-normal mt-1">
            {mode === "create"
              ? "Manually link a tenant to a paid Stripe plan bypass or register offline billing details."
              : "Alter plans, expiration limits, or purge offline subscription states safely."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Tenant Select */}
          <div className="grid gap-1.5">
            <Label htmlFor="tenant" className="text-xs font-bold">Select Tenant</Label>
            {mode === "create" ? (
              <select
                id="tenant"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full rounded-xl h-10 border border-border/60 bg-background px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              >
                <option value="">-- Choose Tenant --</option>
                {tenants.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} ({t.slug})
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="tenant"
                value={editingSubscription?.tenantName || tenantId}
                disabled
                className="rounded-xl h-10 bg-muted/50 border-border/60 text-xs font-semibold"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Plan Select */}
            <div className="grid gap-1.5">
              <Label htmlFor="plan" className="text-xs font-bold">Plan Tier</Label>
              <select
                id="plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full rounded-xl h-10 border border-border/60 bg-background px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="free">Free</option>
                <option value="pro">Professional</option>
                <option value="premium">Premium Executive</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="grid gap-1.5">
              <Label htmlFor="status" className="text-xs font-bold">Subscription Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl h-10 border border-border/60 bg-background px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="incomplete">Incomplete</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price Amount */}
            <div className="grid gap-1.5">
              <Label htmlFor="amount" className="text-xs font-bold">Billing Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/70" />
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="29"
                  className="rounded-xl h-10 pl-9 border-border/60 text-sm"
                  required
                />
              </div>
            </div>

            {/* Billing Cycle */}
            <div className="grid gap-1.5">
              <Label htmlFor="cycle" className="text-xs font-bold">Billing Cycle</Label>
              <select
                id="cycle"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full rounded-xl h-10 border border-border/60 bg-background px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Currency Select */}
            <div className="grid gap-1.5">
              <Label htmlFor="currency" className="text-xs font-bold">Currency</Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl h-10 border border-border/60 bg-background px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="SAR">SAR (ر.س)</option>
              </select>
            </div>

            {/* Expiration Date */}
            <div className="grid gap-1.5">
              <Label htmlFor="expiry" className="text-xs font-bold">Renewal/Expiration</Label>
              <div className="relative">
                <Input
                  id="expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="rounded-xl h-10 border-border/60 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Stripe Identifiers */}
          <div className="grid gap-4 border-t border-border/40 pt-4 mt-2">
            <div className="grid gap-1.5">
              <Label htmlFor="stripeSub" className="text-xs font-bold text-muted-foreground">Stripe Subscription ID</Label>
              <Input
                id="stripeSub"
                value={stripeSubscriptionId}
                onChange={(e) => setStripeSubscriptionId(e.target.value)}
                className="rounded-xl h-10 border-border/65 text-xs font-mono"
                required
              />
            </div>
          </div>

          <DialogFooter className="flex items-center gap-2 pt-2 border-t border-border/40 mt-4">
            {mode === "edit" && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-xl h-10 text-xs px-4 mr-auto gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-xl h-10 text-xs px-4"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl h-10 text-xs px-4 bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/5">
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

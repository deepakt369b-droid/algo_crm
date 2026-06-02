"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Building2,
  TrendingUp,
  Sparkles,
  Search,
  RefreshCw,
  AlertCircle,
  Calendar,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import SubscriptionActions from "./SubscriptionActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SubscriptionsDashboardProps {
  initialSubscriptions: any[];
  tenants: any[];
}

export default function SubscriptionsDashboard({
  initialSubscriptions,
  tenants,
}: SubscriptionsDashboardProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Local sync refresh helper
  const handleRefresh = () => {
    toast.success("Synchronizing subscription metrics...");
    router.refresh();
  };

  // Calculate MRR and Stats
  const calculateMetrics = () => {
    let totalMRR = 0;
    let activeCount = 0;
    let trialingCount = 0;
    let premiumCount = 0;

    initialSubscriptions.forEach((sub) => {
      const isSubActive = sub.status === "active";
      if (isSubActive) {
        activeCount++;
        // Calculate monthly contribution
        let monthlyContribution = sub.amount || 0;
        if (sub.billingCycle === "annually") {
          monthlyContribution = (sub.amount || 0) / 12;
        }
        totalMRR += monthlyContribution;
      }
      
      if (sub.status === "trialing") {
        trialingCount++;
      }

      if (sub.plan === "premium" && isSubActive) {
        premiumCount++;
      }
    });

    return {
      mrr: Math.round(totalMRR),
      activeCount,
      trialingCount,
      premiumCount,
      totalCount: initialSubscriptions.length,
    };
  };

  const metrics = calculateMetrics();

  // Filter Subscriptions
  const filteredSubscriptions = initialSubscriptions.filter((sub) => {
    const tenantName = (sub.tenantName || "").toLowerCase();
    const tenantSlug = (sub.tenantSlug || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = tenantName.includes(query) || tenantSlug.includes(query) || sub.stripeSubscriptionId.toLowerCase().includes(query);
    const matchesPlan = selectedPlan === "ALL" || sub.plan === selectedPlan;
    const matchesStatus = selectedStatus === "ALL" || sub.status === selectedStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Executive Subscriptions
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor recurring subscription volumes, offline provisioning, and platform MRR details.
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="h-10 w-10 rounded-xl hover:bg-muted border-border/80"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </Button>
          <SubscriptionActions tenants={tenants} mode="create" onSuccess={() => router.refresh()} />
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* MRR Card */}
        <Card className="border border-border/40 bg-gradient-to-br from-background via-background to-primary/5 shadow-md rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Monthly Recurring (MRR)
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              ${metrics.mrr.toLocaleString()}
              <span className="text-xs font-medium text-muted-foreground ml-1">/mo</span>
            </div>
            <p className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              Calculated from {metrics.activeCount} active tenants
            </p>
          </CardContent>
        </Card>

        {/* Active Accounts Card */}
        <Card className="border border-border/40 shadow-md rounded-2xl overflow-hidden relative group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Active SaaS Users
            </CardTitle>
            <Building2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {metrics.activeCount}
              <span className="text-xs text-muted-foreground font-medium ml-1">accounts</span>
            </div>
            <p className="text-[10px] text-muted-foreground/85 mt-1">
              Out of {metrics.totalCount} registered workspace profiles
            </p>
          </CardContent>
        </Card>

        {/* Enterprise Tiers Card */}
        <Card className="border border-border/40 shadow-md rounded-2xl overflow-hidden relative group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Premium Tier
            </CardTitle>
            <CreditCard className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {metrics.premiumCount}
              <span className="text-xs text-muted-foreground font-medium ml-1">tenants</span>
            </div>
            <p className="text-[10px] text-muted-foreground/85 mt-1">
              Premium level high-volume VIP clients
            </p>
          </CardContent>
        </Card>

        {/* Trials / Free Tiers Card */}
        <Card className="border border-border/40 shadow-md rounded-2xl overflow-hidden relative group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Active Trials
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {metrics.trialingCount}
              <span className="text-xs text-muted-foreground font-medium ml-1">trialing</span>
            </div>
            <p className="text-[10px] text-muted-foreground/85 mt-1">
              Onboarding pipeline converting to paid plans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and List */}
      <Card className="border border-border/40 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-lg font-bold">Billing Ledgers</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Search, filter, and modify SaaS subscription records manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Controls */}
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 bg-muted/10">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/75" />
              <Input
                placeholder="Search tenant name, slug, or subscription ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl border-border/60 h-10 text-xs"
              />
            </div>
            {/* Filtering */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 select-none">
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="rounded-xl h-10 border border-border/60 bg-background px-3 text-xs focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
              >
                <option value="ALL">All Plans</option>
                <option value="free">Free Tier</option>
                <option value="pro">Pro Tier</option>
                <option value="premium">Premium Tier</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl h-10 border border-border/60 bg-background px-3 text-xs focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/15">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Tenant Name</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Billing Plan</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Rate & Cycle</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Status</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Renewal Expiry</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider py-4 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => {
                  // Badges configurations
                  const planBadges: any = {
                    free: "bg-slate-500/10 text-slate-600 border-slate-500/20",
                    pro: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                    premium: "bg-purple-500/10 text-purple-600 border-purple-500/20 shadow-sm shadow-purple-500/5",
                  };

                  const statusBadges: any = {
                    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                    trialing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                    canceled: "bg-destructive/10 text-destructive border-destructive/20",
                  };

                  return (
                    <TableRow key={sub.id} className="border-b border-border/30 hover:bg-muted/5 transition-all">
                      <TableCell className="py-4 font-bold text-sm">
                        <span className="text-foreground">{sub.tenantName}</span>
                        <div className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">
                          slug: {sub.tenantSlug}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 select-none">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wide ${planBadges[sub.plan] || "bg-muted text-muted-foreground border-border"}`}>
                          {sub.plan}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-extrabold text-sm text-foreground">
                          {sub.amount ? `${sub.currency === "EUR" ? "€" : sub.currency === "AED" ? "د.إ" : sub.currency === "SAR" ? "ر.س" : "$"}${sub.amount}` : "Free"}
                        </div>
                        <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
                          {sub.billingCycle || "monthly"}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 select-none">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wide ${statusBadges[sub.status] || "bg-muted text-muted-foreground border-border"}`}>
                          {sub.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground/80" />
                          {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <SubscriptionActions
                          tenants={tenants}
                          editingSubscription={sub}
                          mode="edit"
                          onSuccess={() => router.refresh()}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredSubscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground border-none">
                      <HelpCircle className="w-10 h-10 text-muted-foreground/35 mx-auto mb-3" />
                      <p className="font-semibold text-sm">No subscription accounts match the filters.</p>
                      <p className="text-[11px] text-muted-foreground/80 mt-1">Try refining your search terms or provisioning a manual record.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

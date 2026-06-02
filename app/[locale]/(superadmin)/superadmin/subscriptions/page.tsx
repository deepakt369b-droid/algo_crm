import React from "react";
import { getSubscriptions } from "@/actions/superadmin/subscriptions";
import SubscriptionsDashboard from "./_components/SubscriptionsDashboard";

export default async function SuperAdminSubscriptionsPage() {
  const subscriptions = await getSubscriptions();
  const tenants: any[] = []; // Not currently managed by an explicit table, we map subscriptions to tenant objects instead.

  return (
    <div className="space-y-6 max-w-6xl">
      <SubscriptionsDashboard initialSubscriptions={subscriptions} tenants={tenants} />
    </div>
  );
}

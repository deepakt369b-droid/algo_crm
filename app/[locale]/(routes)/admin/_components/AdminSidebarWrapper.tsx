"use client";

import { usePathname } from "next/navigation";
import { AdminSidebarNav } from "./AdminSidebarNav";

export function AdminSidebarWrapper() {
  const pathname = usePathname();

  // Check if current path is inventory or purchase page (ignoring locale prefix)
  const isInventoryOrPurchase =
    pathname.endsWith("/admin/inventory") ||
    pathname.includes("/admin/inventory/") ||
    pathname.endsWith("/admin/purchase") ||
    pathname.includes("/admin/purchase/");

  if (isInventoryOrPurchase) {
    return null;
  }

  return (
    <aside className="w-56 shrink-0 border-r bg-card flex flex-col py-4 px-2">
      <AdminSidebarNav />
    </aside>
  );
}

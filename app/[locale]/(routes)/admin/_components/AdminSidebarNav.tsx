"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Settings, SlidersHorizontal, ClipboardList, Coins, FileText, Package, ShoppingCart, MessageSquare } from "lucide-react";

const navItems = [
  { label: "Users",        href: "/admin/users",        icon: Users },
  { label: "Services",     href: "/admin/services",     icon: Settings },
  { label: "CRM Settings", href: "/admin/crm-settings", icon: SlidersHorizontal },
  { label: "Inventory",    href: "/admin/inventory",    icon: Package },
  { label: "Purchase",     href: "/admin/purchase",     icon: ShoppingCart },
  { label: "Audit Log",    href: "/admin/audit-log",    icon: ClipboardList },
  { label: "Currencies",   href: "/admin/currencies",   icon: Coins },
  { label: "Invoices",     href: "/admin/invoices",     icon: FileText },
  { label: "WhatsApp",     href: "/admin/whatsapp",     icon: MessageSquare },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  // Derive locale from the pathname to avoid hydration mismatches with useParams()
  // This stays consistent across server and client rendering
  const locale = pathname.startsWith("/") ? pathname.split("/")[1] || "en" : "en";

  return (
    <nav className="flex flex-col gap-1">
      <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Admin
      </p>
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = pathname.includes(href);
        const dynamicHref = `/${locale}${href}`;
        return (
          <Link
            key={href}
            href={dynamicHref}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

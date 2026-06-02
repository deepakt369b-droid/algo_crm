"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutDashboard, Building2, CreditCard, LayoutTemplate, Settings, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale || "en";

  const navItems = [
    { title: "Overview", url: `/${locale}/superadmin`, icon: LayoutDashboard },
    { title: "Tenants", url: `/${locale}/superadmin/tenants`, icon: Building2 },
    { title: "Subscriptions", url: `/${locale}/superadmin/subscriptions`, icon: CreditCard },
    { title: "Templates", url: `/${locale}/superadmin/templates`, icon: LayoutTemplate },
    { title: "Feedback", url: `/${locale}/superadmin/feedback`, icon: MessageSquare },
    { title: "Settings", url: `/${locale}/superadmin/settings`, icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/40 pb-2">
        <div className="flex h-14 items-center px-4 font-sans font-black text-lg tracking-tight bg-gradient-to-r from-primary to-purple-600 dark:to-teal-400 bg-clip-text text-transparent">
          Flowline Pro Admin
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-1">
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={cn(
                      "rounded-xl transition-all duration-200 ease-in-out px-3 py-2 h-10",
                      pathname === item.url ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

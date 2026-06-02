"use client";

import * as React from "react";
import { ShieldAlert, Package, ShoppingCart } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTenant } from "@/lib/tenant-context";
import { cn } from "@/lib/utils";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import getDashboardMenuItem from "./menu-items/Dashboard";
import getCrmMenuItem from "./menu-items/Crm";
import getProjectsMenuItem from "./menu-items/Projects";
import getEmailsMenuItem from "./menu-items/Emails";
import getReportsMenuItem from "./menu-items/Reports";
import getDocumentsMenuItem from "./menu-items/Documents";
import getInvoicesMenuItem from "./menu-items/Invoices";
import getAdministrationMenuItem from "./menu-items/Administration";
import getCampaignsMenuItem from "./menu-items/Campaigns";


/**
 * AppSidebar Component - Task Groups 1.2, 2.2-2.7, 3.1, 5.3, 5.4
 *
 * Core sidebar component for Flowline Pro application layout.
 * Implements shadcn/ui sidebar pattern with:
 * - Logo and "N" branding symbol with rotation animation
 * - Build version display in footer (when expanded)
 * - Navigation with Dashboard and module items
 * - Nav-user section in footer for user profile and actions
 *
 * Phase 2 Updates:
 * - Task 2.2: Added Dashboard menu item integration
 * - Task 2.3: Added CRM module navigation (collapsible group with module filtering)
 * - Task 2.4: Added Projects module navigation (simple item with module filtering)
 * - Task 2.5: Added Emails module navigation (simple item with module filtering)
 * - Task 2.6: Added remaining module navigation items (Employees, Reports, Documents, Databox)
 * - Task 2.7: Added Administration menu with role-based visibility (role === "admin")
 * - NavMain component renders all enabled module navigation items
 * - Module filtering ensures only enabled modules appear in navigation
 * - Role-based visibility: Administration only shows for admin users
 *
 * Phase 3 Updates:
 * - Task 3.1: Added NavUser component in SidebarFooter
 * - NavUser displays user avatar, name, email
 * - NavUser provides dropdown with user actions (Profile, Settings, Logout)
 * - NavUser adapts to collapsed/expanded sidebar states
 * - Build version moved above NavUser in footer
 *
 * Phase 5 Updates (Design Consistency):
 * - Task 5.3: Removed duration-200 from app name animation (uses Tailwind default)
 * - Task 5.3: Kept duration-500 on "N" symbol for intentional brand emphasis
 * - Task 5.4: Changed build version text-gray-500 to text-muted-foreground for theme support
 *
 * @param modules - Array of enabled modules from system_Modules_Enabled table
 * @param dict - Localization dictionary for navigation labels
 * @param build - Build number for version display
 * @param session - User session data for role-based navigation and user profile
 */

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  userStatus?: string;
  userLanguage?: string;
  isSuperAdmin?: boolean;
  tenantId?: string | null;
  lastLoginAt?: Date;
}

interface Session {
  user: User;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  dict: any;
  session: Session;
}

export function AppSidebar({
  dict,
  session,
  ...props
}: AppSidebarProps) {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";
  const { features } = useTenant();

  const navItems = [
    getDashboardMenuItem({ title: dict?.dashboard || "Dashboard" }),
    getCrmMenuItem({ localizations: dict.crm, features }),
    getCampaignsMenuItem({
      localizations: {
        title: "Campaigns",
        campaigns: "All Campaigns",
        templates: "Templates",
        targets: "Targets",
        targetLists: "Target Lists",
      },
    }),
    getProjectsMenuItem({ title: dict?.projects || "Projects" }),
    getEmailsMenuItem({ title: dict?.emails || "Emails" }),
    getReportsMenuItem({ title: dict?.reports || "Reports" }),
    getDocumentsMenuItem({ title: dict?.documents || "Documents" }),
    getInvoicesMenuItem({ title: dict?.invoices || "Invoices" }),
  ];

  // Dynamic top-level sidebar items for Inventory and Purchases
  if (features && features.includes("inventory")) {
    navItems.push({
      title: "Inventory",
      url: "/inventory",
      icon: Package,
    } as any);
  }

  if (features && features.includes("purchaseOrders")) {
    navItems.push({
      title: "Purchases",
      url: "/purchase",
      icon: ShoppingCart,
    } as any);
  }

  // Administration: admin users only
  if (session?.user?.role === "admin" || session?.user?.role === "superadmin") {
    navItems.push(
      getAdministrationMenuItem({ title: dict?.settings || "Administration" }),
    );
  }

  // Superadmin dashboard link
  if (session?.user?.role === "superadmin" || session?.user?.isSuperAdmin) {
    navItems.push({
      title: "Superadmin Panel",
      url: "/superadmin",
      icon: ShieldAlert,
      isActive: false,
    } as any);
  }

  // Filter based on user assigned tabs
  const accessibleTabs = (session?.user as any)?.accessibleTabs;
  let finalNavItems = navItems;
  if (accessibleTabs && accessibleTabs.length > 0 && session?.user?.role !== "superadmin") {
    finalNavItems = navItems.filter((item: any) => 
      // Admin and Superadmin Panel should always be visible if role matches, regardless of accessibleTabs (or maybe not?)
      // Let's ensure core system tabs like "Superadmin Panel" bypass this or we just check the title
      accessibleTabs.includes(item.title) || 
      item.title === "Superadmin Panel" || 
      item.title === (dict?.settings || "Administration")
    );
  }

  // Prepare user data for NavUser component
  const userData = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header with Logo and Branding */}
      <SidebarHeader>
        <div
          className={cn(
            "flex items-center py-1",
            isExpanded ? "gap-x-4" : "justify-center",
          )}
        >
          {/* "P" Branding Symbol with rotation animation */}
          <div
            className={cn(
              "flex-shrink-0 bg-gradient-to-tr from-primary to-purple-500 dark:to-teal-400 text-primary-foreground font-sans font-black rounded-2xl w-10 h-10 flex items-center justify-center shadow-md shadow-primary/20 transition-transform duration-500",
              isExpanded && "rotate-[360deg]",
            )}
          >
            P
          </div>

          {/* App Name - visible when expanded, hidden when collapsed */}
          <h1
            className={cn(
              "origin-left font-sans font-extrabold tracking-tight text-xl transition-all overflow-hidden whitespace-nowrap bg-gradient-to-r from-primary to-purple-600 dark:to-teal-400 bg-clip-text text-transparent",
              !isExpanded ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            {process.env.NEXT_PUBLIC_APP_NAME || "Flowline Pro"}
          </h1>
        </div>
      </SidebarHeader>

      {/* Main Content - Navigation */}
      <SidebarContent>
        {/* NavMain component with all enabled module navigation items */}
        <NavMain items={finalNavItems} dict={dict} />
      </SidebarContent>

      {/* Footer with NavUser and Build Version */}
      <SidebarFooter className="border-t border-border/40 pt-3">
        {/* Task 3.1: NavUser component with user profile and actions */}
        <NavUser user={userData} />
      </SidebarFooter>

      {/* Rail for toggling sidebar on desktop */}
      <SidebarRail />
    </Sidebar>
  );
}

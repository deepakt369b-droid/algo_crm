"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

/**
 * NavMain Component - Task Groups 2.1, 5.3
 *
 * Primary navigation component for the sidebar.
 * Features:
 * - Renders navigation items with icons and labels
 * - Supports collapsible groups for module dropdowns
 * - Active state detection using usePathname()
 * - Supports nested navigation items
 *
 * Task 5.3 Updates (Animation Standardization):
 * - Removed custom duration-200 class from ChevronRight icon
 * - Now uses Tailwind default transition duration (150ms)
 * - Maintains smooth rotation animation with shadcn defaults
 *
 * @param items - Array of navigation items (can be simple or grouped)
 * @param dict - Localization dictionary for labels
 */

export interface NavItem {
  title: string
  url?: string
  icon?: LucideIcon
  isActive?: boolean
  items?: NavSubItem[] // For collapsible groups
}

export interface NavSubItem {
  title: string
  url: string
  isActive?: boolean
  exact?: boolean
}

interface NavMainProps {
  items: NavItem[]
  dict?: any
}

export function NavMain({ items, dict }: NavMainProps) {
  const pathname = usePathname()

  // Helper function to check if a route is active
  const isRouteActive = (url: string, exact?: boolean): boolean => {
    if (url === "/" || url === "") {
      return pathname === "/" || pathname === ""
    }
    if (exact) {
      return pathname === url || pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") === url
    }
    return pathname.startsWith(url)
  }

  // Helper to check if any sub-item is active
  const hasActiveChild = (subItems?: NavSubItem[]): boolean => {
    if (!subItems) return false
    return subItems.some((item) => isRouteActive(item.url))
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check if this is a collapsible group with sub-items
          if (item.items && item.items.length > 0) {
            const hasActive = hasActiveChild(item.items)

            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={hasActive}
                className="group/collapsible"
              >
                <SidebarMenuItem className="mb-1">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={hasActive}
                      className={cn(
                        "rounded-xl transition-all duration-200 ease-in-out px-3 py-2 h-10",
                        hasActive ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.icon && <item.icon className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-105", hasActive ? "text-primary" : "text-muted-foreground")} />}
                      <span className="font-medium">{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90 w-4 h-4" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-l border-border/40 ml-4 pl-2 space-y-1 mt-1">
                      {item.items.map((subItem) => {
                        const isActive = isRouteActive(subItem.url, subItem.exact)
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive}
                              className={cn(
                                "rounded-lg transition-all duration-150 px-3 py-1.5 h-8",
                                isActive ? "bg-primary/5 text-primary font-semibold hover:bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          // Simple navigation item (no sub-items)
          if (!item.url) return null
          const isActive = isRouteActive(item.url)
          return (
            <SidebarMenuItem key={item.title} className="mb-1">
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                className={cn(
                  "rounded-xl transition-all duration-200 ease-in-out px-3 py-2 h-10",
                  isActive ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-105", isActive ? "text-primary" : "text-muted-foreground")} />}
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

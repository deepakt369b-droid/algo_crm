"use client"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  BadgeDollarSign,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAvatarContext } from "@/context/avatar-context"

/**
 * NavUser Component - Task Group 3.1
 *
 * User profile section component for sidebar footer.
 * Displays user avatar, name, email, and provides dropdown menu with user actions.
 *
 * Features:
 * - User avatar display with fallback to default image
 * - User name and email display (when sidebar expanded)
 * - Avatar only display (when sidebar collapsed)
 * - Dropdown menu with user actions:
 *   - Todo Dashboard (navigation to /projects/dashboard)
 *   - Sales Dashboard (navigation to /crm/dashboard/{userId})
 *   - Profile Settings (navigation to /profile)
 *   - Logout (signOut action)
 * - Integrates with Zustand store for avatar state management
 * - Reuses logic from existing AvatarDropdown component
 *
 * @param user - User object containing id, name, email, avatar
 */

interface NavUserProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    avatar?: string | null
  }
}

export function NavUser({ user }: NavUserProps) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { avatar } = useAvatarContext()

  // Get avatar URL or fallback to default
  const avatarUrl = avatar || user.avatar || undefined

  // Get user initials for avatar fallback
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-xl h-12"
            >
              <div className="relative flex-shrink-0">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={avatarUrl} alt={user.name || "User"} />
                  <AvatarFallback className="rounded-full bg-primary/10 text-primary font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-background" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl glass-card border border-border/40 shadow-xl p-1.5 backdrop-blur-md bg-background/85 dark:bg-slate-900/90"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                <div className="relative">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage src={avatarUrl} alt={user.name || "User"} />
                    <AvatarFallback className="rounded-full bg-primary/10 text-primary font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-background" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem className="rounded-xl cursor-pointer hover:bg-primary/5 hover:text-primary transition-all duration-150" onClick={() => router.push("/projects/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary" />
              Todo Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-xl cursor-pointer hover:bg-primary/5 hover:text-primary transition-all duration-150"
              onClick={() => router.push(`/crm/dashboard/${user.id}`)}
            >
              <BadgeDollarSign className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary" />
              Sales Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem className="rounded-xl cursor-pointer hover:bg-primary/5 hover:text-primary transition-all duration-150" onClick={() => router.push("/profile")}>
              <Settings className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem className="rounded-xl cursor-pointer text-destructive hover:bg-destructive/5 hover:text-destructive transition-all duration-150" onClick={async () => { await signOut(); window.location.href = "/sign-in"; }}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

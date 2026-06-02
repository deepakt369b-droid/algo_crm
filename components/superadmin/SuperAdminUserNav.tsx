"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  LogOut,
  Settings,
  ArrowLeftRight,
  User,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface SuperAdminUserNavProps {
  locale: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SuperAdminUserNav({ locale, user }: SuperAdminUserNavProps) {
  const router = useRouter();

  // Get user initials for avatar fallback
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      window.location.href = "/sign-in";
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-9 w-9 rounded-full border border-border/60 hover:ring-2 hover:ring-primary/20 transition-all outline-none">
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage src={user.image || undefined} alt={user.name || "Superadmin"} />
            <AvatarFallback className="rounded-full bg-primary/10 text-primary font-bold text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-purple-500 border border-background animate-pulse" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-2xl glass-card border border-border/40 shadow-xl p-1.5 backdrop-blur-md bg-background/85 dark:bg-slate-900/90"
        align="end"
        sideOffset={6}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2.5 py-2 text-left text-sm">
            <div className="relative">
              <Avatar className="h-8 w-8 rounded-full border border-border/20">
                <AvatarImage src={user.image || undefined} alt={user.name || "Superadmin"} />
                <AvatarFallback className="rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-purple-500 border border-background" />
            </div>
            <div className="grid flex-1 text-left text-xs leading-tight ml-1">
              <span className="truncate font-semibold flex items-center gap-1">
                {user.name || "Super Admin"}
                <ShieldCheck className="w-3.5 h-3.5 text-purple-500 fill-purple-500/10" />
              </span>
              <span className="truncate text-[10px] text-muted-foreground/80">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40" />
        <DropdownMenuItem
          className="rounded-xl cursor-pointer hover:bg-primary/5 hover:text-primary transition-all duration-150 text-xs py-2 font-medium"
          onClick={() => router.push(`/${locale}`)}
        >
          <ArrowLeftRight className="mr-2 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
          Switch to Client Portal
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-xl cursor-pointer hover:bg-primary/5 hover:text-primary transition-all duration-150 text-xs py-2 font-medium"
          onClick={() => router.push(`/${locale}/profile`)}
        >
          <Settings className="mr-2 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/40" />
        <DropdownMenuItem
          className="rounded-xl cursor-pointer text-destructive hover:bg-destructive/5 hover:text-destructive transition-all duration-150 text-xs py-2 font-medium"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

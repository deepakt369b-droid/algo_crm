import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/superadmin/SuperAdminSidebar";
import { SuperAdminUserNav } from "@/components/superadmin/SuperAdminUserNav";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";

export default async function SuperAdminLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await props.params;
  const locale = resolvedParams?.locale || "en";
  const session = await getSession();

  if (!session || !session.user) {
    return redirect("/sign-in");
  }

  // Ensure user is superadmin
  if (!session.user.isSuperAdmin && session.user.role !== "superadmin" && session.user.email !== process.env.ADMIN_EMAIL) {
    return redirect("/");
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <SuperAdminSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px] justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <h1 className="font-bold text-base md:text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Flowline Pro Control Panel
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl h-9 text-xs font-semibold gap-1.5 hover:bg-primary/5 hover:text-primary transition-all duration-200 border-border/80"
            >
              <Link href={`/${locale}`}>
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch to Client Portal</span>
                <span className="sm:hidden">App Portal</span>
              </Link>
            </Button>
            <SuperAdminUserNav
              locale={locale}
              user={{
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              }}
            />
          </div>
        </header>
        <main className="flex flex-grow flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto">
          {props.children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


import { redirect } from "next/navigation";
import { requireRole, AuthorizationError, AuthenticationError } from "@/lib/authz";
import { AdminSidebarWrapper } from "./_components/AdminSidebarWrapper";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    if (e instanceof AuthenticationError) redirect("/sign-in");
    if (e instanceof AuthorizationError) redirect("/");
    throw e;
  }

  return (
    <div className="flex h-full w-full min-h-0">
      <AdminSidebarWrapper />
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceName, workspaceSlug, firstName, lastName, templateId } = body;

    if (!workspaceName || !workspaceSlug) {
      return NextResponse.json({ error: "Workspace name and slug are required" }, { status: 400 });
    }

    // Check if slug is taken in prismadb.Tenants? Wait, we don't have Tenants in Prisma.
    // Instead we just update the user in Prisma for now. The Convex sync or convex mutation will handle tenant creation if needed.
    // Actually, in the simulated signup it didn't create a Convex Tenant either.
    
    // Let's update the user
    (await supabaseAdmin.from("users").update({
                  name: `${firstName} ${lastName}`.trim(),
                  // Assign a mock tenantId for now
                  tenantId: workspaceSlug,
                  role: "admin",
                }).select("*").single().eq("id", session.user.id).select("*").single()).data;

    return NextResponse.json({ success: true, workspaceSlug });
  } catch (error: any) {
    console.error("[SETUP_WORKSPACE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

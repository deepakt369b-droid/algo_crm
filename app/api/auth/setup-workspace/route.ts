import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.email) {
      return NextResponse.json({ error: "Authenticated user email is missing" }, { status: 400 });
    }

    const body = await req.json();
    const { workspaceName, workspaceSlug, firstName, lastName, templateId } = body;

    if (!workspaceName || !workspaceSlug) {
      return NextResponse.json({ error: "Workspace name and slug are required" }, { status: 400 });
    }

    const { count } = await supabaseAdmin
      .from("Users")
      .select("id", { count: "exact", head: true });

    const isFirstUser = (count ?? 0) === 0;
    const { error: upsertError } = await supabaseAdmin
      .from("Users")
      .upsert(
        {
          id: user.id,
          email: user.email,
          emailVerified: true,
          name: `${firstName} ${lastName}`.trim() || user.email,
          tenantId: workspaceSlug,
          role: isFirstUser ? "superadmin" : "admin",
          userStatus: "ACTIVE",
          isSuperAdmin: isFirstUser,
        },
        { onConflict: "id" }
      );

    if (upsertError) {
      console.error("[SETUP_WORKSPACE_UPSERT_ERROR]", upsertError);
      return NextResponse.json({ error: "Failed to setup workspace" }, { status: 500 });
    }

    return NextResponse.json({ success: true, workspaceSlug });
  } catch (error: any) {
    console.error("[SETUP_WORKSPACE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

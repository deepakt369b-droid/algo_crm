import { NextRequest, NextResponse } from "next/server";
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function ensureAdmin(): Promise<NextResponse | null> {
  try {
    await requireRole(["admin"]);
    return null;
  } catch (e) {
    if (e instanceof AuthorizationError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (e instanceof AuthenticationError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    throw e;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const denied = await ensureAdmin();
  if (denied) return denied;

  const body = await request.json();
  const taxRate = (await supabaseAdmin.from("invoice_TaxRates").update({
          ...(body.name !== undefined && { name: body.name }),
          ...(body.rate !== undefined && { rate: body.rate }),
          ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
          ...(body.active !== undefined && { active: body.active }),
        }).select("*").single().eq("id", id).select("*").single()).data;

  return NextResponse.json({ data: taxRate });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const denied = await ensureAdmin();
  if (denied) return denied;

  (await supabaseAdmin.from("invoice_TaxRates").delete().select("*").single().eq("id", id).select("*").single()).data;
  return NextResponse.json({ success: true });
}

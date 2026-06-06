import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instanceId, status, phoneNumber } = body;

    if (!instanceId || !status) {
      return NextResponse.json({ error: "Missing required fields: instanceId, status" }, { status: 400 });
    }

    console.log(`[WhatsApp Webhook] Received status update for instance: ${instanceId} -> ${status}`);

    const { error } = await supabaseAdmin
      .from("crm_Whatsapp_Instances")
      .update({
        status,
        ...(phoneNumber ? { phoneNumber } : {}),
      })
      .eq("id", instanceId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[WhatsApp Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

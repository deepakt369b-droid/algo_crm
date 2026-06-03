import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instanceId, status, phoneNumber } = body;

    if (!instanceId || !status) {
      return NextResponse.json({ error: "Missing required fields: instanceId, status" }, { status: 400 });
    }

    console.log(`[WhatsApp Webhook] Received status update for instance: ${instanceId} -> ${status}`);

    // Update instance status in Postgres
    (await supabaseAdmin.from("crm_Whatsapp_Instances").update({
              status,
              ...(phoneNumber ? { phoneNumber } : {}),
            }).eq("id", instanceId).select("*").single()).data;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[WhatsApp Webhook Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

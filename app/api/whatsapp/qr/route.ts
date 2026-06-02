import { NextRequest, NextResponse } from "next/server";
import { WhatsAppClient } from "@/lib/whatsapp/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get("instanceId");

    if (!instanceId) {
      return NextResponse.json({ error: "Missing instanceId query parameter" }, { status: 400 });
    }

    const qrResponse = await WhatsAppClient.getQrCode(instanceId);
    
    if (!qrResponse.success) {
      return NextResponse.json({ error: qrResponse.message || "Failed to generate QR code" }, { status: 500 });
    }

    return NextResponse.json(qrResponse);
  } catch (error: any) {
    console.error("[WhatsApp API Route] QR Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { WhatsAppClient } from "@/lib/whatsapp/client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getTenantId } from "@/lib/get-tenant";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instanceId, to, message } = body;

    if (!instanceId || !to || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant context is required" }, { status: 403 });
    }

    const instance = (await supabaseAdmin
      .from("crm_Whatsapp_Instances")
      .select("*")
      .eq("id", instanceId)
      .eq("tenantId", tenantId)
      .single()).data;
    
    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }

    const connectionConfig = (instance.connectionConfig as any) || {};

    const settings = {
      whatsappOfficialApiUrl: connectionConfig.whatsappOfficialApiUrl,
      whatsappOfficialApiKey: connectionConfig.whatsappOfficialApiKey,
    };

    const sendResponse = await WhatsAppClient.sendMessage(instanceId, { to, message }, settings);
    
    if (!sendResponse.success) {
      return NextResponse.json({ error: sendResponse.error || "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json(sendResponse);
  } catch (error: any) {
    console.error("[WhatsApp API Route] Send Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

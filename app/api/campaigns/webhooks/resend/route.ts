import { NextRequest, NextResponse } from "next/server";

import { createHmac } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

function verifyResendSignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.RESEND_WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", process.env.RESEND_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return signature === `sha256=${expected}`;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("Resend-Signature");

  if (!verifyResendSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as {
    type: string;
    data: { message_id?: string; email_id?: string; created_at: string };
  };

  const messageId = event.data.message_id ?? event.data.email_id;
  if (!messageId) return NextResponse.json({ ok: true });

  const send = (await supabaseAdmin.from("crm_campaign_sends").select("*").eq("resend_message_id", messageId).single()).data;
  if (!send) return NextResponse.json({ ok: true }); // unknown message

  switch (event.type) {
    case "email.delivered":
      if (send.status === "sent") {
        (await supabaseAdmin.from("crm_campaign_sends").update({ status: "delivered" }).eq("id", send.id).select("*").single()).data;
      }
      break;

    case "email.bounced":
      (await supabaseAdmin.from("crm_campaign_sends").update({ status: "bounced", error_message: "Bounced" }).eq("id", send.id).select("*").single()).data;
      break;

    case "email.opened":
      if (!send.opened_at) {
        (await supabaseAdmin.from("crm_campaign_sends").update({ opened_at: new Date() }).eq("id", send.id).select("*").single()).data;
      }
      break;

    case "email.clicked":
      if (!send.clicked_at) {
        (await supabaseAdmin.from("crm_campaign_sends").update({ clicked_at: new Date() }).eq("id", send.id).select("*").single()).data;
      }
      break;
  }

  return NextResponse.json({ ok: true });
}

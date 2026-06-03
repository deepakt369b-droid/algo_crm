import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse("Invalid unsubscribe link.", { status: 400 });
  }

  const send = (await supabaseAdmin.from("crm_campaign_sends").select("*").eq("unsubscribe_token", token).single()).data;

  if (!send) {
    return new NextResponse("Unsubscribe link not found.", { status: 404 });
  }

  if (!send.unsubscribed_at) {
    (await supabaseAdmin.from("crm_campaign_sends").update({ unsubscribed_at: new Date() }).select("*").single().eq("unsubscribe_token", token).select("*").single()).data;
  }

  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:40px">
      <h2>You have been unsubscribed.</h2>
      <p>You will no longer receive emails from this campaign.</p>
    </body></html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}

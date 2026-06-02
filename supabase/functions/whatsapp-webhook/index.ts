import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

export default {
  async fetch(req: Request) {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const body = await req.json();
      const { instanceId, status, phoneNumber } = body;

      if (!instanceId || !status) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: instanceId, status" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      console.log(`[WhatsApp Webhook] Received status update for instance: ${instanceId} -> ${status}`);

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Update instance status in Postgres
      const { error } = await supabase
        .from("crm_Whatsapp_Instances")
        .update({
          status,
          ...(phoneNumber ? { phoneNumber } : {}),
        })
        .eq("id", instanceId);

      if (error) {
        console.error("[WhatsApp Webhook Database Error]:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update database" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("[WhatsApp Webhook Error]:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Internal Server Error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};

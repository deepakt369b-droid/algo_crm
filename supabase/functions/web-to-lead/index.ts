import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

export default {
  async fetch(req: Request) {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const data = await req.json();
      const { tenantId, firstName, lastName, email, phone, company } = data;

      if (!tenantId) {
        return new Response("Tenant ID is required", { status: 400 });
      }
      if (!email && !phone) {
        return new Response("At least email or phone must be provided", { status: 400 });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Create Lead in Supabase
      const { error } = await supabase.from("crm_Leads").insert({
        tenant_id: tenantId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        company,
        // Map any other default fields your DB requires here
      });

      if (error) {
        console.error("[Web-to-Lead DB Error]", error);
        return new Response("Database error", { status: 500 });
      }

      return new Response(
        JSON.stringify({ success: true, message: "Lead captured successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error: any) {
      console.error("[Web-to-Lead Error]", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

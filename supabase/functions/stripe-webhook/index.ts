import "@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^14.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

export default {
  async fetch(req: Request) {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing Stripe signature", { status: 400 });
    }

    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET")!
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const session = event.data.object as any;

    try {
      if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        if (!session?.metadata?.tenantId) {
          return new Response("Tenant ID is required", { status: 400 });
        }

        // Example: Update subscription in Supabase
        // await supabase.from('Tenant').update({ ... }).eq('id', session.metadata.tenantId)
      }

      if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Update the subscription in Supabase
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (err: any) {
      console.error(`Error processing webhook: ${err.message}`);
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  },
};

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://smart-stream-window.lovable.app";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: "price_1TD8aZEVrgzha8RyiPjXx27E",
          quantity: 1,
        },
      ],
      mode: "payment",
      custom_fields: [
        {
          key: "first_name",
          label: { type: "custom", custom: "First name" },
          type: "text",
        },
        {
          key: "last_name",
          label: { type: "custom", custom: "Last name" },
          type: "text",
        },
      ],
      success_url: `${origin}/events/claude-code/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/claude-code`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

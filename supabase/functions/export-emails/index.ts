import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const page = url.searchParams.get("page");

    const expectedToken = Deno.env.get("EXPORT_CSV_TOKEN");
    if (!expectedToken || token !== expectedToken) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!page) {
      return new Response("Missing 'page' parameter", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("email, utm_source, utm_medium, subscribed_at")
      .eq("utm_medium", page)
      .order("subscribed_at", { ascending: false });

    if (error) {
      console.error("DB error:", error);
      return new Response("Database error", { status: 500 });
    }

    const rows = data || [];
    const header = "email,utm_source,utm_medium,subscribed_at";
    const csvRows = rows.map((r: any) =>
      `"${r.email}","${r.utm_source || ""}","${r.utm_medium || ""}","${r.subscribed_at || ""}"`
    );
    const csv = [header, ...csvRows].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${page}-emails.csv"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return new Response("Server error", { status: 500 });
  }
});

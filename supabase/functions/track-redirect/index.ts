import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { path } = await req.json();

    // Validate: path must be a non-empty string
    if (!path || typeof path !== "string") {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize: strip leading slashes from the incoming path segment
    // e.g. "youtube" or "/youtube" -> "youtube"
    const cleanPath = path.replace(/^\/+/, "").toLowerCase().trim();

    if (!cleanPath || cleanPath.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Block any attempt to embed an absolute URL
    // e.g. "https://evil.com", "//evil.com"
    if (/^(https?:)?\/\//i.test(cleanPath) || cleanPath.includes("..")) {
      return new Response(JSON.stringify({ error: "External URLs are not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The destination is always an internal path
    const destination = `/${cleanPath}`;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if record already exists
    const { data: existing } = await supabase
      .from("link_redirects")
      .select("id, visit_count")
      .eq("path", cleanPath)
      .maybeSingle();

    if (existing) {
      // Increment visit count
      await supabase
        .from("link_redirects")
        .update({
          visit_count: existing.visit_count + 1,
          last_visited_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Create new record on first visit
      await supabase.from("link_redirects").insert({
        path: cleanPath,
        destination,
        visit_count: 1,
        last_visited_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ destination }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("track-redirect error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { instruction, currentPage } = await req.json();

    if (!instruction || typeof instruction !== "string" || instruction.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Instruction is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert copywriter and landing page editor. 
The user will give you a landing page's current content and an instruction for how to change it.
You must call the update_landing_page tool with the updated fields.
Only include fields that should change — leave others as-is.
Keep copy punchy, benefit-driven, and conversational. 
Never invent facts. Improve clarity and persuasion based on the instruction.

Current page data:
Title: ${currentPage.title ?? ""}
Headline: ${currentPage.headline ?? ""}
Subheadline: ${currentPage.subheadline ?? ""}
Description: ${currentPage.description ?? ""}
CTA label: ${currentPage.cta_label ?? ""}
SEO title: ${currentPage.seo_title ?? ""}
SEO description: ${currentPage.seo_description ?? ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: instruction.trim().slice(0, 2000) },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "update_landing_page",
              description: "Apply the requested edits to the landing page fields.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Internal title for the page" },
                  headline: { type: "string", description: "Main hero headline" },
                  subheadline: { type: "string", description: "Supporting subheadline beneath the headline" },
                  description: { type: "string", description: "Body copy / description paragraph" },
                  cta_label: { type: "string", description: "Call-to-action button label" },
                  seo_title: { type: "string", description: "SEO <title> tag" },
                  seo_description: { type: "string", description: "SEO meta description" },
                  summary: { type: "string", description: "Brief one-sentence summary of changes made, for display to the user" },
                },
                required: ["summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "update_landing_page" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await response.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI did not return a valid response." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updates = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ updates }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("edit-landing-page error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

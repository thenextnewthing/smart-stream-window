CREATE TABLE public.resource_center_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT DEFAULT 'Resource',
  thumbnail_url TEXT,
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.resource_center_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible resources"
ON public.resource_center_items
FOR SELECT
USING (is_visible = true);

CREATE POLICY "Authenticated users can view all resources"
ON public.resource_center_items
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert resources"
ON public.resource_center_items
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update resources"
ON public.resource_center_items
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete resources"
ON public.resource_center_items
FOR DELETE
TO authenticated
USING (true);

CREATE TRIGGER update_resource_center_items_updated_at
BEFORE UPDATE ON public.resource_center_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing resources
INSERT INTO public.resource_center_items (title, description, tag, thumbnail_url, links, display_order) VALUES
(
  'The Larry Agent',
  'The TikTok AI agent that got 2.3M+ views. Get the bot and the video walkthrough.',
  'AI Agent',
  NULL,
  '[{"label":"Video Walkthrough","url":"https://www.youtube.com/watch?v=O7ft9o-zbps"},{"label":"Larry Bot on ClawHub","url":"https://clawhub.ai/OllieWazza/larry"}]'::jsonb,
  1
),
(
  'Eric''s Video Creation SOP',
  'The exact standard operating procedure for creating high-performing video content.',
  'SOP',
  NULL,
  '[{"label":"Open SOP Document","url":"https://docs.google.com/document/d/1t41ddoUGIeCCMbM5pMXCu7OT9O7DgttxmseMStQHGts/edit?tab=t.0"}]'::jsonb,
  2
),
(
  'Paperclip AI Setup Guide',
  'Everything you need to get started with Paperclip — install guide, tips, and Cathryn''s pro tricks.',
  'Dev Tool',
  NULL,
  '[{"label":"Paperclip Website","url":"https://paperclip.ing"},{"label":"Helpful Article","url":"https://x.com/NickSpisak_/status/2033518072724705437"},{"label":"What You Can Build","url":"https://x.com/NickSpisak_/status/2034635430700679445"},{"label":"Follow Cathryn on X","url":"https://x.com/cathrynlavery"}]'::jsonb,
  3
),
(
  'How Agent Companies Are Built',
  'Research on YC W26 vs FeltSense clones, plus a deep dive into agent-built companies.',
  'Research',
  NULL,
  '[{"label":"YC W26 vs FeltSense Clones","url":"https://n.thenextnewthing.ai/yc-w26-vs-feltsense"},{"label":"Agent-built Companies","url":"https://n.thenextnewthing.ai/Agent-Built-Companies-Featured-on-The-Next-New-Thing-335940d92a1f80de82e1f7ae2acc12cd"}]'::jsonb,
  4
);
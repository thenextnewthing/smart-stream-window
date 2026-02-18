
-- Create link_redirects table
CREATE TABLE public.link_redirects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL UNIQUE,
  destination text NOT NULL,
  visit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_visited_at timestamptz
);

-- Enable RLS — no public access at all
ALTER TABLE public.link_redirects ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_link_redirects_path ON public.link_redirects (path);
CREATE INDEX idx_link_redirects_visit_count ON public.link_redirects (visit_count DESC);

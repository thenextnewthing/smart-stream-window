CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_path_created ON public.page_views(page_path, created_at DESC);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Authenticated users can view page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (true);
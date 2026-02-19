-- Allow anyone to read published landing pages (for live public URLs)
CREATE POLICY "Anyone can view published landing pages"
ON public.landing_pages
FOR SELECT
USING (is_published = true);

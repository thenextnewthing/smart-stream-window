
-- Add soft-delete column
ALTER TABLE public.landing_pages ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Update public SELECT policy to exclude soft-deleted pages
DROP POLICY "Anyone can view published landing pages" ON public.landing_pages;
CREATE POLICY "Anyone can view published landing pages"
  ON public.landing_pages
  FOR SELECT
  USING (is_published = true AND deleted_at IS NULL);

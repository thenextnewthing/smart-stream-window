-- Add hero image support to landing pages
ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS hero_image_url text;

-- Storage bucket for landing page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing-page-images', 'landing-page-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public can read landing page images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'landing-page-images');

-- Authenticated upload
CREATE POLICY "Authenticated users can upload landing page images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'landing-page-images' AND auth.role() = 'authenticated');

-- Authenticated delete
CREATE POLICY "Authenticated users can delete landing page images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'landing-page-images' AND auth.role() = 'authenticated');

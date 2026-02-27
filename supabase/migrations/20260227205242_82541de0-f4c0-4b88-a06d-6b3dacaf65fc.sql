-- Create storage bucket for lead magnet files
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-magnet-files', 'lead-magnet-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload lead magnet files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lead-magnet-files' AND auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update lead magnet files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lead-magnet-files' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete lead magnet files"
ON storage.objects FOR DELETE
USING (bucket_id = 'lead-magnet-files' AND auth.role() = 'authenticated');

-- Public read access
CREATE POLICY "Public can read lead magnet files"
ON storage.objects FOR SELECT
USING (bucket_id = 'lead-magnet-files');
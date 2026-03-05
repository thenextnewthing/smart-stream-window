
ALTER TABLE public.link_redirects 
  ADD COLUMN redirect_type text NOT NULL DEFAULT '302';

ALTER TABLE public.link_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert redirects"
  ON public.link_redirects FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update redirects"
  ON public.link_redirects FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete redirects"
  ON public.link_redirects FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Anyone can read redirects"
  ON public.link_redirects FOR SELECT
  USING (true);

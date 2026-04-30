
CREATE OR REPLACE FUNCTION public.increment_view_count(page_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE landing_pages
  SET view_count = view_count + 1
  WHERE id = page_id;
$$;

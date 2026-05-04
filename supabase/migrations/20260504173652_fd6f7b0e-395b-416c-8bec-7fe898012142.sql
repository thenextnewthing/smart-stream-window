
-- Backfill submission_count from newsletter_subscribers matched by utm_medium = slug
UPDATE landing_pages lp
SET submission_count = COALESCE(c.cnt, 0)
FROM (
  SELECT utm_medium AS slug, COUNT(*) AS cnt
  FROM newsletter_subscribers
  WHERE utm_medium IS NOT NULL
  GROUP BY utm_medium
) c
WHERE lp.slug = c.slug;

-- Trigger to keep submission_count in sync going forward
CREATE OR REPLACE FUNCTION public.sync_landing_page_submission_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE landing_pages SET submission_count = submission_count + 1
    WHERE slug = NEW.utm_medium;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE landing_pages SET submission_count = GREATEST(submission_count - 1, 0)
    WHERE slug = OLD.utm_medium;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_submission_count_ins ON public.newsletter_subscribers;
CREATE TRIGGER trg_sync_submission_count_ins
AFTER INSERT ON public.newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION public.sync_landing_page_submission_count();

DROP TRIGGER IF EXISTS trg_sync_submission_count_del ON public.newsletter_subscribers;
CREATE TRIGGER trg_sync_submission_count_del
AFTER DELETE ON public.newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION public.sync_landing_page_submission_count();

CREATE TABLE public.event_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  goals text,
  event_slug text NOT NULL DEFAULT 'claude-code'
);

ALTER TABLE public.event_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist" ON public.event_waitlist
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Authenticated users can view waitlist" ON public.event_waitlist
  FOR SELECT TO authenticated USING (true);
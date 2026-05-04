CREATE TABLE public.resource_intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  response TEXT,
  page_path TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.resource_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit resource intents"
ON public.resource_intents FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Authenticated users can view resource intents"
ON public.resource_intents FOR SELECT
TO authenticated
USING (true);

CREATE INDEX idx_resource_intents_created_at ON public.resource_intents(created_at DESC);
-- Create a table for newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  utm_source TEXT,
  utm_medium TEXT
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view subscribers (for admin purposes)
CREATE POLICY "Authenticated users can view subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (true);
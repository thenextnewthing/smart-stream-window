

## Plan: Switch to 302 Redirects + Add Redirect Creator in Admin

### 1. Add `redirect_type` column to `link_redirects` table
- Add column `redirect_type text not null default '302'` to support future flexibility
- Add `destination` as a user-editable field (currently auto-generated from path)

### 2. Update the `track-redirect` edge function
- Instead of always constructing destination from path, look up the existing record first
- If found, use the stored destination; increment visit count
- If not found, return 404 (redirects are now explicitly created, not auto-created)
- Return `redirect_type` alongside `destination`

### 3. Update `LinkRedirect.tsx` (the `/l/*` handler)
- Replace the iframe approach with a **302 redirect**: when the edge function returns a destination, do `window.location.replace(destination)` instead of rendering an iframe
- Remove the `ALLOWED_ORIGIN` restriction since destinations can now be any URL

### 4. Add "New Redirect" form in Admin Tracked Links tab
- Add a "New redirect" button (matching the Landing Pages pattern)
- Form fields:
  - **Base URL** (read-only, non-editable): `yourdomain.com/l/`
  - **Slug** (editable input): the path segment
  - **Destination URL** (editable input): full URL to redirect to
- On save, insert into `link_redirects` table via Supabase client
- Add RLS policy allowing authenticated users to insert/update/delete `link_redirects`

### 5. Make existing redirects editable
- Add edit/delete actions to each row in the tracked links table so destination can be changed later

### Database migration
```sql
ALTER TABLE public.link_redirects 
  ADD COLUMN redirect_type text NOT NULL DEFAULT '302';

-- RLS policies for authenticated management
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

ALTER TABLE public.link_redirects ENABLE ROW LEVEL SECURITY;
```

### Files changed
- `supabase/functions/track-redirect/index.ts` — lookup existing record, return destination + type, no auto-create
- `src/pages/LinkRedirect.tsx` — replace iframe with `window.location.replace()`
- `src/pages/Admin.tsx` — add create/edit/delete UI for redirects in Tracked Links tab


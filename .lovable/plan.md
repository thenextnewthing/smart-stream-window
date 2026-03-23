

## Restore `/l/` prefix for landing pages

### Problem
Landing pages currently serve at `/:slug` (root level). Per branding conventions, they should be at `/l/slug` (e.g., `/l/paperclip-data`).

The `/l/*` route currently only handles tracked link redirects (`link_redirects` table). We need it to also serve landing pages, or split the two.

### Plan

1. **Add a new route `/l/:slug`** in `App.tsx` that renders `LandingPageView` — placed before the `/l/*` redirect catch-all so exact slugs are matched first against landing pages.

2. **Update route order** in `App.tsx`:
   - `/l/:slug` → `LandingPageView` (tries landing_pages table)
   - `/l/*` → `LinkRedirect` (tries link_redirects table)
   - Keep `/:slug` → `LandingPageView` as a fallback so existing root-level links still work

3. **Similarly for events**: Add `/l/events/:slug` → `EventLandingPageView` if event pages should also be under `/l/`.

4. **Update the admin create/edit forms** — ensure the slug preview shows `/l/` prefix so new pages are created with the correct URL expectation.

### Technical details
- No database changes needed — slugs stay the same in the `landing_pages` table
- Both `/l/paperclip-data` and `/paperclip-data` will work (backward compatible)
- The `/l/*` wildcard for redirects will only fire if no landing page matches the slug first


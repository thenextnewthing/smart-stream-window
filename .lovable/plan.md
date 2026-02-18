
# URL Redirect Service with Analytics Dashboard

## What This Builds

A link shortener / cloaking service at `/l/<path>` that:
- Loads the destination page inside a full-screen iframe (address bar stays as `/l/<path>`)
- Auto-creates a record in the database the first time a link is used
- Tracks every visit
- Only permits destinations that are pages within your own site
- Exposes a password-protected admin dashboard at `/admin` to review all links and visit counts

---

## How It Works (User Flow)

```text
You share:   smart-stream-window.lovable.app/l/youtube
Visitor sees: smart-stream-window.lovable.app/l/youtube  (URL never changes)
Iframe shows: the /youtube page content
Database:     visit count for /youtube increments by 1
```

You never need to "register" a link. Just share `/l/<any-path>` and the system handles the rest.

---

## Security Rules

- Only paths that begin with `/` and stay within the same site are allowed (e.g., `/youtube`, `/studio`).
- External URLs (e.g., `google.com`, another Lovable app) are blocked at the frontend — the iframe will refuse to load them and the record will not be created.
- Visit counts are stored in your private database and are only readable by authenticated users (you, when logged in to `/admin`).
- The admin dashboard is protected by email/password authentication — no public access.

---

## Technical Implementation

### 1. Database — new `link_redirects` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `path` | text | The path after `/l/`, e.g. `youtube` |
| `destination` | text | The internal path, e.g. `/youtube` |
| `visit_count` | integer | Incremented on every visit |
| `created_at` | timestamptz | When first used |
| `last_visited_at` | timestamptz | Updated on each visit |

RLS policies:
- **No public SELECT, INSERT, UPDATE, DELETE** from the browser client.
- All reads/writes go through a backend function using the service role key, keeping data fully private.

### 2. Backend Function — `track-redirect`

A new edge function at `supabase/functions/track-redirect/index.ts`:
- Receives `{ path }` (e.g. `"youtube"`)
- Validates: destination must start with `/` and not be an absolute URL to another site
- Upserts the record in `link_redirects`
- Increments `visit_count` using `visit_count + 1`
- Returns `{ destination }` to the frontend
- Uses service role key so it bypasses RLS safely

### 3. Frontend — Redirect Page (`/l/*`)

New file `src/pages/LinkRedirect.tsx`:
- Reads the wildcard portion of the URL (e.g. from `/l/youtube`, extracts `youtube`)
- Calls the `track-redirect` edge function
- Validates the returned destination is an internal path
- Renders a full-screen `<iframe>` exactly like `CalebInterview.tsx` does — this keeps the address bar showing the `/l/...` URL
- Shows a brief loading state while the function responds
- Shows a friendly error if the destination is invalid or blocked

Route added to `App.tsx`:
```
/l/*  →  <LinkRedirect />
```

### 4. Authentication — Login Page (`/login`)

New file `src/pages/Login.tsx`:
- Simple email + password form using Supabase Auth
- On success, redirects to `/admin`
- No public sign-up — only you will use this

### 5. Admin Dashboard (`/admin`)

New file `src/pages/Admin.tsx`:
- Protected route: if not logged in, redirects to `/login`
- Fetches all records from `link_redirects` via a separate edge function (`get-redirects`) that uses the service role
- Displays a clean table: Link Path | Destination | Visit Count | Last Visited | Created
- Includes a logout button
- Sorted by visit count descending by default

### 6. Edge Function — `get-redirects`

New file `supabase/functions/get-redirects/index.ts`:
- Validates the request includes a valid Supabase auth JWT
- Returns all rows from `link_redirects` sorted by visit count
- Uses service role to read the data

---

## File Changes Summary

| File | Action |
|---|---|
| `supabase/migrations/...` | New migration: `link_redirects` table with RLS |
| `supabase/functions/track-redirect/index.ts` | New edge function |
| `supabase/functions/get-redirects/index.ts` | New edge function |
| `src/pages/LinkRedirect.tsx` | New page (iframe cloaking + tracking) |
| `src/pages/Login.tsx` | New login page for admin access |
| `src/pages/Admin.tsx` | New protected admin dashboard |
| `src/App.tsx` | Add `/l/*`, `/login`, `/admin` routes |

---

## Important Note on Iframe Cloaking

The iframe approach (same as your existing `/caleb-interview` page) works perfectly for internal pages on the same domain. External sites cannot be iframed this way — which is exactly the security behavior you want. Any attempt to cloak an off-site URL will simply fail to load in the iframe and will be blocked by the validation logic before it even gets that far.

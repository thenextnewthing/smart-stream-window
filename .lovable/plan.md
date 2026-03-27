

## Safe Cleanup — Zero-Risk Fixes

Two small, isolated changes that won't affect any existing pages or links.

### 1. Remove duplicate route in App.tsx
Line 54 (`/events/:slug`) is an exact duplicate of line 53. Only the first match ever runs in React Router, so the second is dead code. Remove it.

### 2. Fix display URL in LandingPageChatLayout.tsx
The component currently shows `thenextnew.thing/{slug}` to visitors. Update it to `thenextnew.thing/l/{slug}` so the displayed URL matches the actual canonical URL structure.

### Files modified
- `src/App.tsx` — delete one line (the duplicate route)
- `src/components/LandingPageChatLayout.tsx` — update the `displayUrl` string to include `/l/`




## Update utm_medium for paperclip-data landing page

### What
Set `utm_medium = 'cathryn-paperclip-data'` on the `paperclip-data` landing page record. No code changes needed — the existing flow already passes `utm_medium` through to Beehiiv.

### Steps
1. Run a database UPDATE on `landing_pages` to set `utm_medium = 'cathryn-paperclip-data'` where `slug = 'paperclip-data'`

### Why no code changes
- `LandingPageView` already fetches `utm_medium` from the database
- `LandingPageChatLayout` already receives it as a prop
- The email form already passes it to the `subscribe-beehiiv` edge function
- The edge function already sends it to Beehiiv


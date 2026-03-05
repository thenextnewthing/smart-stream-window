

# Simplified Landing Page Creator with Inline Vibe Coding

## What You'll Get

A streamlined landing page creation experience: when you click "New Page" from the admin dashboard, you'll see the full landing page preview taking up the whole screen, with a floating text box at the bottom where you describe what you want. Type something like "Create a page about AI tools for startups with a bold headline" and watch the page update right in front of you.

## How It Works

1. **New Page Flow**: Clicking "New Page" on the admin creates a blank landing page in the database and immediately opens the new simplified editor.

2. **Full-Screen Preview + Floating Input**: Instead of the current split-panel editor with form fields on the left, the entire screen shows the live landing page preview. A compact floating bar sits at the bottom (like a chat input) where you type your instructions.

3. **Vibe Code It**: Type what you want, hit enter, and the AI updates the page content. The preview refreshes instantly so you see exactly what visitors will see.

4. **Minimal Chrome**: Just a small top bar with the page title, a back button, and publish/draft toggle. Everything else is the preview.

## What Changes

- **New file: `src/pages/LandingPageCreator.tsx`** -- A new simplified page that shows the landing page preview full-screen with a floating vibe-coding input at the bottom. Includes a minimal header (back button, title, publish toggle). Uses the same `edit-landing-page` edge function that already exists.

- **`src/pages/Admin.tsx`** -- Update the "New Page" button flow: after creating the blank page in the database, navigate to the new creator page instead of just adding it to the list.

- **`src/App.tsx`** -- Add a route for the new creator page (e.g., `/admin/create/:id`).

## Technical Details

- The creator page reuses the existing `edit-landing-page` edge function for AI edits -- no backend changes needed.
- The preview component renders the same layout as `LandingPageView` (headline, subheadline, description, hero image, CTA) so what you see is what visitors get.
- The floating input uses the same AI flow as the current editor: send instruction + current page data to the edge function, get back field updates, apply them to the preview and save to the database.
- The existing `LandingPageEditor` (split-panel with form fields) remains available for fine-grained manual editing -- accessible from the admin table's edit button.
- A simple title/slug dialog still appears first when creating, then you land on the full-screen creator.


# Specification

## Summary
**Goal:** Add a Pages entry point in primary navigation and provide a Create Page flow accessible from Groups.

**Planned changes:**
- Add a new bottom navigation item labeled “Pages” next to “Groups” that routes to `/pages`, including active/inactive tab styling consistent with existing tabs.
- Update the Groups page header to include a “Create Page” button beside “Create Group” that routes to `/pages/create`, with responsive layout that remains usable on mobile.
- Add a new Pages listing screen at `/pages` (may be placeholder/empty state) and a Create Page screen at `/pages/create` with a form containing: Page Name (required), Category (Politics / News / Business / Community / Public Figure), Description, Profile Image upload, Cover Image upload, Visibility (Public / Private), and a Verification request toggle.
- Implement basic client-side validation for Page Name and show English validation feedback; on successful submit, show an English message/toast noting the create flow is not yet persisted (no backend).

**User-visible outcome:** Users can tap a new “Pages” tab to open a Pages screen, and can start creating a Page via a “Create Page” button from the Groups header, filling out a validated form that confirms submission is not yet saved.

# Specification

## Summary
**Goal:** Adjust navigation so Profile is accessible from the header when logged in, keep Logout in Settings, and add a new Reel section to the bottom navigation.

**Planned changes:**
- Update the authenticated-state header primary button to show “Profile” and navigate to `/profile`, while keeping “Login” behavior unchanged when logged out.
- Ensure “Logout” remains available only inside the header Settings (gear) dropdown and continues to fully log the user out (including clearing cached client data).
- Add a new bottom navigation item labeled “Reel” immediately after “Video”, plus a new `/reel` route and a placeholder Reel page indicating the feed is coming soon.

**User-visible outcome:** Logged-in users see a “Profile” button in the header that opens their profile page, Logout is found under Settings, and a new “Reel” tab appears after “Video” leading to a coming-soon Reel page.

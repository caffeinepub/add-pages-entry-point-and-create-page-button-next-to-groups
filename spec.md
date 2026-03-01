# Specification

## Summary
**Goal:** Fix actor binding errors so that post, poll, group, and page creation flows work correctly without errors in the CivWorld app.

**Planned changes:**
- Audit and fix actor initialization in `useQueries.ts` hooks so all mutations wait for a valid actor before executing, showing a loading state if the actor is not yet ready
- Fix post creation flow across `CreatePostCard`, `QuickPostBar`, `CreateGroupPostModal`, and `SharePage` so new posts are created successfully and appear in the feed
- Fix poll creation flow in `CreatePollPage` and related modals so new polls are created successfully and appear in `PollsPage`
- Fix group creation flow in `CreateGroupPage` and `CreateGroupModal` so new groups are created successfully and appear in `GroupsPage`/`CommunitiesPage`
- Fix page creation flow in `CreatePagePage` so new community pages are created successfully and appear in `PagesPage`/`CommunitiesPage`
- Replace all raw actor/canister error strings shown in the UI with user-friendly messages via `backendErrors.ts`, displayed as dismissible toasts or inline form errors
- Verify and align the Motoko backend actor's `createPost`, `createPoll`, `createGroup`, and `createPage` method signatures to match the frontend Candid interface

**User-visible outcome:** Authenticated users can successfully create posts, polls, groups, and pages without seeing actor errors. Any backend errors are shown as friendly, dismissible messages instead of raw technical strings.

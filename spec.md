# CivWorld

## Current State
CivWorld is a civic discussion web platform on Internet Computer. The app has a working header with an App/Wallet toggle, bottom nav (Home, Videos/Reels, Civic Feed, Communities), and a post feed. There are two issues:

1. **Logo not visible**: The header references `/assets/generated/civworld-app-icon.dim_1024x1024.png`. The image exists but is not rendering (likely because the build pipeline does not detect it as used since the path is a hardcoded string, so the image gets pruned during build).
2. **Posts created but not visible**: After creating a post, `queryClient.invalidateQueries({ queryKey: ["posts"] })` is called, but the feed does not update. The `useGetPosts` hook only fetches when `!!actor && !actorFetching`. There may be a race condition where the query is not re-enabled or the cache stale time blocks refetch.

## Requested Changes (Diff)

### Add
- Inline logo image import in Header.tsx so it is bundled and survives the build pipeline image pruning
- Optimistic update in `useCreatePost` mutation so the new post appears immediately in the feed

### Modify
- Header.tsx: Change logo `<img src="...">` to use a bundled import instead of a public path string
- useQueries.ts `useCreatePost`: Add `onMutate` for optimistic update, and ensure `invalidateQueries` properly triggers a refetch by also calling `refetchQueries`
- HomePage.tsx: Listen for `postCreated` custom event and manually invalidate/refetch posts query

### Remove
- Nothing removed

## Implementation Plan
1. Import the civworld logo image directly in Header.tsx using ES module import so Vite bundles it (prevents build-time pruning of the asset)
2. In `useCreatePost` mutation's `onSuccess`, additionally call `queryClient.refetchQueries({ queryKey: ["posts"] })` to force an immediate re-fetch after invalidation
3. In HomePage.tsx, add a `useEffect` that listens to the `postCreated` custom event and calls `queryClient.invalidateQueries` + `queryClient.refetchQueries` on the posts key so the feed refreshes immediately after posting
4. Validate and deploy

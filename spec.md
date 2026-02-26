# Specification

## Summary
**Goal:** Fix the comment section in CivWorld by implementing full backend persistence and a complete frontend comment UI with add, reply, like, edit, and delete functionality.

**Planned changes:**
- Define a `Comment` data type in the backend with fields for id, postId, authorId, content, timestamps, parentCommentId (for nesting), likes array, and isDeleted flag; store in stable storage
- Implement backend functions: `addComment`, `getCommentsByPost`, `editComment`, `deleteComment` (soft delete), `likeComment`, and `getCommentLikeCount`; enforce author-only edit/delete and require authenticated callers
- Add React Query hooks in `useQueries.ts`: `useGetCommentsByPost`, `useMutationAddComment`, `useMutationEditComment`, `useMutationDeleteComment`, `useMutationLikeComment`; all mutations invalidate the comments query on success
- Create a `CommentSection.tsx` component displaying comments with author avatar, username, relative timestamp, nested replies (indented), like button with count, inline reply/edit inputs, loading spinner on submit, success/error toasts, and a three-dot context menu (Edit/Delete for authors, Report for others)
- Integrate `CommentSection` into `PostCard.tsx` as a collapsible section toggled by a Comment button, passing the post's id as `postId`; hidden by default to avoid unnecessary backend calls

**User-visible outcome:** Users can open a comment section on any post, add top-level comments or nested replies, like comments, and edit or delete their own comments — all persisted to the backend and reflected instantly without a page refresh.

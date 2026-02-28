# Specification

## Summary
**Goal:** Fix the comment Edit/Delete dropdown menu being clipped or cut off in CommentSection.tsx so it is always fully visible on screen.

**Planned changes:**
- Update the comment action dropdown menu in `CommentSection.tsx` to use a portal-based rendering approach or fixed/absolute positioning that respects viewport boundaries
- Ensure the dropdown flips upward when there is insufficient space below the trigger button
- Remove any ancestor `overflow:hidden` constraints that clip the dropdown
- Apply the fix consistently for both top-level comments and nested replies

**User-visible outcome:** The Edit and Delete options in the comment dropdown menu are fully visible for every comment, regardless of its position on screen or nesting level, with no clipping or cut-off.

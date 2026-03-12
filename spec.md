# CivWorld

## Current State

CivWorld is a civic engagement platform built on ICP with React (frontend) and Motoko (backend). It has a basic notification system: a `Notification` type with `notificationId`, `recipient`, `notificationType`, `message`, `timestamp`, `isRead`, `relatedPost`, and `relatedGroup`. Notifications are stored in a `Map<Principal, List<Notification>>`. There is no dedicated notifications page, no bell icon UI, and no notification filtering by category or location. The Header component has no notification bell. Notifications are not triggered automatically when civic events occur.

## Requested Changes (Diff)

### Add

**Backend:**
- Extended `Notification` type with additional fields: `category` (civic_issue | poll | leader_update | community | announcement), `title`, `locationTarget` (optional location scope: country/state/district/mpConstituency/mlaConstituency/mandal/village), and `senderPrincipal` (optional)
- `CivicNotification` type that extends the base notification with the new fields
- Backend functions:
  - `createCivicNotification(title, message, category, locationTarget)` — callable by admins or verified leaders
  - `broadcastNotification(title, message, category, locationTarget)` — sends to all users whose stored location matches the target
  - `triggerNotificationForEvent(eventType, title, message, locationTarget)` — internal helper triggered when polls are created, civic issues reported, leader posts published, discussions started, or announcements posted
  - `getCivicNotifications(category?: text)` — returns caller's notifications, optionally filtered by category
  - `getUnreadCivicNotificationCount()` — returns count of unread notifications for caller
  - `markCivicNotificationRead(notificationId)` — marks a specific notification as read
  - `markAllCivicNotificationsRead()` — marks all as read for caller
- Location-based targeting: when a notification is created with a `locationTarget`, only users whose profile location matches are added as recipients
- Wire notification triggers into existing `createPoll`, `reportLocalIssue`, `createPoliticalDiscussion` backend calls

**Frontend:**
- `NotificationsPage` — dedicated page at `/notifications` with:
  - Full list of civic notifications in reverse chronological order
  - Filter tabs: All | Civic Issues | Polls | Leader Updates | Community | Announcements
  - Each notification card: icon (by type), title, message, relative timestamp ("2 minutes ago"), unread dot indicator
  - Mark all as read button
- `NotificationBell` component in Header:
  - Bell icon with red badge showing unread count (hidden when 0)
  - Dropdown popover showing latest 5–10 notifications
  - "View all" link to `/notifications`
  - Auto-polls every 30 seconds for unread count
- `NotificationCard` — reusable card component used in both dropdown and page

### Modify

- `Header.tsx` — add `NotificationBell` component between admin shield icon and profile icon
- `App.tsx` — add `/notifications` route pointing to `NotificationsPage`
- `BottomNav.tsx` — optionally surface notification count badge on a nav item (if notifications nav entry exists)
- Existing `createPoll`, `reportLocalIssue`, `createPoliticalDiscussion` backend functions — add notification trigger calls after successful creation

### Remove

- Nothing removed; this fully extends the existing system

## Implementation Plan

1. Update Motoko backend:
   - Add `CivicNotification` type with `category`, `title`, `locationTarget`, `senderPrincipal`
   - Add `civicNotifications` map and `civicNotificationCounter`
   - Add `createCivicNotification`, `broadcastNotification`, `getCivicNotifications`, `getUnreadCivicNotificationCount`, `markCivicNotificationRead`, `markAllCivicNotificationsRead` public functions
   - Add internal `triggerCivicNotification` helper
   - Wire triggers into `createPoll`, `reportLocalIssue`, `createPoliticalDiscussion`
   - Admins and verified leaders can call `createCivicNotification`

2. Build frontend:
   - `NotificationBell` component: bell icon, red badge, dropdown popover (last 10), "View all" link, 30s polling
   - `NotificationsPage`: filterable list, notification cards with type icons, relative timestamps, mark-all-read
   - Wire into `Header.tsx` and `App.tsx` routing
   - Use CivWorld blue/white theme, lucide-react icons for notification types

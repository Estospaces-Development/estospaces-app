# EstoSpaces Notifications System Setup

This document explains how to set up and use the notifications system in EstoSpaces.

## Database Setup

### 1. Run the SQL Schema

Execute the SQL schema in your Supabase database:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase_notifications_schema.sql`
5. Click **Run** to execute

This will create:
- `notifications` table for storing notifications
- `notification_preferences` table for user preferences
- Row Level Security (RLS) policies
- Automatic timestamps
- Real-time subscriptions

### 2. Verify Setup

Run this query to verify the tables were created:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'notification_preferences');
```

## Features

### Notification Types

The system supports the following notification types:

| Type | Description |
|------|-------------|
| `viewing_booked` | When a user books a property viewing |
| `viewing_confirmed` | When a viewing is confirmed |
| `viewing_cancelled` | When a viewing is cancelled |
| `appointment_reminder` | Reminder before a viewing |
| `application_submitted` | When an application is submitted |
| `application_approved` | When an application is approved |
| `application_rejected` | When an application is rejected |
| `documents_requested` | When documents are requested |
| `property_saved` | When a property is saved |
| `price_drop` | Price drop on saved property |
| `message_received` | New message received |
| `ticket_response` | Support ticket response |
| `document_verified` | Document verified |
| `profile_verified` | Profile verified |
| `payment_reminder` | Payment reminder |
| `system` | System announcements |

### User Routes

- **Notification Bell** - Header dropdown for quick access
- **Full Notifications Page** - `/user/dashboard/notifications`
- **Settings Page** - `/user/dashboard/settings` (notification preferences)

### Real-time Updates

Notifications are delivered in real-time using Supabase Realtime subscriptions. New notifications appear instantly in the dropdown without page refresh.

## Frontend Components

### Files Modified/Created

| File | Purpose |
|------|---------|
| `src/pages/DashboardNotifications.tsx` | Full notifications page |
| `src/pages/DashboardSettings.jsx` | Enhanced with notification preferences |
| `src/services/notificationsService.ts` | Service for creating notifications |
| `src/contexts/NotificationsContext.jsx` | Context with expanded notification types |
| `src/components/Dashboard/NotificationDropdown.jsx` | Header dropdown (already existed) |

### Usage in Code

#### Creating a notification from any component:

```javascript
import { notifyViewingBooked } from '../services/notificationsService';

// When user books a viewing
await notifyViewingBooked(
  userId,
  'Beautiful 2 Bed Apartment',
  propertyId,
  'Mon, 15 Jan 2026',
  '10:00 AM'
);
```

#### Using the notifications context:

```javascript
import { useNotifications } from '../contexts/NotificationsContext';

const { 
  notifications, 
  unreadCount, 
  markAsRead, 
  markAllAsRead,
  deleteNotification 
} = useNotifications();
```

## Notification Preferences

Users can configure:

### Email Notifications
- Viewing updates
- Application updates
- Message notifications
- Price alerts
- Property recommendations
- Marketing emails

### Push Notifications
- Viewing updates
- Application updates
- Messages
- Price alerts

### SMS Notifications
- Viewing reminders
- Urgent updates

### Quiet Hours
- Enable/disable
- Custom start and end times

## Extending the System

### Adding a New Notification Type

1. Add the type to `NOTIFICATION_TYPES` in:
   - `src/contexts/NotificationsContext.jsx`
   - `src/services/notificationsService.ts`

2. Create a helper function in `notificationsService.ts`:

```typescript
export async function notifyNewType(
  userId: string,
  // ... parameters
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.NEW_TYPE,
    title: 'Notification Title',
    message: 'Notification message...',
    data: { /* optional data */ },
  });
}
```

3. Update the icon/color mappings in:
   - `src/components/Dashboard/NotificationDropdown.jsx`
   - `src/pages/DashboardNotifications.tsx`

## Troubleshooting

### Notifications not appearing

1. Check if the `notifications` table exists
2. Verify RLS policies are correctly applied
3. Check browser console for errors
4. Ensure the user is logged in

### Real-time not working

1. Ensure Supabase Realtime is enabled
2. Run: `ALTER PUBLICATION supabase_realtime ADD TABLE notifications;`
3. Check if the channel subscription is active in the console

### Preferences not saving

1. Verify `notification_preferences` table exists
2. Check if RLS policies allow the user to update their preferences
3. Look for errors in the network tab

## Security

- All notifications are protected by Row Level Security
- Users can only see/modify their own notifications
- Service role can manage all notifications for system-generated ones
- Sensitive data should not be stored in notification messages

# PRD: Notifications and Reminders System

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2025-11-15
**Owner:** Product Team

---

## Executive Summary

Currently, multiple services store reminder preferences (habits, calendar) but no unified notification delivery system exists. This PRD proposes a centralized Notification Service that handles all app notifications across features, with support for in-app, browser push, and email delivery channels.

---

## Current State Analysis

### ✅ Partial Implementations
- **Habits:** `reminder_enabled`, `reminder_time` fields exist
- **Calendar EventForm:** Reminder selector UI (non-functional)
- **Frontend:** Notification bell icon in header (placeholder)
- **Badge counts:** Implemented for tasks, habits

### ❌ Missing
- No notification service or database
- No notification delivery mechanism
- No notification center UI
- No push notification support
- No email notification support
- No notification preferences management

---

## Goals & Success Metrics

### Primary Goals
1. Create centralized notification service for all app features
2. Implement reliable multi-channel delivery (in-app, push, email)
3. Build notification center UI with history
4. Support scheduled, recurring, and real-time notifications
5. Provide granular user preferences for notification types

### Success Metrics
| Metric | Target |
|--------|--------|
| Notification Delivery Rate | ≥ 95% on-time |
| Latency (scheduled → delivered) | < 1 minute |
| User Opt-In Rate (push) | ≥ 40% |
| Email Open Rate | ≥ 25% |
| Notification Click-Through Rate | ≥ 30% |
| Unsubscribe Rate | < 5% |

---

## Detailed Requirements

### Phase 1: Core Notification Service (P0 - Critical)

#### 1.1 Notification Database Schema
**Priority:** P0
**Effort:** 2 days

**Tables:**
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,  -- habit_reminder, task_due, calendar_reminder, etc.
  priority VARCHAR(20) DEFAULT 'normal',  -- high, normal, low
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),    -- Deep link to relevant page
  action_label VARCHAR(50),   -- e.g., "View Task", "Complete Habit"

  -- Related entities
  related_entity_type VARCHAR(50),  -- task, habit, calendar_event, achievement, etc.
  related_entity_id INTEGER,

  -- Scheduling
  scheduled_time TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  dismissed_at TIMESTAMP,
  clicked_at TIMESTAMP,

  -- Delivery
  delivery_channels VARCHAR(50)[] DEFAULT ARRAY['in_app'],  -- in_app, push, email
  delivery_status JSONB,  -- { in_app: 'sent', push: 'delivered', email: 'failed' }

  -- Metadata
  metadata JSONB,  -- Additional data per notification type
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_notifications (user_id, scheduled_time),
  INDEX idx_pending (sent_at) WHERE sent_at IS NULL,
  INDEX idx_unread (user_id, read_at) WHERE read_at IS NULL
);

CREATE TABLE notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,

  -- Global settings
  enabled BOOLEAN DEFAULT true,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Channel preferences
  in_app_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT false,
  email_frequency VARCHAR(20) DEFAULT 'immediate',  -- immediate, daily_digest, weekly_digest

  -- Type-specific preferences (JSONB for flexibility)
  type_preferences JSONB DEFAULT '{
    "habit_reminder": { "enabled": true, "channels": ["in_app", "push"] },
    "task_due": { "enabled": true, "channels": ["in_app", "push"], "advance_notice": ["1h", "1d"] },
    "calendar_reminder": { "enabled": true, "channels": ["in_app", "push", "email"] },
    "streak_warning": { "enabled": true, "channels": ["in_app", "push"] },
    "achievement": { "enabled": true, "channels": ["in_app"] },
    "insight": { "enabled": true, "channels": ["in_app"] },
    "mood_reminder": { "enabled": true, "channels": ["in_app"] },
    "journal_prompt": { "enabled": false, "channels": ["in_app"] }
  }'::JSONB,

  -- Push subscription (Web Push API)
  push_subscription JSONB,  -- { endpoint, keys: { p256dh, auth } }

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### 1.2 Core Notification Endpoints
**Priority:** P0
**Effort:** 4 days

**Endpoints:**

```typescript
// Create notification (internal API, used by other services)
POST /notifications
Request: {
  user_id: string
  type: string
  priority?: 'high' | 'normal' | 'low'
  title: string
  message: string
  action_url?: string
  action_label?: string
  related_entity_type?: string
  related_entity_id?: number
  scheduled_time: string
  delivery_channels?: string[]
  metadata?: any
}
Response: { notification: Notification }

// Get user notifications (paginated)
GET /notifications?status=<status>&type=<type>&limit=<n>&offset=<n>
Status: all | unread | read | dismissed
Response: {
  notifications: Notification[]
  total: number
  unread_count: number
}

// Mark as read
PUT /notifications/:id/read
PUT /notifications/mark-all-read

// Dismiss notification
PUT /notifications/:id/dismiss

// Delete notification
DELETE /notifications/:id

// Get unread count (for badge)
GET /notifications/unread-count
Response: { count: number }
```

**Notification Preferences:**
```typescript
GET /notifications/preferences
PUT /notifications/preferences
Request: Partial<NotificationPreferences>

// Register push subscription
POST /notifications/push/subscribe
Request: { subscription: PushSubscription }

// Unregister push subscription
DELETE /notifications/push/unsubscribe
```

---

#### 1.3 Notification Delivery Engine
**Priority:** P0
**Effort:** 5 days

**Cron Job: Notification Processor**
- Runs every minute
- Queries `notifications` where `sent_at IS NULL AND scheduled_time <= NOW()`
- Respects quiet hours (per user timezone)
- Delivers via enabled channels
- Updates `delivery_status` and `sent_at`
- Retry failed deliveries (3 attempts, exponential backoff)

**Delivery Channels:**

**1. In-App Notifications:**
- Store in database (already covered)
- WebSocket real-time push (optional, see Phase 2)
- Polling fallback (every 30 seconds when app active)

**2. Browser Push Notifications:**
- Web Push API implementation
- Service Worker for receiving push when tab closed
- Payload includes title, body, icon, data (action_url)
- Click opens app and navigates to action_url
- Libraries: `web-push` (Node.js), `workbox` (Service Worker)

**Implementation:**
```typescript
// Backend push sender
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:support@executivedysfunctioncenter.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPushNotification(subscription: PushSubscription, notification: Notification) {
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.message,
    icon: '/logo192.png',
    badge: '/badge-72x72.png',
    data: {
      url: notification.action_url,
      notification_id: notification.id
    }
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return { success: true };
  } catch (error) {
    if (error.statusCode === 410) {
      // Subscription expired, remove it
      await removeSubscription(subscription);
    }
    return { success: false, error };
  }
}
```

**Frontend Service Worker** (`/frontend/public/service-worker.js`):
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: data.data
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

**3. Email Notifications:**
- SendGrid or Mailgun integration
- HTML email templates (responsive)
- Unsubscribe link in footer (required by law)
- Email frequency options (immediate, daily digest, weekly digest)

**Email Types:**
- **Immediate:** Send on notification creation (reminders, urgent alerts)
- **Daily Digest:** Aggregate all day's notifications, send at preferred time (e.g., 8am)
- **Weekly Digest:** Weekly summary, send Mondays

**Templates:**
- Habit reminder
- Task due reminder
- Calendar event reminder
- Achievement unlocked
- Weekly summary
- Streak warning

**Implementation:**
```typescript
import sgMail from '@sendgrid/mail';

async function sendEmail(user: User, notification: Notification) {
  const msg = {
    to: user.email,
    from: 'notifications@executivedysfunctioncenter.com',
    subject: notification.title,
    html: renderEmailTemplate(notification.type, {
      title: notification.title,
      message: notification.message,
      action_url: notification.action_url,
      action_label: notification.action_label,
      unsubscribe_url: `${BASE_URL}/settings/notifications?unsubscribe=${notification.type}`
    })
  };

  await sgMail.send(msg);
}
```

---

### Phase 2: Feature Integration (P0 - Critical)

#### 2.1 Habit Reminder Notifications
**Priority:** P0
**Effort:** 2 days

**Implementation:**
- Query habits where `reminder_enabled = true`
- Filter by `schedule_pattern` and `scheduled_days` (only remind on scheduled days)
- Check if completion logged today (skip if already done)
- Create notification at `reminder_time` (adjusted for user timezone)

**Notification:**
```typescript
{
  type: 'habit_reminder',
  title: 'Time to log: {habit_name}',
  message: 'You have a {current_streak} day streak!',
  action_url: '/habits',
  related_entity_type: 'habit',
  related_entity_id: habit.id,
  scheduled_time: calculateReminderTime(habit.reminder_time, user.timezone),
  delivery_channels: user preferences
}
```

**Cron Job:** Daily at midnight, generate next day's habit reminders

---

#### 2.2 Task Due Notifications
**Priority:** P0
**Effort:** 2 days

**Notification Types:**
- **24 hours before due:** "Task '{title}' is due tomorrow"
- **1 hour before due:** "Task '{title}' is due in 1 hour"
- **Overdue:** "Task '{title}' is overdue" (daily reminder)

**Implementation:**
- Query tasks with `due_date` set and not completed
- Calculate notification times
- Create notifications with appropriate advance notice

---

#### 2.3 Calendar Event Reminders
**Priority:** P0
**Effort:** 2 days

**Implementation:**
- Use `reminder_minutes` array on calendar events (see Calendar PRD)
- Generate notification for each reminder time
- Example: `[15, 60]` → notifications at 15 min and 1 hour before event

---

#### 2.4 Streak Warning Notifications
**Priority:** P1
**Effort:** 1 day

**Use Case:** Alert user before streak breaks

**Logic:**
- Check habits with `current_streak >= 3` and not completed today
- Send notification 2 hours before End of Day time
- Message: "Your {habit_name} streak is at risk! Complete before {end_of_day_time}"

---

#### 2.5 Achievement Notifications
**Priority:** P1
**Effort:** 1 day

**Triggered by:** Achievement unlock events (see Habits PRD)

**Example:**
```typescript
{
  type: 'achievement',
  priority: 'high',
  title: '🎉 Achievement Unlocked!',
  message: 'Week Warrior - You maintained a 7-day streak!',
  action_url: '/achievements',
  related_entity_type: 'achievement',
  related_entity_id: achievement.id,
  scheduled_time: NOW(),
  delivery_channels: ['in_app', 'push']
}
```

---

### Phase 3: Notification Center UI (P0 - Critical)

#### 3.1 Notification Center Component
**Priority:** P0
**Effort:** 4 days

**Location:** Click bell icon in header

**Features:**
- Dropdown panel (desktop) or full-screen modal (mobile)
- List of recent notifications (last 50)
- Badge count on bell icon
- Tabs: All | Unread | Read
- Mark as read/unread
- Dismiss individual notifications
- Clear all notifications
- "Mark all as read" button
- Notification grouping by date (Today, Yesterday, This Week, Older)
- Empty state: "You're all caught up!"

**Notification Item:**
- Icon (based on type)
- Title
- Message (truncated to 2 lines)
- Timestamp (relative: "5 min ago", "2 hours ago")
- Action button (if action_url exists)
- Read/unread indicator (dot or background color)
- Dismiss X button

**Real-time Updates:**
- Polling: Every 30 seconds when app active
- WebSocket (Phase 4): Instant push

---

#### 3.2 Notification Preferences UI
**Priority:** P0
**Effort:** 3 days

**Location:** `/settings/notifications`

**Sections:**

**1. Global Settings:**
- Enable/disable all notifications toggle
- Quiet hours toggle + time range picker
- Timezone selector

**2. Delivery Channels:**
- In-app toggle (always enabled)
- Browser push toggle + permission request button
- Email toggle + frequency selector (immediate, daily, weekly)

**3. Notification Types:**
- List all notification types (habit reminders, task due, calendar, achievements, etc.)
- Per-type enable/disable toggle
- Per-type channel selection (checkboxes: in-app, push, email)
- Advanced options (e.g., task reminder advance notice: 1h, 24h)

**4. Test Notifications:**
- "Send Test Notification" button to verify delivery

---

### Phase 4: Advanced Features (P2 - Medium Priority)

#### 4.1 WebSocket Real-Time Notifications
**Priority:** P2
**Effort:** 5 days

**Use Case:** Instant notification delivery without polling

**Implementation:**
- WebSocket server endpoint: `wss://api.com/notifications/ws`
- Client connects on app load
- Server pushes notification payloads in real-time
- Client updates notification center instantly
- Fallback to polling if WebSocket fails

---

#### 4.2 Notification Snooze
**Priority:** P2
**Effort:** 2 days

**Use Case:** Delay notification reminder

**UI:** Snooze options (15 min, 30 min, 1 hour, 3 hours, tomorrow)

**Implementation:**
- Update `scheduled_time` to future time
- Reset `sent_at` to null
- Notification reappears after snooze period

---

#### 4.3 Notification Templates & Customization
**Priority:** P2
**Effort:** 3 days

**Use Case:** Users customize notification messages

**Implementation:**
- Template system with variables: `{habit_name}`, `{streak}`, `{due_date}`
- Default templates provided
- User can edit templates in settings
- Preview before saving

---

#### 4.4 Smart Notification Batching
**Priority:** P2
**Effort:** 4 days

**Use Case:** Reduce notification spam

**Logic:**
- Group similar notifications (e.g., 3 tasks due today → "3 tasks due today")
- Delay low-priority notifications to batch with others
- ML-based notification timing (send when user typically active)

---

#### 4.5 Notification Analytics
**Priority:** P3
**Effort:** 3 days

**Dashboard:**
- Notifications sent vs delivered vs clicked
- Open rates by type
- Best time of day for engagement
- Channel effectiveness (push vs email)
- User preferences trends

---

## Technical Architecture

### Database
- `notifications` table
- `notification_preferences` table
- Indexes for performance (user_id, scheduled_time, status)

### API
- 12 new endpoints
- WebSocket endpoint (Phase 4)
- Integration hooks from all services

### Frontend
- Notification Center component
- Preferences UI
- Service Worker for push
- WebSocket client (Phase 4)

### Infrastructure
- Cron job for notification processing
- Email service (SendGrid/Mailgun)
- Web Push API integration
- VAPID keys for push
- Redis for caching unread counts (optional)

---

## Implementation Plan

### Sprint 1 (2 weeks) - Core Service
- Week 1: Database schema + core endpoints
- Week 2: Delivery engine (in-app, push, email)

### Sprint 2 (2 weeks) - Integration
- Week 1: Habit reminders + task due reminders
- Week 2: Calendar reminders + achievements

### Sprint 3 (2 weeks) - UI
- Week 1: Notification Center component
- Week 2: Preferences UI + testing

### Sprint 4 (1 week) - Advanced
- Snooze, batching, analytics

---

## Success Criteria

**Definition of Done:**
- [ ] Notification service fully operational
- [ ] All notification types implemented
- [ ] Delivery rate ≥ 95%
- [ ] Push notifications working in all major browsers
- [ ] Email delivery working
- [ ] Notification Center UI complete
- [ ] Preferences UI complete
- [ ] Test coverage ≥ 80%

**Quality Gates:**
- All tests passing
- No P0/P1 bugs
- Performance benchmarks met
- Security audit passed (push subscriptions, email)
- Privacy compliance (GDPR, CAN-SPAM)

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Push permission denial | Medium | High | Graceful degradation, educate users on benefits |
| Email deliverability issues | High | Medium | Use reputable service (SendGrid), warm up IP, SPF/DKIM |
| Notification spam complaints | High | Medium | Intelligent batching, user preferences, easy unsubscribe |
| Timezone handling bugs | Medium | Medium | Use robust libraries (moment-timezone), extensive testing |
| Service Worker compatibility | Medium | Low | Progressive enhancement, test on all browsers |

---

## Open Questions

1. Should we support SMS notifications? (cost, international)
2. What's the maximum notification history to keep? (90 days? 1 year?)
3. Should we allow notification forwarding (e.g., to Slack, Discord)?
4. How to handle multiple devices per user (send to all or primary device only)?
5. Should users be able to create custom notifications (IFTTT-style)?

---

## Appendix

### Related Documents
- Habits PRD (achievements, reminders)
- Calendar PRD (event reminders)
- Tasks PRD (due date notifications)

### References
- Web Push API documentation
- SendGrid API documentation
- GDPR notification requirements
- CAN-SPAM Act compliance
- Service Worker best practices

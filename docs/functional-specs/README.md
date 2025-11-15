# Functional Specifications Index

**Executive Dysfunction Center - Technical Implementation Guide**
**Version:** 1.0
**Last Updated:** 2025-11-15

---

## Overview

This directory contains detailed functional specifications for implementing all features in the Executive Dysfunction Center application. Each functional spec provides implementation-ready technical details including:

- Complete database schemas with SQL migrations
- Exact API contracts (TypeScript interfaces, endpoints, request/response formats)
- Detailed algorithms and business logic
- Validation rules and error handling
- Test specifications
- Security considerations
- Performance requirements
- Frontend integration examples

---

## Document Structure

Each functional specification follows this structure:

1. **Overview** - Purpose, scope, dependencies
2. **Database Schema** - Complete SQL with migrations, indexes, constraints
3. **API Contracts** - TypeScript types, endpoint specifications
4. **Business Logic** - Detailed algorithms, state machines, workflows
5. **Validation** - Input validation, error codes, error responses
6. **Testing** - Unit tests, integration tests, security tests
7. **Performance** - Response time targets, optimization strategies
8. **Security** - Threat model, mitigations, secure defaults
9. **Monitoring** - Metrics, logging, audit trails
10. **Frontend Integration** - Component examples, hooks, context providers
11. **Implementation Checklist** - Phase-by-phase tasks

---

## Functional Specifications

### ✅ FS-001: Authentication & User Management
**File:** [`FS-001-authentication-user-management.md`](./FS-001-authentication-user-management.md)
**Status:** ✅ Complete - Ready for Implementation
**Priority:** P0 (Critical)
**Effort:** 6 weeks
**Dependencies:** Email service, PostgreSQL

**Covers:**
- User registration with email verification
- Email/password login
- OAuth 2.0 social login (Google, Apple)
- Session management with JWT and refresh tokens
- Password reset flow
- User profile CRUD
- Multi-tenancy data isolation
- Encore.ts auth integration

**Key Technical Details:**
- Complete database schema (users, user_sessions, oauth_providers tables)
- 11 API endpoints with full request/response specifications
- JWT implementation with 15-minute expiration
- Refresh token rotation for security
- Bcrypt password hashing (12 rounds)
- Account lockout after 5 failed attempts
- Email templates (verification, password reset, notifications)
- Data migration strategy from 'default_user' to UUID user_id
- Comprehensive test specifications (50+ test cases)
- Security threat model and mitigations

---

### 🔧 FS-002: Notifications & Reminders System
**Status:** 📝 In Progress
**Priority:** P0 (Critical)
**Effort:** 4 weeks
**Dependencies:** FS-001 (Authentication), Email service, Web Push API

**Summary:**
Centralized notification service supporting multi-channel delivery (in-app, browser push, email) with user preferences management.

**Key Components:**

#### Database Schema
```sql
-- notifications table
- id, user_id, type, priority, title, message, action_url
- related_entity_type, related_entity_id
- scheduled_time, sent_at, read_at, dismissed_at, clicked_at
- delivery_channels[], delivery_status (JSONB)

-- notification_preferences table
- user_id, enabled, quiet_hours, timezone
- in_app_enabled, push_enabled, email_enabled
- email_frequency (immediate, daily_digest, weekly_digest)
- type_preferences (JSONB per notification type)
- push_subscription (JSONB for Web Push API)
```

#### API Endpoints (12 endpoints)
1. `POST /notifications` - Create notification (internal)
2. `GET /notifications` - List user notifications (paginated, filtered)
3. `PUT /notifications/:id/read` - Mark as read
4. `PUT /notifications/mark-all-read` - Bulk mark read
5. `PUT /notifications/:id/dismiss` - Dismiss
6. `DELETE /notifications/:id` - Delete
7. `GET /notifications/unread-count` - Badge count
8. `GET /notifications/preferences` - Get preferences
9. `PUT /notifications/preferences` - Update preferences
10. `POST /notifications/push/subscribe` - Register push subscription
11. `DELETE /notifications/push/unsubscribe` - Unregister
12. `POST /notifications/test` - Send test notification

#### Notification Types
- `habit_reminder` - Scheduled habit reminder
- `task_due` - Task due soon (24h, 1h before)
- `task_overdue` - Task is overdue
- `calendar_reminder` - Event reminder (configurable minutes before)
- `streak_warning` - Habit streak at risk
- `achievement` - Achievement unlocked
- `insight` - AI-generated insight available
- `mood_reminder` - Daily mood check-in reminder
- `journal_prompt` - Writing prompt suggestion
- `time_tracking_alert` - Timer running for X hours

#### Delivery Channels

**In-App:**
- Database storage
- WebSocket real-time push (optional)
- Polling fallback (30 seconds)
- Bell icon with badge count
- Notification drawer/panel

**Browser Push:**
- Web Push API (VAPID keys)
- Service Worker for offline delivery
- Click-to-action navigation
- Notification payload: title, body, icon, badge, data

**Email:**
- Immediate delivery (for urgent notifications)
- Daily digest (aggregate all notifications, send at 8am)
- Weekly digest (Sunday evening)
- HTML templates with unsubscribe link
- SendGrid/Mailgun integration

#### Cron Jobs
```typescript
// Every minute: Process pending notifications
- Query notifications WHERE sent_at IS NULL AND scheduled_time <= NOW()
- Respect quiet hours (per user timezone)
- Deliver via enabled channels
- Update delivery_status and sent_at
- Retry failures (3 attempts, exponential backoff)

// Daily at midnight: Generate next day's notifications
- Habit reminders (based on reminder_time and schedule_pattern)
- Task due reminders (24h before due_date)
- Calendar reminders (based on reminder_minutes)

// Hourly: Check streak warnings
- Habits with streak >= 3 and not completed today
- Send 2 hours before End of Day time

// Daily: Send email digests
- Aggregate previous day's notifications
- Send to users with email_frequency = 'daily_digest'
```

#### Frontend Components

**NotificationCenter.tsx:**
- Dropdown panel (desktop) or modal (mobile)
- List of notifications (grouped by date)
- Tabs: All | Unread | Read
- Mark as read/unread, dismiss, delete actions
- Empty state, loading state
- Infinite scroll or pagination

**NotificationBell.tsx:**
- Icon with badge count
- Click opens NotificationCenter
- Real-time count updates

**NotificationPreferences.tsx:**
- Global enable/disable toggle
- Quiet hours configuration
- Channel toggles (in-app always on, push, email)
- Per-type preferences (enable/disable, channel selection)
- Test notification button

#### Integration Points

**Habits Service:**
```typescript
// When user creates/updates habit with reminder_enabled
if (habit.reminder_enabled && habit.reminder_time) {
  await createDailyReminders(habit);
}

// Daily cron: Generate next day's reminders
for (const habit of habitsWithReminders) {
  if (shouldRemindToday(habit)) {
    await notifications.create({
      user_id: habit.user_id,
      type: 'habit_reminder',
      title: `Time to log: ${habit.name}`,
      message: `You have a ${habit.current_streak} day streak!`,
      action_url: '/habits',
      related_entity_type: 'habit',
      related_entity_id: habit.id,
      scheduled_time: calculateReminderTime(habit.reminder_time),
      delivery_channels: getUserChannels(habit.user_id, 'habit_reminder'),
    });
  }
}
```

**Tasks Service:**
```typescript
// Daily cron: Generate task due reminders
for (const task of upcomingTasks) {
  // 24 hours before
  if (isDueTomorrow(task)) {
    await notifications.create({
      type: 'task_due',
      title: `Task due tomorrow: ${task.title}`,
      scheduled_time: task.due_date - 24 * 3600,
    });
  }

  // 1 hour before
  if (isDueIn1Hour(task)) {
    await notifications.create({
      type: 'task_due',
      title: `Task due in 1 hour: ${task.title}`,
      scheduled_time: task.due_date - 3600,
      priority: 'high',
    });
  }
}
```

#### Security Considerations
- User can only read/modify own notifications
- Notification creation requires auth (internal service calls or user-initiated)
- Push subscriptions tied to user account
- Rate limiting on notification creation
- Unsubscribe links in emails (required by law)

#### Performance Requirements
- Notification delivery: < 1 minute from scheduled_time
- Unread count query: < 100ms
- List notifications: < 300ms for 50 items
- Cron job execution: < 5 seconds for 10k users

#### Test Specifications
- Unit tests: Notification creation, preference management, scheduling
- Integration tests: End-to-end delivery for each channel
- Load tests: 10k notifications/minute processing
- Security tests: Authorization, data isolation

---

### 🔧 FS-003: Tasks Service Backend Completions
**Status:** 📝 Specification in Progress
**Priority:** P0 (Critical)
**Effort:** 3 weeks
**Dependencies:** FS-001 (Authentication)

**Summary:**
Complete missing backend endpoints for Tasks service (search, bulk operations, analytics, recurring tasks).

**Components:**

#### 1. Search Implementation

**Database:**
```sql
-- Add full-text search index
CREATE INDEX idx_tasks_search ON tasks USING GIN (
  to_tsvector('english',
    title || ' ' || COALESCE(description, '') || ' ' || COALESCE(notes, '')
  )
);

-- Optional: Pre-computed search column
ALTER TABLE tasks ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(notes, ''))
  ) STORED;

CREATE INDEX idx_tasks_search_vector ON tasks USING GIN (search_vector);
```

**API:**
```typescript
GET /tasks?search=<query>&...other filters

Algorithm:
1. If search param empty, use existing filters
2. Parse search query:
   - Split into words
   - Support AND (default) and OR
   - Support phrase matching ("exact phrase")
   - Support exclusion (-word)
3. Build ts_query from parsed terms
4. Query with: WHERE search_vector @@ to_tsquery('english', <query>)
5. Order by rank (ts_rank) DESC
6. Apply other filters (status, priority, etc.)
7. Paginate results

Performance Target: < 200ms for 10k tasks
```

**Examples:**
```typescript
// Simple search
GET /tasks?search=meeting
→ WHERE search_vector @@ to_tsquery('english', 'meeting')

// Multi-word (AND)
GET /tasks?search=client meeting
→ WHERE search_vector @@ to_tsquery('english', 'client & meeting')

// Phrase
GET /tasks?search="weekly standup"
→ WHERE search_vector @@ phraseto_tsquery('english', 'weekly standup')

// Exclusion
GET /tasks?search=meeting -cancelled
→ WHERE search_vector @@ to_tsquery('english', 'meeting & !cancelled')

// Combined with filters
GET /tasks?search=review&priority=high&completed=false
```

#### 2. Bulk Operations

**API:**
```typescript
POST /tasks/bulk-actions
Request: {
  task_ids: number[]  // Max 1000
  action: 'complete' | 'delete' | 'update_category' | 'assign_tags' | 'update_priority'
  action_data?: {
    completed?: boolean
    category_id?: number
    tag_ids?: number[]
    priority?: 'high' | 'medium' | 'low'
  }
}
Response: {
  success_count: number
  failed_count: number
  errors?: Array<{ task_id: number, error: string }>
}

Algorithm:
1. Validate task_ids length (max 1000)
2. Validate action and action_data
3. Begin database transaction
4. For each task_id:
   a. Verify user owns task
   b. Apply action
   c. Track success/failure
5. If partial_success_allowed: COMMIT
   Else if any failure: ROLLBACK
6. Return detailed results

Performance Target: < 500ms for 100 tasks
```

**Database:**
```typescript
// Optimized bulk update examples

// Complete multiple tasks
UPDATE tasks
SET completed = true, completed_at = NOW(), updated_at = NOW()
WHERE id = ANY($1::int[])
  AND user_id = $2
  AND completed = false;

// Assign category to multiple tasks
UPDATE tasks
SET category_id = $1, updated_at = NOW()
WHERE id = ANY($2::int[])
  AND user_id = $3;

// Add tags to multiple tasks (requires iteration or JSON aggregation)
INSERT INTO task_tag_assignments (task_id, tag_id)
SELECT unnest($1::int[]), unnest($2::int[])
ON CONFLICT DO NOTHING;
```

#### 3. Analytics Endpoint

**API:**
```typescript
GET /tasks/analytics?start_date=<date>&end_date=<date>&category_id=<id>
Response: {
  overview: {
    total_tasks: number
    completed_tasks: number
    completion_rate: number
    overdue_tasks: number
    upcoming_tasks: number
  }
  category_performance: Array<{
    category_id: number
    category_name: string
    total: number
    completed: number
    avg_completion_time_minutes: number
  }>
  time_analysis: {
    avg_estimated_minutes: number
    avg_actual_minutes: number
    accuracy_percentage: number
    total_time_tracked_hours: number
  }
  productivity_patterns: {
    by_day_of_week: Record<string, number>
    by_priority: Record<string, number>
    completion_trend: Array<{ date: string, count: number }>
  }
  top_tags: Array<{ tag: string, count: number }>
  insights: Array<{
    type: 'positive' | 'warning' | 'suggestion'
    message: string
    data?: any
  }>
}
```

**SQL Queries:**
```sql
-- Overview
SELECT
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE completed = true) as completed_tasks,
  COUNT(*) FILTER (WHERE due_date < NOW() AND completed = false) as overdue_tasks,
  COUNT(*) FILTER (WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days' AND completed = false) as upcoming_tasks
FROM tasks
WHERE user_id = $1
  AND created_at >= $2
  AND created_at <= $3;

-- Category performance
SELECT
  c.id as category_id,
  c.name as category_name,
  COUNT(t.id) as total,
  COUNT(t.id) FILTER (WHERE t.completed = true) as completed,
  AVG(t.actual_minutes) FILTER (WHERE t.completed = true) as avg_completion_time
FROM task_categories c
LEFT JOIN tasks t ON t.category_id = c.id AND t.user_id = $1
GROUP BY c.id, c.name
ORDER BY total DESC;

-- Productivity patterns by day of week
SELECT
  EXTRACT(DOW FROM completed_at) as day_of_week,
  COUNT(*) as completions
FROM tasks
WHERE user_id = $1
  AND completed = true
  AND completed_at >= $2
  AND completed_at <= $3
GROUP BY day_of_week
ORDER BY day_of_week;

-- Completion trend (daily counts)
SELECT
  DATE(completed_at) as date,
  COUNT(*) as count
FROM tasks
WHERE user_id = $1
  AND completed = true
  AND completed_at >= $2
  AND completed_at <= $3
GROUP BY DATE(completed_at)
ORDER BY date;

-- Time estimation accuracy
SELECT
  AVG(estimated_minutes) as avg_estimated,
  AVG(actual_minutes) as avg_actual,
  (1 - ABS(AVG(estimated_minutes) - AVG(actual_minutes)) / NULLIF(AVG(estimated_minutes), 0)) * 100 as accuracy_percentage
FROM tasks
WHERE user_id = $1
  AND completed = true
  AND estimated_minutes IS NOT NULL
  AND actual_minutes IS NOT NULL
  AND completed_at >= $2
  AND completed_at <= $3;
```

**Insights Generation:**
```typescript
function generateInsights(analytics: AnalyticsData): Insight[] {
  const insights: Insight[] = [];

  // Completion rate insights
  if (analytics.overview.completion_rate >= 0.9) {
    insights.push({
      type: 'positive',
      message: `Excellent! You're completing ${Math.round(analytics.overview.completion_rate * 100)}% of your tasks.`,
    });
  } else if (analytics.overview.completion_rate < 0.5) {
    insights.push({
      type: 'warning',
      message: `Your completion rate is ${Math.round(analytics.overview.completion_rate * 100)}%. Consider reducing your task load.`,
    });
  }

  // Time estimation insights
  if (analytics.time_analysis.accuracy_percentage >= 80) {
    insights.push({
      type: 'positive',
      message: 'Your time estimates are very accurate! Keep it up.',
    });
  } else if (analytics.time_analysis.accuracy_percentage < 50) {
    insights.push({
      type: 'suggestion',
      message: 'Your time estimates are often off. Try tracking actual time more consistently.',
    });
  }

  // Overdue tasks warning
  if (analytics.overview.overdue_tasks > 0) {
    insights.push({
      type: 'warning',
      message: `You have ${analytics.overview.overdue_tasks} overdue tasks. Review and reschedule them.`,
    });
  }

  // Category performance
  const bestCategory = analytics.category_performance.reduce((best, cat) =>
    cat.completed > best.completed ? cat : best
  );
  if (bestCategory.completed > 0) {
    insights.push({
      type: 'positive',
      message: `${bestCategory.category_name} is your most productive category with ${bestCategory.completed} completed tasks.`,
    });
  }

  // Day of week patterns
  const maxDay = Object.entries(analytics.productivity_patterns.by_day_of_week)
    .reduce((max, [day, count]) => count > max[1] ? [day, count] : max, ['', 0]);
  if (maxDay[1] > 0) {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(maxDay[0])];
    insights.push({
      type: 'suggestion',
      message: `You complete most tasks on ${dayName}s. Schedule important tasks for that day.`,
    });
  }

  return insights;
}
```

#### 4. Recurring Tasks

**Database:**
```sql
CREATE TABLE task_instances (
  id SERIAL PRIMARY KEY,
  parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  instance_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  is_skipped BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_task_id, instance_date)
);

CREATE INDEX idx_task_instances_parent ON task_instances(parent_task_id, instance_date);
CREATE INDEX idx_task_instances_date ON task_instances(instance_date) WHERE is_completed = false;
```

**API:**
```typescript
// Generate instances (called by cron or on-demand)
POST /tasks/:id/recurrence/generate
Request: { days_ahead?: number }  // Default 90
Response: { generated_count: number, instances: TaskInstance[] }

// Get instances
GET /tasks/:id/recurrence/instances?start_date=<date>&end_date=<date>

// Complete instance
POST /tasks/:id/recurrence/instances/:date/complete

// Skip instance
POST /tasks/:id/recurrence/instances/:date/skip
```

**Recurrence Generation Algorithm:**
```typescript
function generateRecurrenceInstances(
  task: Task,
  daysAhead: number = 90
): TaskInstance[] {
  const pattern = task.recurrence_pattern;
  const instances: TaskInstance[] = [];

  let currentDate = new Date();
  const endDate = addDays(currentDate, daysAhead);

  while (currentDate <= endDate) {
    if (shouldCreateInstance(currentDate, pattern)) {
      instances.push({
        parent_task_id: task.id,
        instance_date: currentDate,
        is_completed: false,
      });
    }
    currentDate = addDays(currentDate, 1);
  }

  return instances;
}

function shouldCreateInstance(date: Date, pattern: RecurrencePattern): boolean {
  switch (pattern.type) {
    case 'daily':
      // Check if this day matches interval
      const daysSinceStart = differenceInDays(date, pattern.start_date);
      return daysSinceStart % pattern.interval === 0;

    case 'weekly':
      // Check if day of week matches
      const dayOfWeek = date.getDay();
      return pattern.days_of_week.includes(dayOfWeek) &&
             weeksSinceStart(date, pattern.start_date) % pattern.interval === 0;

    case 'monthly':
      // Check if day of month matches
      return date.getDate() === pattern.day_of_month &&
             monthsSinceStart(date, pattern.start_date) % pattern.interval === 0;

    default:
      return false;
  }
}
```

---

### 🔧 FS-004: Habits Analytics Backend
**Status:** 📋 Planned
**Priority:** P0 (Critical)
**Effort:** 2 weeks
**Dependencies:** FS-001 (Authentication)

**Summary:**
Move analytics calculations from client-side to server-side for better performance and security.

**API Endpoint:**
```typescript
GET /habits/analytics?start_date=<date>&end_date=<date>&habit_ids=<ids>
Response: {
  overview: {
    total_habits, active_habits, total_completions,
    consistency_score, momentum_score, average_completion_rate
  }
  performance_distribution: { excellent, good, struggling }
  category_performance: [...]
  top_performers: [...]
  insights: [...]
  trends: { completion_trend, by_day_of_week, by_time_of_day }
}
```

**Key SQL Queries:**
- Aggregated completion statistics
- Streak calculations
- Consistency scoring (% of scheduled days completed)
- Momentum scoring (recent trend)

---

### 🔧 FS-005: Mood Phase 2 Backend
**Status:** 📋 Planned
**Priority:** P0 (Critical)
**Effort:** 2 weeks
**Dependencies:** FS-001 (Authentication)

**Summary:**
Complete Phase 2 backend to match frontend capabilities (multi-dimensional tracking, triggers, pattern detection).

**Key Updates:**
1. Update `createMoodEntry` to save secondary_mood, energy_level, stress_level, location, weather, context_tags
2. Create trigger management endpoints (CRUD)
3. Update `getMoodAnalytics` to populate trigger_analysis and pattern_insights
4. Add pattern detection endpoint with statistical analysis

---

### 🔧 FS-006: Journal Export Implementation
**Status:** 📋 Planned
**Priority:** P0 (Critical)
**Effort:** 1 week
**Dependencies:** File storage service (S3)

**Summary:**
Implement existing `/journal/export` endpoint for Markdown, JSON, PDF, CSV formats.

---

### 🔧 FS-007: Calendar Reminders & Recurrence
**Status:** 📋 Planned
**Priority:** P0 (Critical)
**Effort:** 3 weeks
**Dependencies:** FS-002 (Notifications), RRULE library

**Summary:**
Add reminder system and recurrence instance expansion for calendar events.

---

### 🔧 FS-008: Cross-Service Analytics
**Status:** 📋 Planned
**Priority:** P1 (High)
**Effort:** 4 weeks
**Dependencies:** FS-001, all service analytics

**Summary:**
Unified analytics service with cross-service correlations and AI-powered insights.

---

## Implementation Priority Order

### Sprint 1-2: Foundation (Critical - Weeks 1-4)
1. ✅ **FS-001: Authentication & User Management** - Enables multi-user
2. 🔧 **FS-002: Notifications System** - Required by multiple services

### Sprint 3-5: Backend Completions (Critical - Weeks 5-10)
3. **FS-003: Tasks Service Backend** - Complete missing endpoints
4. **FS-004: Habits Analytics Backend** - Server-side analytics
5. **FS-005: Mood Phase 2 Backend** - Multi-dimensional tracking
6. **FS-006: Journal Export** - Quick win, high user value
7. **FS-007: Calendar Reminders & Recurrence** - Complex but essential

### Sprint 6-8: Advanced Features (High - Weeks 11-16)
8. **FS-008: Cross-Service Analytics** - Unified insights
9. **FS-009: AI Insights Engine** - Recommendations and predictions
10. **FS-010: Gamification System** - Achievements and levels

---

## Quick Reference

### Database Design Principles
- UUID for user_id (not sequential integers)
- Soft deletes (deleted_at timestamp)
- Audit timestamps (created_at, updated_at triggers)
- Proper indexing (user_id, status, dates)
- JSONB for flexible data (preferences, metadata)
- Foreign keys with ON DELETE CASCADE where appropriate
- Row-level security policies (optional but recommended)

### API Design Principles
- RESTful endpoints
- TypeScript interfaces for all types
- Encore.ts API decorators (`api()` function)
- Authentication via `auth: true` parameter
- Pagination for list endpoints (limit, offset)
- Filtering via query parameters
- Consistent error responses (code, message, details)
- HTTP status codes (200, 201, 400, 401, 403, 404, 409, 500)

### Error Handling
```typescript
export class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
  }
}

// Usage
if (!user) {
  throw new APIError('USER_NOT_FOUND', 'User not found', 404);
}
```

### Testing Requirements
- Unit tests: 80% coverage minimum
- Integration tests: All endpoints
- Security tests: Authentication, authorization, input validation
- Performance tests: Response time targets
- Load tests: Concurrent user simulation

---

## Environment Setup

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Authentication
JWT_SECRET=<base64-secret>
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800

# Email
SENDGRID_API_KEY=<key>
FROM_EMAIL=no-reply@example.com

# App URLs
APP_URL=https://app.example.com
FRONTEND_URL=https://example.com

# Push Notifications
VAPID_PUBLIC_KEY=<key>
VAPID_PRIVATE_KEY=<key>

# AI Services
OPENAI_API_KEY=<key>
ANTHROPIC_API_KEY=<key>

# File Storage
AWS_S3_BUCKET=<bucket>
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<key>
```

---

## Development Workflow

### 1. Start with Functional Spec
- Read the FS document thoroughly
- Understand database schema, API contracts, algorithms
- Clarify any ambiguities before coding

### 2. Database First
- Create migration files (up and down)
- Test migrations locally
- Add indexes, constraints, triggers

### 3. Backend Implementation
- Implement types (TypeScript interfaces)
- Create Encore service if new
- Implement API endpoints one by one
- Add validation and error handling
- Write unit tests as you go

### 4. Frontend Integration
- Update API client (`services/*.ts`)
- Create/update components
- Add hooks for data fetching (React Query)
- Update context providers if needed
- Write component tests

### 5. Testing
- Run all tests (`npm test`)
- Manual testing in development
- Integration testing
- Security testing

### 6. Documentation
- Update API documentation
- Add code comments for complex logic
- Update user-facing documentation if needed

### 7. Review & Deploy
- Code review
- Merge to main
- Deploy to staging
- QA testing
- Deploy to production

---

## Useful Commands

```bash
# Database migrations
encore db migrate                   # Run migrations
encore db reset                     # Reset database (dev only)

# Development
encore run                          # Start dev server
encore test                         # Run tests
encore test --watch                 # Watch mode

# Code quality
npm run lint                        # ESLint
npm run type-check                  # TypeScript check
npm run test:coverage               # Coverage report

# Frontend
cd frontend && npm start            # Frontend only
cd frontend && npm run build        # Production build
cd frontend && npm test             # Frontend tests

# Git workflow
git checkout -b feature/fs-001-auth
git add .
git commit -m "feat: implement user authentication (FS-001)"
git push -u origin feature/fs-001-auth
```

---

## Getting Help

**For Technical Questions:**
- Refer to specific FS document
- Check Encore.ts documentation: https://encore.dev/docs
- Review existing similar implementations in codebase

**For Clarifications:**
- Create GitHub issue with `[FS-XXX]` prefix
- Tag with `functional-spec` label
- Assign to product/tech lead

**For Bugs/Issues:**
- Check if issue is with spec or implementation
- If spec issue: Update FS document and notify team
- If implementation issue: Fix and update tests

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-15 | 1.0 | Initial functional specs created | Claude |

---

## Related Documents
- Product Requirements Documents (`docs/prds/`)
- API Documentation (`API_PHASE_2_DOCUMENTATION.md`)
- Database Migration Guide (`MIGRATION_ORDER.md`)
- Architecture Decision Records (ADRs) - TBD

---

**Status Summary:**
- ✅ Complete: 1 spec (FS-001 Authentication)
- 🔧 In Progress: 1 spec (FS-002 Notifications)
- 📋 Planned: 6 specs (FS-003 through FS-008)
- 📝 Future: Additional specs as needed

**Total Estimated Effort:** 23+ weeks for P0-P1 specifications

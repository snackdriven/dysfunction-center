# PRD: Habits Service Enhancements

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2025-11-15
**Owner:** Product Team

---

## Executive Summary

The Habits Service is one of the most mature services in the Executive Dysfunction Center app, with comprehensive multi-completion support, flexible target systems, and sophisticated frontend analytics. However, the analytics are entirely client-side calculated, and several enhancement opportunities exist for gamification, social features, and AI-powered insights.

---

## Current State Analysis

### ✅ Implemented Features
- **Multi-completion tracking** - Multiple completions per day (e.g., 8 glasses of water)
- **Flexible target system** - Boolean, count, duration-based habits
- **Smart streak calculation** - Respects "End of Day" time preference
- **10 pre-built templates** - Ready-to-use habit templates
- **Day-of-week scheduling** - Custom day patterns (daily/weekdays/weekends/custom)
- **Reminder system** - Time-based reminder preferences stored
- **Completion history** - Full CRUD on individual completions
- **Frontend analytics** - Comprehensive dashboard with insights (client-side)

### ❌ Critical Gaps
1. **Analytics endpoint disconnected** - Frontend calculates everything client-side instead of using backend
2. **No reminder notifications** - System tracks reminder preferences but no actual delivery mechanism
3. **Habit streaks table unused** - Table exists but streaks calculated on-the-fly
4. **Weekly/monthly targets partial** - Only daily targets fully implemented
5. **No habit archiving** - Only active/inactive flag
6. **No data export** - Can't export habit data
7. **No habit suggestions** - Could recommend habits based on performance
8. **Limited testing** - Multi-completion tests are placeholders

### 📊 Usage Impact
- **Backend:** 11 endpoints, multi-completion support, well-structured
- **Frontend:** 10 components, sophisticated analytics, rich UX
- **Database:** 6 migrations, well-indexed, ready for scale

---

## Goals & Success Metrics

### Primary Goals
1. Implement analytics backend endpoint to move calculations server-side
2. Add habit visualization features (calendar heatmap, charts, trends)
3. Complete reminder notification system
4. Add gamification elements (achievements, levels, rewards)
5. Implement data export functionality

### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Analytics Performance | Client-side | Server-side < 500ms |
| Reminder Delivery Rate | 0% | 95% on-time |
| Test Coverage | ~30% (placeholders) | 80% |
| Export Capability | None | CSV/JSON/PDF |
| User Engagement | Baseline | +30% with gamification |
| Streak Accuracy | On-the-fly calculation | Pre-calculated + cached |

---

## Detailed Requirements

### Phase 1: Complete Backend Analytics (P0 - Critical)

#### 1.1 Analytics Endpoint Implementation
**Priority:** P0
**Effort:** 4 days

**Current Behavior:**
- Frontend `habitsApi.getAnalytics()` is commented out
- All analytics calculated in HabitAnalytics.tsx client-side
- Heavy computation on every page load

**Required Implementation:**
```typescript
GET /habits/analytics?start_date=<date>&end_date=<date>&habit_ids=<ids>
Response: {
  overview: {
    total_habits: number
    active_habits: number
    total_completions: number
    consistency_score: number        // % of scheduled days completed
    momentum_score: number            // Recent trend indicator
    average_completion_rate: number
  }
  performance_distribution: {
    excellent: number                 // >90% completion
    good: number                      // 70-90%
    struggling: number                // <70%
  }
  category_performance: Array<{
    category: string
    completion_rate: number
    total_habits: number
    avg_streak: number
  }>
  top_performers: Array<{
    habit_id: number
    habit_name: string
    completion_rate: number
    current_streak: number
  }>
  insights: Array<{
    type: 'positive' | 'warning' | 'suggestion'
    priority: 'high' | 'medium' | 'low'
    message: string
    habit_id?: number
    action_items?: string[]
  }>
  trends: {
    completion_trend: Array<{ date: string, count: number, percentage: number }>
    by_day_of_week: Record<string, number>
    by_time_of_day: Record<string, number>
  }
}
```

**Insights Generation Logic:**
- **Positive:** "Great job! You've completed all habits 5 days in a row"
- **Warning:** "Your 'Exercise' habit streak is at risk - you haven't logged today"
- **Suggestion:** "Consider moving 'Meditation' to mornings based on your completion patterns"
- **Performance:** "Your Monday completion rate is 40% - plan ahead on Sundays"

**Acceptance Criteria:**
- [ ] All analytics data calculated server-side
- [ ] Date range filtering works correctly
- [ ] Habit filtering works (specific habits or all)
- [ ] Insights are personalized and actionable
- [ ] Performance: < 500ms for 100 habits, 1 year history
- [ ] Tests cover all analytics calculations
- [ ] Frontend switches from mock data to API

---

#### 1.2 Habit History Visualization Backend
**Priority:** P0
**Effort:** 2 days

**Current Behavior:**
- History endpoint exists but returns raw data
- No aggregations or summaries

**Required Implementation:**
```typescript
GET /habits/:id/history/summary?start_date=<date>&end_date=<date>
Response: {
  habit: Habit
  date_range: { start: string, end: string }
  completion_summary: {
    total_days: number
    completed_days: number
    completion_rate: number
    current_streak: number
    longest_streak: number
    total_value: number              // Sum of completion_value
    average_value_per_day: number
  }
  calendar_data: Array<{
    date: string
    completions: number
    total_value: number
    notes: string[]
    intensity: number                // 0-1 for heatmap coloring
  }>
  streaks: Array<{
    start_date: string
    end_date: string
    length: number
  }>
  patterns: {
    best_day_of_week: string
    worst_day_of_week: string
    best_time_of_day: string
    completion_by_hour: Record<string, number>
  }
}
```

**Acceptance Criteria:**
- [ ] Calendar data suitable for heatmap visualization
- [ ] Streak calculation accurate and efficient
- [ ] Pattern detection includes statistical significance
- [ ] Performance: < 300ms for 1 year of data

---

### Phase 2: Reminder & Notification System (P0 - Critical)

#### 2.1 Notification Delivery Service
**Priority:** P0
**Effort:** 5 days

**Current State:**
- `reminder_enabled` and `reminder_time` fields exist
- No actual notification sending

**Required Implementation:**

**New Service: `/notifications`**
```typescript
// Core notification types
interface Notification {
  id: number
  user_id: string
  type: 'habit_reminder' | 'streak_warning' | 'achievement' | 'insight'
  title: string
  message: string
  action_url?: string
  related_entity_type: 'habit' | 'task' | 'mood'
  related_entity_id: number
  scheduled_time: DateTime
  sent_at?: DateTime
  read_at?: DateTime
  delivery_method: 'email' | 'push' | 'in_app'
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
}

// Endpoints
POST /notifications                      // Create notification
GET /notifications                        // Get user notifications
PUT /notifications/:id/read               // Mark as read
PUT /notifications/:id/dismiss            // Dismiss notification
POST /notifications/mark-all-read         // Bulk mark read
```

**Habit-Specific Notifications:**
1. **Daily Reminders:**
   - Scheduled at `reminder_time` for each habit where `reminder_enabled = true`
   - Only on scheduled days (respects `schedule_pattern` and `scheduled_days`)
   - Snooze functionality (delay 30min, 1hr, 3hr)

2. **Streak Warnings:**
   - Alert 2 hours before "End of Day" time if habit not completed
   - Only for habits with active streaks ≥ 3 days
   - Customizable warning threshold

3. **Achievement Notifications:**
   - Milestone streaks (7, 14, 30, 60, 100, 365 days)
   - First perfect week
   - Category mastery (all habits in category at 90%+ for 30 days)

4. **Insight Notifications:**
   - Weekly summary (configurable day/time)
   - Pattern discoveries (e.g., "You complete Exercise 80% more on weekdays")
   - Performance alerts (declining trends)

**Delivery Channels:**

**In-App Notifications:**
- Bell icon with badge count in header
- Notification drawer/panel
- Real-time updates via WebSocket
- Notification sound (customizable)

**Browser Push:**
- Service Worker integration
- Permission request flow
- Works when tab closed
- Click to navigate to habit

**Email (Optional):**
- Daily digest mode (all notifications in one email)
- Immediate mode (send as they occur)
- HTML templates with unsubscribe link
- SendGrid/Mailgun integration

**Cron Jobs:**
- Every 15 minutes: Check pending notifications
- Daily at midnight: Generate next day's reminders
- Weekly: Generate insight notifications
- Hourly: Check for streak warnings

**Acceptance Criteria:**
- [ ] Reminders sent at correct time based on user timezone
- [ ] Respects quiet hours (optional preference)
- [ ] Delivery rate ≥ 95% within 1 minute of scheduled time
- [ ] Snooze functionality works
- [ ] Achievement notifications trigger correctly
- [ ] User can manage notification preferences per habit
- [ ] Tests cover all notification types and edge cases

---

### Phase 3: Visualization & History (P1 - High Priority)

#### 3.1 Calendar Heatmap View
**Priority:** P1
**Effort:** 3 days

**Use Case:** GitHub-style contribution heatmap for habit completion

**Frontend Component:**
- Year-at-a-glance calendar
- Color intensity based on completion percentage
- Hover shows details (date, completions, value)
- Click to drill into day details
- Responsive design (stack months on mobile)

**Uses:** History summary endpoint from 1.2

---

#### 3.2 Habit Charts & Trends
**Priority:** P1
**Effort:** 3 days

**Chart Types:**
1. **Completion Trend Line** - Daily completions over time
2. **Streak Timeline** - Visualize streak start/end dates
3. **Value Accumulation** - Cumulative sum (e.g., total minutes meditated)
4. **Day of Week Patterns** - Bar chart of completion by day
5. **Time of Day Heatmap** - When completions typically occur
6. **Comparison Chart** - Compare multiple habits side-by-side

**Library:** Recharts (already in use)

---

#### 3.3 Advanced Streak Management
**Priority:** P1
**Effort:** 3 days

**Populate `habit_streaks` Table:**
```sql
CREATE OR REPLACE FUNCTION update_habit_streaks()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate streaks when completion added/updated/deleted
  -- Update habit_streaks table
  -- Mark current vs historical streaks
END;
$$ LANGUAGE plpgsql;
```

**Streak Features:**
- **Current Streak:** Ongoing unbroken streak
- **Longest Streak:** Personal best
- **Streak History:** All past streaks with start/end dates
- **Freeze Streaks:** Use one "freeze" per month to protect streak on missed day
- **Streak Repairs:** Allow backfilling missed days (with limit, e.g., within 7 days)

**Endpoints:**
```typescript
GET /habits/:id/streaks
GET /habits/:id/streaks/current
POST /habits/:id/streaks/freeze        // Use a freeze
POST /habits/:id/streaks/repair/:date  // Backfill completion
```

---

### Phase 4: Gamification & Engagement (P1 - High Priority)

#### 4.1 Achievement System
**Priority:** P1
**Effort:** 5 days

**Achievement Categories:**

**Streak Achievements:**
- "Week Warrior" - 7-day streak
- "Two-Week Champion" - 14-day streak
- "Monthly Master" - 30-day streak
- "Centurion" - 100-day streak
- "Annual Hero" - 365-day streak

**Consistency Achievements:**
- "Perfect Week" - 100% completion all habits for 7 days
- "Perfect Month" - 100% completion all habits for 30 days
- "Early Bird" - Complete all habits before 9am for 7 days
- "Night Owl" - Complete all habits after 8pm for 7 days

**Category Achievements:**
- "Health Guru" - Complete all health habits at 90%+ for 30 days
- "Productivity Pro" - Complete all productivity habits at 90%+ for 30 days
- "Personal Growth" - Complete all personal habits at 90%+ for 30 days

**Milestone Achievements:**
- "Habit Builder" - Create 5 habits
- "Template Master" - Use all 10 templates
- "Tracker Pro" - Log 100 completions
- "Dedicated Logger" - Log on 30 consecutive days (any habit)

**Special Achievements:**
- "Phoenix" - Restart a habit after 30-day break
- "Consistency King/Queen" - 95%+ completion rate on all habits for 90 days
- "Early Adopter" - One of first 1000 users (if applicable)

**Database:**
```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  icon VARCHAR(100),
  points INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze'  -- bronze, silver, gold, platinum
);

CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  achievement_id INTEGER REFERENCES achievements(id),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  related_habit_id INTEGER REFERENCES habits(id),
  metadata JSONB  -- streak length, date achieved, etc.
);
```

**Implementation:**
- Background job checks for achievement unlocks
- Notification when achievement earned
- Badge display on profile/dashboard
- Leaderboard (optional social feature)

---

#### 4.2 Levels & Points System
**Priority:** P1
**Effort:** 3 days

**Points Earning:**
- 1 point per habit completion
- Bonus points for streaks (1 per day in streak)
- Bonus points for perfect days (5 points)
- Bonus points for achievements (varies by tier)

**Level Progression:**
- Level 1: 0-100 points
- Level 2: 101-250 points
- Level 3: 251-500 points
- (Exponential curve, max level 50)

**Level Benefits:**
- Unlock advanced features (templates, custom fields)
- Visual badges and titles
- Freeze days (1 per 5 levels)
- Theme unlocks (cosmetic rewards)

---

### Phase 5: Data Management (P1 - High Priority)

#### 5.1 Export Functionality
**Priority:** P1
**Effort:** 3 days

**Export Formats:**

**CSV Export:**
```csv
Habit Name,Date,Completions,Value,Notes
Drink Water,2024-01-01,8,8,Feeling hydrated!
Exercise,2024-01-01,1,30,Morning run
```

**JSON Export:**
```json
{
  "export_date": "2024-01-15T10:00:00Z",
  "date_range": { "start": "2024-01-01", "end": "2024-01-31" },
  "habits": [
    {
      "id": 1,
      "name": "Drink Water",
      "completions": [
        { "date": "2024-01-01", "value": 8, "notes": "..." }
      ],
      "stats": { "completion_rate": 0.95, "current_streak": 28 }
    }
  ]
}
```

**PDF Report:**
- Executive summary
- Charts (completion trends, streaks)
- Calendar heatmap
- Statistics table
- Generated via Puppeteer or similar

**Endpoints:**
```typescript
POST /habits/export
Request: {
  format: 'csv' | 'json' | 'pdf'
  habit_ids?: number[]
  start_date: string
  end_date: string
  include_stats?: boolean
}
Response: { download_url: string, expires_at: string }
```

---

#### 5.2 Import Functionality
**Priority:** P2
**Effort:** 3 days

**Use Cases:**
- Migrate from other habit tracking apps
- Restore from backup
- Bulk create habits from template file

**Supported Formats:**
- CSV (standard format)
- JSON (app-specific format)
- Loop Habit Tracker format (popular Android app)

**Validation:**
- Duplicate detection
- Date validation
- Value range checks
- Dry-run mode (preview before import)

---

### Phase 6: AI & Insights (P2 - Medium Priority)

#### 6.1 Habit Suggestions
**Priority:** P2
**Effort:** 4 days

**Recommendation Engine:**

**Based on Performance:**
- Suggest easier habits if struggling (< 50% completion)
- Suggest complementary habits (e.g., "Drink Water" + "Eat Healthy")
- Suggest time-based optimizations (move to better time of day)

**Based on Goals:**
- Ask user goals on onboarding (health, productivity, personal growth)
- Recommend habits that align with goals
- Popular habits in same category

**Based on Patterns:**
- "You complete habits better in mornings - try adding 'Meditation' to morning routine"
- "Your weekends have lower completion - consider reducing weekend habits"

**Implementation:**
- ML-based recommendation system (optional)
- Rule-based suggestions (simpler, start here)
- A/B test recommendations to measure adoption

---

#### 6.2 Correlation Analysis
**Priority:** P2
**Effort:** 4 days

**Cross-Feature Correlations:**
- Habit completion vs Mood score
- Habit completion vs Productivity score (tasks)
- Habit completion vs Journal entry sentiment
- Specific habits vs specific outcomes (e.g., "Exercise" vs "Energy Level")

**Statistical Methods:**
- Pearson correlation coefficient
- Time-lagged correlation (today's habit → tomorrow's mood)
- Multi-variate analysis

**Output:**
```typescript
GET /habits/:id/correlations
Response: {
  mood_correlation: {
    coefficient: number  // -1 to 1
    strength: 'strong' | 'moderate' | 'weak' | 'none'
    direction: 'positive' | 'negative'
    insight: string
  }
  productivity_correlation: {...}
  energy_correlation: {...}
  sleep_correlation: {...}  // if sleep tracking added
}
```

---

### Phase 7: Social & Community (P3 - Low Priority)

#### 7.1 Habit Sharing
**Priority:** P3
**Effort:** 5 days

**Features:**
- Share individual habit progress (e.g., streak milestone)
- Share custom habit as template
- Public habit profiles (opt-in)
- Community template library

---

#### 7.2 Accountability Partners
**Priority:** P3
**Effort:** 7 days

**Features:**
- Invite friends as accountability partners
- Partners can see your progress (with permissions)
- Send encouragement messages
- Shared challenges (both complete "Exercise" for 30 days)

---

## Technical Architecture

### Database Changes
1. Create `achievements` and `user_achievements` tables
2. Create `notifications` table
3. Populate `habit_streaks` table via triggers
4. Add indexes for analytics performance
5. Add `points` and `level` fields to user preferences

### API Changes
- 12 new endpoints (analytics, notifications, achievements, export, correlations)
- WebSocket endpoint for real-time notifications
- Cron job endpoints (internal)

### Frontend Changes
- Connect analytics to backend API
- Add notification center component
- Add achievements display
- Add export/import UI
- Add calendar heatmap component
- Add chart components for trends

### Infrastructure
- Background job scheduler (cron or Encore cron)
- Email service integration (SendGrid)
- Push notification service (Web Push API)
- File storage for exports (S3 or similar)

---

## Implementation Plan

### Sprint 1 (2 weeks) - Analytics Backend
- Week 1: Implement analytics endpoint
- Week 2: Implement history summary endpoint + frontend integration

### Sprint 2 (2 weeks) - Notifications
- Week 1: Notification service + database
- Week 2: Delivery mechanisms (in-app, push, email)

### Sprint 3 (2 weeks) - Visualization
- Week 1: Calendar heatmap component
- Week 2: Chart components + streak management

### Sprint 4 (2 weeks) - Gamification
- Week 1: Achievement system
- Week 2: Points & levels

### Sprint 5 (1 week) - Data Management
- Export functionality

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Notification delivery failures | High | Medium | Retry logic, monitoring, fallback to in-app |
| Analytics performance degradation | Medium | Medium | Caching, database optimization, pagination |
| Gamification reducing intrinsic motivation | Medium | Low | Make opt-in, focus on progress not comparison |
| Complex streak logic bugs | Medium | Medium | Extensive testing, edge case handling, user feedback |
| Export generation timeouts | Low | Medium | Async job processing, limit date ranges |

---

## Success Criteria

**Definition of Done:**
- [ ] Analytics backend implemented and frontend using real data
- [ ] Notification system delivering reminders reliably
- [ ] Calendar heatmap visualization working
- [ ] Achievement system unlocking correctly
- [ ] Export functionality working for all formats
- [ ] Test coverage ≥ 80%
- [ ] Performance benchmarks met
- [ ] Documentation updated

**Quality Gates:**
- All tests passing
- No P0/P1 bugs
- Performance within targets
- Accessibility audit passed
- User testing completed with positive feedback

---

## Open Questions

1. Should achievements be retroactive (award for past accomplishments)?
2. What should be the streak freeze limit (1 per month, 1 per week)?
3. Should we allow users to customize achievement criteria?
4. Email notifications: daily digest or immediate?
5. Should points/levels be visible to other users (social feature)?
6. How to handle timezone changes for streaks and reminders?

---

## Appendix

### Related Documents
- `API_PHASE_2_DOCUMENTATION.md` - Current API spec
- `/habits/types.ts` - Type definitions
- `habits/multi-completion.test.ts` - Multi-completion tests

### References
- Atomic Habits by James Clear (habit formation principles)
- Hooked by Nir Eyal (engagement loops)
- BJ Fogg Behavior Model (behavior = motivation + ability + prompt)

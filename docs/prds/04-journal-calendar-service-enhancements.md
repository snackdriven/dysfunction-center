# PRD: Journal & Calendar Service Enhancements

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2025-11-15
**Owner:** Product Team

---

## Executive Summary

The Journal and Calendar services are the most complete implementations in the app, with robust backends and feature-rich frontends. This PRD focuses on filling gaps (export functionality, reminders, recurrence processing) and adding advanced features (AI writing assistance, calendar analytics, cross-service integrations).

---

## Part 1: Journal Service Enhancements

### Current State Analysis

**✅ Strengths:**
- 729 lines of well-structured backend code
- Complete CRUD operations
- Full-text search with filters
- 8 pre-built templates
- Template management (CRUD)
- Analytics endpoint (comprehensive)
- 334 lines of test coverage
- Zero TODOs or technical debt
- Beautiful markdown editor frontend

**❌ Gaps:**
1. Export endpoint exists but throws "not yet implemented"
2. No mood correlation calculation (field exists but not populated)
3. Template selection UI exists but templates not applied during entry creation
4. No bulk operations (multi-select delete, export)
5. No image/media upload support
6. No sharing features despite privacy levels
7. No AI writing assistance

---

### Detailed Requirements

#### 1.1 Export Functionality (P0 - Critical)
**Effort:** 3 days

**Current:** `GET /journal/export` throws "not yet implemented"

**Implementation:**
```typescript
GET /journal/export?format=<format>&start_date=<date>&end_date=<date>&privacy=<level>&tags=<tags>
Formats:
  - markdown: One .md file per entry or combined
  - json: Complete data structure
  - pdf: Formatted document with metadata
  - csv: Spreadsheet format (basic fields only)
Response: { download_url: string, expires_at: string }
```

**Features:**
- Filter by date range, privacy level, tags, mood reference
- Markdown preserves formatting
- PDF includes cover page, table of contents
- Async generation for large exports
- S3/file storage integration
- Expiring download links (24 hours)

**Acceptance Criteria:**
- [ ] All formats generated correctly
- [ ] Filters work as expected
- [ ] Large exports (>100 entries) don't timeout
- [ ] Download links expire after 24 hours
- [ ] Tests cover all formats

---

#### 1.2 Template Application on Entry Creation (P0 - Critical)
**Effort:** 2 days

**Current:** Templates can be managed but not applied

**Implementation:**
```typescript
POST /journal/from-template/:template_id
Request: { title?: string }  // Override default title
Response: {
  entry: {
    title: string            // From template
    content: string          // Template prompts as markdown sections
    privacy_level: string
    tags: string[]
    // User fills in the prompts
  }
}
```

**Frontend:**
- Add "Use Template" button in entry creation modal
- Template selector dialog
- Pre-populate content with prompts from template
- User can edit before saving

**Acceptance Criteria:**
- [ ] Templates applied correctly
- [ ] Prompts formatted as markdown sections
- [ ] User can customize before saving
- [ ] Tests cover template application

---

#### 1.3 AI Writing Assistance (P1 - High Priority)
**Effort:** 5 days

**Use Cases:**
- **Writing Prompts:** "What should I write about today?" → AI suggests prompts based on recent entries, mood, activities
- **Sentiment Analysis:** Analyze entry sentiment and emotional tone
- **Auto-Tagging:** Suggest tags based on content
- **Summary Generation:** Summarize long entries
- **Reflection Questions:** Generate follow-up questions based on entry content

**Endpoints:**
```typescript
// Get writing prompts
POST /journal/ai/prompts
Request: { context?: 'daily' | 'weekly' | 'gratitude' | 'productivity' }
Response: { prompts: string[] }

// Analyze entry
POST /journal/:id/ai/analyze
Response: {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  sentiment_score: number  // -1 to 1
  emotions: Array<{ emotion: string, intensity: number }>
  suggested_tags: string[]
  key_themes: string[]
  summary: string
  reflection_questions: string[]
}

// Auto-complete / writing suggestions
POST /journal/ai/complete
Request: { partial_text: string, context: string }
Response: { completions: string[] }
```

**AI Provider:** OpenAI GPT-4 or Anthropic Claude

**Acceptance Criteria:**
- [ ] Prompts are personalized and varied
- [ ] Sentiment analysis reasonably accurate
- [ ] Tag suggestions relevant
- [ ] Rate limiting and cost controls in place
- [ ] User can disable AI features (privacy)

---

#### 1.4 Enhanced Mood Correlation (P1 - High Priority)
**Effort:** 2 days

**Current:** `mood_correlation` field in analytics is empty

**Implementation:**
- Calculate Pearson correlation between writing and mood scores
- Statistical significance test
- Lag analysis (does writing today improve mood tomorrow?)
- Populate `mood_correlation` in analytics response

**Correlation Analysis:**
```typescript
{
  mood_correlation: {
    overall_correlation: number         // -1 to 1
    statistical_significance: number    // p-value
    confidence: 'high' | 'medium' | 'low'
    interpretation: string              // "Writing is associated with better mood"
    lag_analysis: {
      same_day_correlation: number
      next_day_correlation: number
      best_lag: number                  // Days
    }
  }
}
```

---

#### 1.5 Bulk Operations (P2 - Medium Priority)
**Effort:** 3 days

**Endpoints:**
```typescript
POST /journal/bulk-delete
Request: { entry_ids: number[] }

POST /journal/bulk-update
Request: { entry_ids: number[], updates: { privacy_level?: string, tags?: string[] } }

POST /journal/bulk-export
Request: { entry_ids: number[], format: string }
```

**Frontend:**
- Multi-select checkboxes
- Bulk action toolbar
- Confirmation dialogs

---

#### 1.6 Media Attachments (P2 - Medium Priority)
**Effort:** 5 days

**Use Case:** Attach photos, files to journal entries

**Database:**
```sql
CREATE TABLE journal_attachments (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER NOT NULL,
  storage_url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Implementation:**
- File upload endpoint with validation (max 10MB per file, 10 files per entry)
- S3/cloud storage integration
- Image thumbnails generation
- Supported types: images (jpg, png, gif), documents (pdf, txt, md)

---

#### 1.7 Sharing & Publishing (P3 - Low Priority)
**Effort:** 4 days

**Use Case:** Share entries with specific people or publish publicly

**Features:**
- Generate shareable link (read-only)
- Password protection optional
- Expiring links
- Anonymous reading mode (hide author)
- Public journal profiles (opt-in)

---

## Part 2: Calendar Service Enhancements

### Current State Analysis

**✅ Strengths:**
- Complete event CRUD operations
- Day/week/month view implementations
- Task integration with foreign keys
- Conflict detection
- Recurrence rule storage (RRULE)
- All-day event support
- 11 calendar components with rich UX
- Integrated views (events + tasks + habits + mood)

**❌ Gaps:**
1. **Event exceptions** - Table exists but no endpoints to manage recurring event modifications
2. **Reminder system** - EventForm has reminder selector but backend doesn't support it
3. **Recurrence processing** - RRULE stored but not expanded into instance dates
4. **Calendar analytics** - Types defined but no implementation
5. **Multi-calendar support** - No concept of separate calendars
6. **Custom recurrence builder** - Only basic recurrence options
7. **No calendar printing/export** - Can't export to iCal/Google Calendar

---

### Detailed Requirements

#### 2.1 Reminder System Implementation (P0 - Critical)
**Effort:** 4 days

**Database:**
```sql
ALTER TABLE calendar_events ADD COLUMN reminder_minutes INTEGER[];
-- e.g., [15, 60] for 15 min and 1 hour before
```

**Endpoints:**
```typescript
PUT /calendar/events/:id/reminders
Request: { reminder_minutes: number[] }  // [15, 30, 60, 1440]
Response: { event: CalendarEvent }

GET /calendar/reminders/upcoming?hours_ahead=<hours>
Response: {
  reminders: Array<{
    event_id: number
    event_title: string
    event_start: string
    reminder_time: string
    minutes_before: number
  }>
}
```

**Integration with Notification System:**
- Cron job checks upcoming events
- Generates notifications at reminder times
- In-app, push, email delivery options
- Snooze functionality

**Acceptance Criteria:**
- [ ] Multiple reminders per event
- [ ] Reminders trigger notifications
- [ ] Frontend reminder selector functional
- [ ] Tests cover reminder logic

---

#### 2.2 Recurrence Processing & Instance Expansion (P0 - Critical)
**Effort:** 6 days

**Current:** RRULE stored but not processed

**Database:**
```sql
CREATE TABLE calendar_event_instances (
  id SERIAL PRIMARY KEY,
  parent_event_id INTEGER REFERENCES calendar_events(id) ON DELETE CASCADE,
  instance_date DATE NOT NULL,
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  is_modified BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  modified_event_id INTEGER,  -- Points to exception event
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_event_id, instance_date)
);
```

**Implementation:**

**Parse RRULE:**
- Use `rrule` npm library
- Support FREQ (DAILY, WEEKLY, MONTHLY, YEARLY)
- Support INTERVAL, BYDAY, BYMONTHDAY, COUNT, UNTIL
- Handle edge cases (Feb 29, month-end dates)

**Generate Instances:**
```typescript
POST /calendar/events/:id/recurrence/generate
Request: { days_ahead?: number }  // Default 90
Response: { generated_count: number, instances: EventInstance[] }

// Called by cron job daily to maintain 90-day horizon
```

**Get Instances:**
```typescript
GET /calendar/events/:id/recurrence/instances?start_date=<date>&end_date=<date>
Response: { instances: EventInstance[] }
```

**Edit Series vs Single Instance:**
```typescript
PUT /calendar/events/:id/recurrence/instance/:date
Request: { action: 'edit_this' | 'edit_all_future' | 'cancel_this', event_data?: Partial<Event> }
```

**Acceptance Criteria:**
- [ ] All RRULE patterns supported
- [ ] Instances generated correctly
- [ ] Edit single vs series works
- [ ] Cancellations tracked
- [ ] Performance: 1 year of daily events < 500ms
- [ ] Tests cover all recurrence types

---

#### 2.3 Calendar Analytics Endpoint (P1 - High Priority)
**Effort:** 4 days

**Endpoint:**
```typescript
GET /calendar/analytics?start_date=<date>&end_date=<date>
Response: {
  overview: {
    total_events: number
    total_hours_scheduled: number
    busiest_day: string
    busiest_hour: number
    avg_events_per_day: number
    avg_event_duration_minutes: number
  }
  time_distribution: {
    by_day_of_week: Record<string, number>  // day -> hours scheduled
    by_hour_of_day: Record<number, number>  // hour -> event count
    by_location: Record<string, number>     // location -> event count
  }
  task_integration: {
    events_with_tasks: number
    task_completion_rate: number
    tasks_scheduled_vs_completed: { scheduled: number, completed: number }
    avg_days_before_deadline: number
  }
  productivity_score: number  // 0-100 based on scheduling patterns
  insights: Array<{
    type: 'positive' | 'warning' | 'suggestion'
    message: string
  }>
}
```

**Insights Examples:**
- "Your busiest day is Tuesday - consider blocking time for deep work"
- "You schedule most events in the morning but have more cancellations then"
- "Events with tasks linked have 85% completion rate vs 60% without"

**Acceptance Criteria:**
- [ ] All analytics calculated correctly
- [ ] Insights actionable
- [ ] Performance < 1s for 1 year data
- [ ] Tests cover calculations

---

#### 2.4 Multi-Calendar Support (P2 - Medium Priority)
**Effort:** 5 days

**Use Case:** Separate calendars for Work, Personal, Family, etc.

**Database:**
```sql
CREATE TABLE calendars (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE calendar_events ADD COLUMN calendar_id INTEGER REFERENCES calendars(id);
```

**Features:**
- Create multiple calendars
- Assign events to calendars
- Color-coded calendar views
- Toggle calendar visibility
- Calendar sharing (future feature)

---

#### 2.5 iCal/Google Calendar Integration (P2 - Medium Priority)
**Effort:** 6 days

**Features:**

**Export:**
```typescript
GET /calendar/export/ical?start_date=<date>&end_date=<date>&calendar_ids=<ids>
Response: .ics file download
```

**Import:**
```typescript
POST /calendar/import/ical
Request: { file: File }  // .ics file
Response: { imported_count: number, errors: string[] }
```

**Sync:**
- Google Calendar API integration
- Two-way sync (read/write)
- Conflict resolution
- OAuth authentication

---

#### 2.6 Event Templates (P2 - Medium Priority)
**Effort:** 3 days

**Use Case:** Save frequently created events as templates

**Database:**
```sql
CREATE TABLE event_templates (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  template_event JSONB NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Endpoints:**
```typescript
POST /calendar/templates
GET /calendar/templates
POST /calendar/events/from-template/:id
DELETE /calendar/templates/:id
```

**Example Templates:**
- "Weekly Team Meeting" - Every Monday 10am, 1 hour, conference room
- "Daily Standup" - Every weekday 9am, 15 min
- "Client Review" - 1 hour, with reminder 1 day before

---

#### 2.7 Time Blocking Assistant (P3 - Low Priority)
**Effort:** 7 days

**Use Case:** AI-suggested optimal scheduling

**Features:**
- Analyze calendar patterns
- Suggest best times for specific event types
- Auto-schedule tasks based on priority and deadlines
- Buffer time between meetings
- Focus time blocks (no meetings allowed)
- Commute time calculation

**AI Prompts:**
- "When should I schedule this 2-hour deep work session?" → AI suggests based on typical low-meeting times
- "Auto-schedule my tasks for this week" → AI distributes tasks across calendar

---

## Technical Architecture

### Database Changes (Journal)
- Add `journal_attachments` table
- Add `mood_goal_id` field to entries (optional)
- Indexes for search performance

### Database Changes (Calendar)
- Add `reminder_minutes` field to events
- Create `calendar_event_instances` table
- Create `calendars` table
- Create `event_templates` table
- Add `calendar_id` to events

### API Changes (Journal)
- Implement export endpoint
- Add 6 AI endpoints
- Add 3 bulk operation endpoints
- Add attachment CRUD endpoints

### API Changes (Calendar)
- Add recurrence processing endpoints (4)
- Add analytics endpoint
- Add reminder endpoints (2)
- Add multi-calendar endpoints (5)
- Add import/export endpoints (2)

### Infrastructure
- S3/Cloud storage for file uploads
- AI provider integration (OpenAI/Anthropic)
- Background jobs for instance generation
- Notification system integration
- Google Calendar API integration

---

## Implementation Plan

### Journal Service
**Sprint 1 (2 weeks):**
- Week 1: Export functionality + template application
- Week 2: AI writing assistance

**Sprint 2 (1 week):**
- Mood correlation + bulk operations

### Calendar Service
**Sprint 1 (2 weeks):**
- Week 1: Reminder system
- Week 2: Recurrence processing Part 1

**Sprint 2 (2 weeks):**
- Week 1: Recurrence processing Part 2
- Week 2: Calendar analytics

**Sprint 3 (2 weeks):**
- Week 1: Multi-calendar support
- Week 2: iCal/Google Calendar integration

---

## Success Criteria

**Journal:**
- [ ] Export working for all formats
- [ ] AI insights ≥ 80% user satisfaction
- [ ] Template application functional
- [ ] Mood correlation calculated
- [ ] Test coverage ≥ 80%

**Calendar:**
- [ ] Reminders triggering correctly (≥ 95% on-time)
- [ ] Recurrence instances generating accurately
- [ ] Analytics providing actionable insights
- [ ] Multi-calendar support working
- [ ] Import/export compatible with Google Calendar

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| RRULE parsing edge cases | High | Medium | Extensive testing, reference iCal RFC 5545 |
| AI writing costs | Medium | High | Rate limiting, quotas, caching |
| Google Calendar API changes | Medium | Low | Abstract API calls, monitor Google announcements |
| File storage costs | Medium | Medium | File size limits, compression, storage quotas |
| Recurring event complexity | High | High | Phased rollout, start with simple patterns |

---

## Open Questions

1. Should journal exports include linked mood/task/habit data?
2. How many calendar instances to pre-generate (90 days? 1 year?)?
3. Should AI writing suggestions be real-time or on-demand?
4. Maximum file size for journal attachments?
5. Should recurring events show as separate entries in lists or grouped?

---

## Appendix

### Related Documents
- Journal: `/journal/journal.ts`, `/frontend/src/pages/Journal.tsx`
- Calendar: `/calendar/events.ts`, `/calendar/views.ts`
- API: `API_PHASE_2_DOCUMENTATION.md`

### References
- iCal RFC 5545 (Recurrence Rules)
- Google Calendar API Documentation
- Markdown specification
- PDF generation libraries (Puppeteer, PDFKit)

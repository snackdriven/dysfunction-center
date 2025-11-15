# PRD: Tasks Service Enhancements

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2025-11-15
**Owner:** Product Team

---

## Executive Summary

The Tasks Service currently provides comprehensive Phase 2 features including categories, tags, time tracking, and subtasks. However, several critical backend endpoints are missing despite having frontend UI and type definitions ready. This PRD outlines enhancements to complete the Tasks Service implementation and add advanced productivity features.

---

## Current State Analysis

### ✅ Implemented Features
- Complete CRUD operations for tasks
- Category management with color/icon customization
- Tag system with autocomplete
- Time tracking with start/stop functionality
- Subtask support via parent_task_id
- Recurrence pattern storage (JSONB)
- Rich frontend UI (List view, Kanban view)
- 15 core API endpoints

### ❌ Critical Gaps
1. **No bulk operations endpoint** - Types defined, frontend simulates with Promise.all()
2. **No analytics endpoint** - Frontend uses mock data
3. **No search implementation** - Backend doesn't filter by search term
4. **No recurrence processing** - Patterns stored but not expanded into instances
5. **No saved searches** - Component exists but no backend support
6. **Limited parameterized queries** - In-memory filtering instead of database queries

### 📊 Usage Impact
- **Backend:** 729 lines (tasks.ts), 15 endpoints, well-tested
- **Frontend:** 16 components, comprehensive UX, but some features non-functional
- **Database:** 4 migrations, well-indexed, ready for scale

---

## Goals & Success Metrics

### Primary Goals
1. Complete all missing backend endpoints for existing frontend features
2. Implement recurring task automation
3. Add search functionality with full-text indexing
4. Improve query performance with proper parameterization
5. Add pagination for large task lists

### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| API Completeness | 11/16 endpoints | 16/16 endpoints |
| Search Latency | N/A | < 200ms for 10k tasks |
| Bulk Operations Support | Client-side only | Server-side batching |
| Recurring Task Coverage | 0% automated | 95% automated |
| Query Performance | In-memory filtering | Database-level filtering |
| Test Coverage | 40% | 80% |

---

## Detailed Requirements

### Phase 1: Complete Missing Backend Endpoints (P0 - Critical)

#### 1.1 Search Endpoint Enhancement
**Priority:** P0
**Effort:** 2 days

**Current Behavior:**
- `GET /tasks` accepts `search` parameter but ignores it
- Frontend sends search queries that have no effect

**Required Implementation:**
```typescript
// Endpoint: GET /tasks?search=<query>
- Full-text search on title and description
- Search in notes field
- Partial match support (substring matching)
- Case-insensitive search
- Database-level filtering (not in-memory)
- PostgreSQL ts_vector index for performance
```

**Technical Approach:**
- Add GIN index on `to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(notes, ''))`
- Use `ts_query` for search matching
- Support multi-word searches with AND/OR logic
- Highlight search terms in results (optional)

**Acceptance Criteria:**
- [ ] Search works on title, description, and notes
- [ ] Search is case-insensitive
- [ ] Search handles special characters safely
- [ ] Search performance < 200ms for 10k tasks
- [ ] Tests cover search edge cases

---

#### 1.2 Bulk Operations Endpoint
**Priority:** P0
**Effort:** 3 days

**Current Behavior:**
- Frontend simulates bulk operations with `Promise.all()`
- No database transaction support
- Inefficient for large selections

**Required Implementation:**
```typescript
POST /tasks/bulk-actions
Request: {
  task_ids: number[]
  action: 'complete' | 'delete' | 'update_category' | 'assign_tags' | 'update_priority'
  action_data?: {
    completed?: boolean
    category_id?: number
    tag_ids?: number[]
    priority?: string
  }
}
Response: {
  success_count: number
  failed_count: number
  errors?: Array<{ task_id: number, error: string }>
}
```

**Technical Approach:**
- Single database transaction for all operations
- Atomic updates (all succeed or all fail, with option for partial success)
- Validation before bulk update
- Activity logging for audit trail
- Rate limiting (max 1000 tasks per request)

**Acceptance Criteria:**
- [ ] Supports all bulk action types
- [ ] Uses database transactions
- [ ] Returns detailed success/failure report
- [ ] Handles partial failures gracefully
- [ ] Performance: < 500ms for 100 tasks
- [ ] Tests cover all action types and error scenarios

---

#### 1.3 Analytics Endpoint
**Priority:** P0
**Effort:** 4 days

**Current Behavior:**
- Frontend TaskAnalytics component uses mock data
- No server-side analytics calculations

**Required Implementation:**
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
    by_day_of_week: Record<string, number>  // day -> completion count
    by_priority: Record<string, number>     // priority -> count
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

**Insights Generation Logic:**
- Completion rate trends (improving/declining)
- Time estimation accuracy
- Overdue task patterns
- Category performance recommendations
- Priority distribution balance

**Acceptance Criteria:**
- [ ] All analytics data points calculated server-side
- [ ] Date range filtering works
- [ ] Category filtering works
- [ ] Insights are actionable and accurate
- [ ] Performance: < 1s for 10k tasks
- [ ] Tests cover all analytics calculations

---

#### 1.4 Recurrence Processing System
**Priority:** P1
**Effort:** 5 days

**Current Behavior:**
- `recurrence_pattern` field stores JSONB data but no processing
- No automatic task instance creation
- Frontend has RecurrencePatternForm but non-functional

**Required Implementation:**

**New Table:**
```sql
CREATE TABLE task_instances (
  id SERIAL PRIMARY KEY,
  parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  instance_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  is_skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_task_id, instance_date)
);
```

**Endpoints:**
```typescript
// Generate future instances (called by cron job or on-demand)
POST /tasks/:id/recurrence/generate
Request: { days_ahead?: number }  // default 90
Response: { generated_count: number, instances: TaskInstance[] }

// Get recurring task instances
GET /tasks/:id/recurrence/instances?start_date=<date>&end_date=<date>
Response: { instances: TaskInstance[] }

// Skip a specific instance
POST /tasks/:id/recurrence/instances/:date/skip

// Complete a specific instance
POST /tasks/:id/recurrence/instances/:date/complete

// Manage recurrence
PUT /tasks/:id/recurrence
DELETE /tasks/:id/recurrence  // Stop recurrence, keep history
```

**Recurrence Pattern Processing:**
- Support types: daily, weekly, monthly, custom
- Daily: Interval in days
- Weekly: Specific days of week, interval in weeks
- Monthly: Day of month or nth weekday, interval in months
- Custom: RRULE-compatible format
- Handle edge cases (Feb 29, month-end dates)

**Acceptance Criteria:**
- [ ] Instances generated correctly for all pattern types
- [ ] Cron job generates instances 90 days ahead
- [ ] Individual instance completion tracking
- [ ] Skip instances without affecting series
- [ ] Edit series vs single instance support
- [ ] Performance: Generate 1 year of daily instances < 100ms
- [ ] Tests cover all recurrence types and edge cases

---

### Phase 2: Advanced Features (P1 - High Priority)

#### 2.1 Saved Searches
**Priority:** P1
**Effort:** 2 days

**Implementation:**
```typescript
POST /tasks/searches
Request: {
  name: string
  filters: TaskFilterCriteria  // existing filter object
  is_default?: boolean
}

GET /tasks/searches
Response: { searches: SavedSearch[] }

DELETE /tasks/searches/:id
```

**Database:**
```sql
CREATE TABLE saved_task_searches (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  filters JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### 2.2 Task Templates
**Priority:** P1
**Effort:** 3 days

**Use Case:** Save commonly created tasks as templates for quick reuse.

**Implementation:**
```typescript
POST /tasks/templates
Request: {
  name: string
  template_task: Partial<Task>  // exclude id, timestamps
  category?: string
}

GET /tasks/templates
POST /tasks/from-template/:id  // Create task from template
```

---

#### 2.3 Task Dependencies
**Priority:** P1
**Effort:** 4 days

**Use Case:** Block tasks until prerequisites are completed.

**Database:**
```sql
CREATE TABLE task_dependencies (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(20) DEFAULT 'blocks',  -- blocks, related
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);
```

**Features:**
- Visualize dependency chains
- Prevent circular dependencies
- Auto-mark tasks as "blocked" if dependencies incomplete
- Topological sort for recommended task order

---

#### 2.4 Smart Notifications
**Priority:** P1
**Effort:** 3 days

**Types:**
- Due date reminders (24h, 1h before)
- Overdue task alerts
- Time tracking alerts (running timer notification)
- Recurring task instance creation notifications

**Implementation:**
- Backend notification service
- Email and browser push support
- User preferences for notification types
- Quiet hours support

---

### Phase 3: Performance & Quality (P2 - Medium Priority)

#### 3.1 Database Query Optimization
**Priority:** P2
**Effort:** 3 days

**Current Issues:**
- In-memory filtering for complex queries
- No pagination
- Inefficient multi-join queries

**Improvements:**
- Rewrite all filters as parameterized SQL queries
- Add LIMIT/OFFSET pagination
- Optimize join queries with indexes
- Add query result caching (Redis)
- Database connection pooling

---

#### 3.2 Test Coverage Expansion
**Priority:** P2
**Effort:** 4 days

**Current:** 40% coverage
**Target:** 80% coverage

**Missing Tests:**
- Category CRUD operations
- Tag CRUD operations
- Time tracking operations
- Search functionality
- Bulk operations
- Recurrence processing
- Frontend component tests (React Testing Library)
- E2E tests (Playwright)

---

#### 3.3 AI Task Breakdown
**Priority:** P2
**Effort:** 5 days

**Current State:** TaskBreakdownInterface component exists but no backend integration

**Implementation:**
```typescript
POST /tasks/:id/ai-breakdown
Request: { context?: string }
Response: {
  suggested_subtasks: Array<{
    title: string
    description: string
    estimated_minutes: number
    order: number
  }>
  reasoning: string
}
```

**Features:**
- OpenAI/Anthropic integration
- Context-aware suggestions based on task title/description
- Automatic subtask creation option
- Learning from user edits

---

### Phase 4: Advanced Productivity (P3 - Low Priority)

#### 4.1 Task History & Audit Log
**Priority:** P3
**Effort:** 3 days

Track all changes to tasks for accountability and undo functionality.

---

#### 4.2 Eisenhower Matrix View
**Priority:** P3
**Effort:** 2 days

Four-quadrant view: Urgent/Important, Urgent/Not Important, Not Urgent/Important, Not Urgent/Not Important

---

#### 4.3 Pomodoro Timer Integration
**Priority:** P3
**Effort:** 3 days

Built-in Pomodoro technique support with break timers and session tracking.

---

#### 4.4 Collaborative Tasks
**Priority:** P3
**Effort:** 10 days

Multi-user task assignment, comments, activity feeds.

---

## Technical Architecture

### Database Changes
1. Add full-text search index on tasks table
2. Create `task_instances` table for recurrence
3. Create `saved_task_searches` table
4. Create `task_templates` table
5. Create `task_dependencies` table
6. Add indexes for performance optimization

### API Changes
- 8 new endpoints (search, bulk-ops, analytics, recurrence, templates, dependencies)
- Enhanced filtering on existing endpoints
- Pagination support via query parameters

### Frontend Changes
- Connect existing components to new endpoints
- Remove mock data usage
- Add loading states for new operations
- Add error handling for new operations
- Enable disabled features (saved searches, task breakdown)

---

## Implementation Plan

### Sprint 1 (2 weeks) - Critical Gaps
- Week 1: Search + Bulk Operations
- Week 2: Analytics + Basic Testing

### Sprint 2 (2 weeks) - Recurrence
- Week 1-2: Recurrence processing system

### Sprint 3 (2 weeks) - Advanced Features
- Week 1: Saved Searches + Templates
- Week 2: Dependencies + Notifications

### Sprint 4 (2 weeks) - Quality
- Week 1-2: Performance optimization + Test coverage

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database performance degradation with full-text search | High | Medium | Use PostgreSQL ts_vector, monitor query performance, add caching |
| Recurrence logic complexity | Medium | High | Start with simple patterns, extensive testing, reference iCal RFC |
| Breaking changes to existing API | High | Low | Maintain backward compatibility, version API if needed |
| AI breakdown costs | Medium | Medium | Rate limiting, user quotas, cache suggestions |

---

## Success Criteria

**Definition of Done:**
- [ ] All P0 endpoints implemented and tested
- [ ] Frontend features fully functional (no mock data)
- [ ] Test coverage ≥ 80%
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Migration guide for users

**Quality Gates:**
- All tests passing
- No P0/P1 bugs
- Performance within targets
- Security review completed
- Accessibility audit passed

---

## Open Questions

1. Should bulk operations be atomic (all-or-nothing) or allow partial success?
2. What's the maximum task limit for bulk operations?
3. Should recurrence instances be pre-generated or created on-demand?
4. Which AI provider to use for task breakdown (OpenAI vs Anthropic)?
5. What's the recurrence horizon (how far ahead to generate)?

---

## Appendix

### Related Documents
- `API_PHASE_2_DOCUMENTATION.md` - Current API spec
- `/tasks/types.ts` - Type definitions
- `MIGRATION_ORDER.md` - Database migration guide

### References
- iCal RFC 5545 (Recurrence Rules)
- PostgreSQL Full-Text Search Documentation
- TanStack Query Best Practices

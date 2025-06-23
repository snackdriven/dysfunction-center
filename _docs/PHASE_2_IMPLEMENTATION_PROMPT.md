# Phase 2: Enhanced Core Features Implementation Prompt

You are an expert Encore/Next.js/TypeScript developer implementing Phase 2 of the Executive Dysfunction Center productivity tracking application. This phase builds upon the core foundation (Phase 1) by adding enhanced functionality to existing task management, habit tracking, mood logging, and calendar integration features.

## Implementation Requirements

When implementing Phase 2 features, always:
- Build upon existing Phase 1 infrastructure without breaking existing functionality
- Use clear, modern, idiomatic TypeScript and React patterns
- Add or update all necessary imports and type definitions
- Ensure all database migrations are properly versioned and reversible
- Use context providers and hooks for global state management
- Add comprehensive ARIA and accessibility features to all UI components
- Use CSS variables and utility classes for consistent theming
- Add detailed comments for complex business logic
- Update Storybook stories for all new UI components
- Generate proper API client code after backend changes
- Add comprehensive tests for all new functionality
- Document all changes and their impact on existing features
- Preserve data integrity and user context across all enhancements

---

## 2.1 Advanced Task Management
**Priority: HIGH** | **Dependencies: Phase 1.1 Basic Task Management**

### Database Schema Updates
Update the tasks table and create supporting tables for advanced functionality:

```sql
-- Add columns to existing tasks table
ALTER TABLE tasks ADD COLUMN category_id INTEGER REFERENCES task_categories(id);
ALTER TABLE tasks ADD COLUMN notes TEXT;
ALTER TABLE tasks ADD COLUMN estimated_minutes INTEGER;
ALTER TABLE tasks ADD COLUMN actual_minutes INTEGER;
ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id);
ALTER TABLE tasks ADD COLUMN recurrence_pattern JSONB;

-- Create supporting tables
CREATE TABLE task_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7), -- hex color
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_tag_assignments (
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES task_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

CREATE TABLE task_time_entries (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Backend Implementation
Enhance the tasks service with advanced functionality:

- **Task Categories & Tags**: CRUD operations for categories and tags, bulk assignment operations
- **Task Notes**: Rich text note support with proper sanitization
- **Time Tracking**: Start/stop timer functionality, time estimation vs actual tracking
- **Subtasks**: Hierarchical task relationships with completion percentage calculation
- **Recurring Tasks**: Support for daily, weekly, monthly, and custom recurrence patterns
- **Advanced Filtering**: Filter by category, tags, date ranges, completion status, time estimates
- **Bulk Operations**: Mark multiple tasks complete, bulk category/tag assignment, bulk deletion

### Frontend Implementation
Create enhanced task management UI components:

- **TaskCategoryManager**: Category creation, editing, color and icon selection
- **TaskTagManager**: Tag creation with autocomplete and suggestion features
- **AdvancedTaskForm**: Enhanced form with notes, time estimation, category/tag selection
- **TaskTimeTracker**: Timer component with start/stop functionality and time logging
- **TaskHierarchyView**: Tree view for parent/child task relationships
- **RecurrenceSelector**: UI for configurable recurring task patterns
- **AdvancedTaskFilters**: Multi-criteria filtering with saved filter presets
- **BulkTaskActions**: Selection and bulk operation interface
- **TaskAnalytics**: Basic task completion and time tracking analytics

### API Endpoints
```typescript
// Enhanced task management endpoints
POST /tasks/categories - Create task category
GET /tasks/categories - List all categories
PUT /tasks/categories/:id - Update category
DELETE /tasks/categories/:id - Delete category

POST /tasks/tags - Create tag
GET /tasks/tags - List all tags with autocomplete
DELETE /tasks/tags/:id - Delete tag

POST /tasks/:id/time-entries - Start/log time entry
PUT /tasks/:id/time-entries/:entryId - Update time entry
GET /tasks/:id/time-entries - Get task time history

POST /tasks/bulk-actions - Bulk task operations
GET /tasks/search - Advanced task search and filtering
GET /tasks/analytics - Task completion and time analytics
```

---

## 2.2 Enhanced Habit Tracking
**Priority: HIGH** | **Dependencies: Phase 1.2 Basic Habit Tracking**

### Database Schema Updates
Enhance habits table and add supporting structures:

```sql
-- Add columns to existing habits table
ALTER TABLE habits ADD COLUMN target_type VARCHAR(20) DEFAULT 'daily'; -- daily, weekly, custom
ALTER TABLE habits ADD COLUMN target_frequency INTEGER DEFAULT 1;
ALTER TABLE habits ADD COLUMN completion_type VARCHAR(20) DEFAULT 'boolean'; -- boolean, count, duration
ALTER TABLE habits ADD COLUMN target_value DECIMAL(10,2);
ALTER TABLE habits ADD COLUMN unit VARCHAR(50); -- minutes, reps, pages, etc.
ALTER TABLE habits ADD COLUMN template_id INTEGER REFERENCES habit_templates(id);
ALTER TABLE habits ADD COLUMN reminder_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE habits ADD COLUMN reminder_time TIME;

-- Create supporting tables
CREATE TABLE habit_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    suggested_target_type VARCHAR(20),
    suggested_target_value DECIMAL(10,2),
    suggested_unit VARCHAR(50),
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE habit_completions (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    completion_value DECIMAL(10,2) DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(habit_id, completion_date)
);

CREATE TABLE habit_streaks (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    streak_length INTEGER NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Backend Implementation
Enhance habits service with advanced tracking:

- **Flexible Targets**: Support for daily, weekly, and custom frequency habits
- **Multiple Completion Types**: Boolean (yes/no), numeric counts, duration tracking
- **Habit Templates**: Pre-defined habit templates with suggested targets and categories
- **Advanced Analytics**: Streak calculation, consistency scoring, trend analysis
- **Reminder System**: Configurable habit reminders with notification scheduling
- **Category Management**: Habit categorization with custom categories

### Frontend Implementation
Create enhanced habit tracking components:

- **HabitTemplateSelector**: Browse and apply habit templates
- **FlexibleHabitForm**: Form supporting different target types and completion methods
- **HabitCompletionTracker**: Context-aware completion interface (boolean/numeric/duration)
- **HabitStreakVisualizer**: Visual streak display with calendar heat map
- **HabitAnalyticsDashboard**: Consistency scores, trends, and improvement suggestions
- **HabitReminderManager**: Reminder configuration and scheduling interface
- **HabitCategoryManager**: Category creation and habit organization

### API Endpoints
```typescript
// Enhanced habit tracking endpoints
GET /habits/templates - List habit templates by category
POST /habits/from-template/:templateId - Create habit from template

POST /habits/:id/completions - Log habit completion
PUT /habits/:id/completions/:date - Update completion entry
GET /habits/:id/completions - Get completion history

GET /habits/:id/streaks - Get streak history
GET /habits/:id/analytics - Get habit analytics and insights

POST /habits/:id/reminders - Configure habit reminders
GET /habits/reminders/upcoming - Get upcoming reminders
```

---

## 2.3 Detailed Mood Tracking
**Priority: MEDIUM** | **Dependencies: Phase 1.3 Basic Mood Logging**

### Database Schema Updates
Enhance mood tracking with detailed context:

```sql
-- Add columns to existing mood_entries table
ALTER TABLE mood_entries ADD COLUMN secondary_mood VARCHAR(50);
ALTER TABLE mood_entries ADD COLUMN energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10);
ALTER TABLE mood_entries ADD COLUMN stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10);
ALTER TABLE mood_entries ADD COLUMN location VARCHAR(100);
ALTER TABLE mood_entries ADD COLUMN weather VARCHAR(50);
ALTER TABLE mood_entries ADD COLUMN context_tags JSONB;

-- Create supporting tables
CREATE TABLE mood_triggers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- work, personal, health, social
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mood_entry_triggers (
    mood_entry_id INTEGER REFERENCES mood_entries(id) ON DELETE CASCADE,
    trigger_id INTEGER REFERENCES mood_triggers(id) ON DELETE CASCADE,
    PRIMARY KEY (mood_entry_id, trigger_id)
);

CREATE TABLE custom_moods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- When user management is added
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Backend Implementation
Enhance mood service with detailed tracking:

- **Multi-Dimensional Mood**: Primary/secondary mood, energy and stress levels
- **Context Tracking**: Location, weather, and situational context
- **Trigger Management**: Identify and track mood triggers and influencers
- **Custom Moods**: User-defined mood options beyond predefined set
- **Pattern Recognition**: Basic mood pattern analysis and correlation detection
- **Advanced Filtering**: Filter by mood combinations, date ranges, triggers, context

### Frontend Implementation
Create detailed mood tracking interface:

- **DetailedMoodSelector**: Multi-dimensional mood selection interface
- **MoodContextForm**: Context entry for location, weather, triggers
- **TriggerManager**: CRUD interface for mood triggers and categories
- **CustomMoodCreator**: Interface for creating personalized mood options
- **MoodPatternVisualization**: Charts showing mood patterns and correlations
- **AdvancedMoodFilters**: Multi-criteria mood entry filtering
- **MoodInsightsDashboard**: Basic pattern recognition and insights

### API Endpoints
```typescript
// Enhanced mood tracking endpoints
GET /mood/triggers - List mood triggers by category
POST /mood/triggers - Create custom trigger
DELETE /mood/triggers/:id - Delete trigger

POST /mood/custom-moods - Create custom mood option
GET /mood/custom-moods - List user's custom moods
PUT /mood/custom-moods/:id - Update custom mood

GET /mood/entries/search - Advanced mood entry filtering
GET /mood/entries/patterns - Get mood patterns and correlations
GET /mood/entries/insights - Get mood insights and analysis
```

---

## 2.4 Calendar Integration Foundation
**Priority: HIGH** | **Dependencies: Phase 1 Complete**

### Database Schema Updates
Create calendar infrastructure:

```sql
-- Create calendar events table
CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    is_all_day BOOLEAN DEFAULT FALSE,
    location VARCHAR(200),
    color VARCHAR(7),
    recurrence_rule TEXT, -- RRULE format
    task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE calendar_event_exceptions (
    id SERIAL PRIMARY KEY,
    parent_event_id INTEGER REFERENCES calendar_events(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    cancelled BOOLEAN DEFAULT FALSE,
    modified_event_id INTEGER REFERENCES calendar_events(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient date range queries
CREATE INDEX idx_calendar_events_date_range ON calendar_events(start_datetime, end_datetime);
CREATE INDEX idx_calendar_events_recurrence ON calendar_events(recurrence_rule) WHERE recurrence_rule IS NOT NULL;
```

### Backend Implementation
Create calendar service with core functionality:

- **Event Management**: CRUD operations for calendar events
- **Recurrence Handling**: Support for daily, weekly, monthly recurrence patterns
- **Task Integration**: Link calendar events to tasks and deadlines
- **View Queries**: Efficient queries for month, week, and day views
- **Conflict Detection**: Identify overlapping events and schedule conflicts

### Frontend Implementation
Build calendar interface components:

- **CalendarGrid**: Month view with navigation and event display
- **WeekView**: Week-based calendar layout with time slots
- **DayView**: Detailed day view with hourly breakdown
- **EventForm**: Event creation and editing interface
- **RecurrenceSelector**: UI for setting up recurring events
- **TaskDeadlineOverlay**: Integration layer showing task deadlines on calendar
- **CalendarNavigation**: Date navigation and view switching controls

### API Endpoints
```typescript
// Calendar integration endpoints
POST /calendar/events - Create calendar event
GET /calendar/events - Get events for date range
PUT /calendar/events/:id - Update event
DELETE /calendar/events/:id - Delete event

GET /calendar/events/day/:date - Get day view events
GET /calendar/events/week/:date - Get week view events
GET /calendar/events/month/:date - Get month view events

POST /calendar/events/:id/exceptions - Create recurrence exception
GET /calendar/conflicts - Check for scheduling conflicts
```

---

## Implementation Guidelines

### Technical Requirements
1. **Database Migrations**: All schema changes must include both up and down migrations
2. **Type Safety**: Update all TypeScript interfaces and ensure type safety across the stack
3. **API Versioning**: Maintain backward compatibility with Phase 1 endpoints
4. **Performance**: Optimize queries for large datasets (1000+ tasks, habits, mood entries)
5. **Error Handling**: Comprehensive error handling with user-friendly messages
6. **Data Validation**: Server-side validation for all new data inputs

### User Experience Requirements
1. **Progressive Enhancement**: New features should enhance existing workflows, not replace them
2. **Mobile Responsiveness**: All new UI components must work on mobile devices
3. **Accessibility**: WCAG AAA compliance for all interactive elements
4. **Loading States**: Proper loading indicators for all async operations
5. **Offline Support**: Basic offline functionality for viewing existing data
6. **Data Migration**: Seamless migration of Phase 1 data to enhanced structures

### Testing Requirements
1. **Unit Tests**: Comprehensive tests for all business logic and utilities
2. **Integration Tests**: API endpoint testing with realistic data scenarios
3. **Component Tests**: React component testing with user interaction scenarios
4. **E2E Tests**: Critical user flows for each enhanced feature
5. **Performance Tests**: Load testing for data-heavy operations
6. **Migration Tests**: Verify data integrity during schema migrations

### Success Criteria
- All Phase 1 functionality remains intact and unaffected
- Enhanced features integrate seamlessly with existing workflows
- Performance remains acceptable with significantly more data
- New features have high user adoption rates (>60% within first month)
- User satisfaction scores improve compared to Phase 1 baseline
- No critical bugs or data loss incidents

### Documentation Requirements
- Update API documentation with all new endpoints
- Create user guides for new features
- Document architectural decisions and trade-offs
- Maintain changelog with detailed feature descriptions
- Update development setup instructions
- Document database migration procedures

---

## File Structure Updates

After implementing Phase 2, the project structure should include:

```
tasks/
├── categories.ts         # Task category management
├── tags.ts              # Task tag operations
├── time-tracking.ts     # Time tracking functionality
├── recurring.ts         # Recurring task logic
├── analytics.ts         # Task analytics
└── migrations/
    ├── 002_add_task_categories.up.sql
    ├── 003_add_task_tags.up.sql
    └── 004_add_time_tracking.up.sql

habits/
├── templates.ts         # Habit template management
├── completions.ts      # Enhanced completion tracking
├── streaks.ts          # Streak calculation logic
├── reminders.ts        # Reminder scheduling
└── migrations/
    ├── 002_add_habit_templates.up.sql
    ├── 003_flexible_targets.up.sql
    └── 004_add_reminders.up.sql

mood/
├── triggers.ts         # Mood trigger management
├── patterns.ts         # Pattern analysis
├── insights.ts         # Mood insights generation
└── migrations/
    ├── 002_detailed_mood_tracking.up.sql
    └── 003_mood_triggers.up.sql

calendar/
├── events.ts           # Calendar event management
├── recurrence.ts       # Recurrence rule handling
├── views.ts            # Calendar view queries
├── integration.ts      # Task integration logic
└── migrations/
    ├── 001_create_calendar_events.up.sql
    └── 002_add_recurrence_exceptions.up.sql
```

This prompt provides comprehensive guidance for implementing Phase 2 features while maintaining the existing codebase quality and ensuring seamless integration with Phase 1 functionality.

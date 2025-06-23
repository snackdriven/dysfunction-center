# Meh-trics API Phase 2 Documentation

This document outlines all the enhanced API endpoints available in Phase 2 of the Meh-trics productivity tracking application.

## Table of Contents

1. [Enhanced Task Management](#enhanced-task-management)
2. [Enhanced Habit Tracking](#enhanced-habit-tracking)
3. [Detailed Mood Tracking](#detailed-mood-tracking)
4. [Calendar Integration](#calendar-integration)
5. [Error Handling](#error-handling)
6. [Authentication](#authentication)

---

## Enhanced Task Management

### Core Task Operations (Enhanced)

#### Create Task
- **Endpoint**: `POST /tasks`
- **Description**: Create a new task with enhanced features
- **Request Body**:
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "priority": "high|medium|low (optional, default: medium)",
  "due_date": "YYYY-MM-DD (optional)",
  "category_id": "number (optional)",
  "notes": "string (optional)",
  "estimated_minutes": "number (optional)",
  "parent_task_id": "number (optional)",
  "recurrence_pattern": {
    "type": "daily|weekly|monthly|custom",
    "interval": "number",
    "days_of_week": "[0-6] (optional)",
    "end_date": "YYYY-MM-DD (optional)",
    "occurrences": "number (optional)"
  },
  "tag_ids": "[number] (optional)"
}
```

#### Get Tasks (Enhanced)
- **Endpoint**: `GET /tasks`
- **Description**: Retrieve tasks with advanced filtering
- **Query Parameters**:
  - `completed`: boolean
  - `priority`: high|medium|low
  - `due_before`: YYYY-MM-DD
  - `due_after`: YYYY-MM-DD
  - `category_id`: number
  - `tag_ids`: comma-separated numbers
  - `parent_task_id`: number
  - `has_time_estimate`: boolean
  - `overdue`: boolean
  - `include_subtasks`: boolean
  - `search`: string

### Task Categories

#### Create Category
- **Endpoint**: `POST /tasks/categories`
- **Request Body**:
```json
{
  "name": "string (required)",
  "color": "#RRGGBB (optional)",
  "icon": "string (optional)"
}
```

#### Get Categories
- **Endpoint**: `GET /tasks/categories`
- **Response**: Array of category objects

#### Update Category
- **Endpoint**: `PUT /tasks/categories/:id`

#### Delete Category
- **Endpoint**: `DELETE /tasks/categories/:id`

### Task Tags

#### Create Tag
- **Endpoint**: `POST /tasks/tags`
- **Request Body**:
```json
{
  "name": "string (required)"
}
```

#### Get Tags
- **Endpoint**: `GET /tasks/tags`
- **Query Parameters**:
  - `search`: string (autocomplete search)

#### Delete Tag
- **Endpoint**: `DELETE /tasks/tags/:id`

### Time Tracking

#### Start Time Entry
- **Endpoint**: `POST /tasks/:task_id/time-entries`
- **Request Body**:
```json
{
  "description": "string (optional)"
}
```

#### Stop Time Entry
- **Endpoint**: `PUT /tasks/time-entries/:id/stop`

#### Get Time Entries
- **Endpoint**: `GET /tasks/time-entries`
- **Query Parameters**:
  - `task_id`: number
  - `start_date`: YYYY-MM-DD
  - `end_date`: YYYY-MM-DD

#### Get Active Time Entry
- **Endpoint**: `GET /tasks/:task_id/time-entries/active`

### Bulk Operations

#### Bulk Task Actions
- **Endpoint**: `POST /tasks/bulk-actions`
- **Request Body**:
```json
{
  "task_ids": "[number] (required)",
  "action": "complete|incomplete|delete|assign_category|assign_tags",
  "category_id": "number (optional)",
  "tag_ids": "[number] (optional)"
}
```

### Analytics

#### Task Analytics
- **Endpoint**: `GET /tasks/analytics`
- **Query Parameters**:
  - `start_date`: YYYY-MM-DD
  - `end_date`: YYYY-MM-DD
  - `category_id`: number

---

## Enhanced Habit Tracking

### Core Habit Operations (Enhanced)

#### Create Habit
- **Endpoint**: `POST /habits`
- **Request Body**:
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "category": "health|productivity|personal (optional)",
  "target_frequency": "number (optional, default: 1)",
  "target_type": "daily|weekly|custom (optional, default: daily)",
  "completion_type": "boolean|count|duration (optional, default: boolean)",
  "target_value": "number (optional, default: 1)",
  "unit": "string (optional)",
  "template_id": "number (optional)",
  "reminder_enabled": "boolean (optional, default: false)",
  "reminder_time": "HH:MM (optional)"
}
```

#### Log Habit Completion (Enhanced)
- **Endpoint**: `POST /habits/:habit_id/completions`
- **Request Body**:
```json
{
  "completion_date": "YYYY-MM-DD (optional, default: today)",
  "completed": "boolean (optional, default: true)",
  "notes": "string (optional)",
  "completion_value": "number (optional, default: 1)"
}
```

### Habit Templates

#### Get Templates
- **Endpoint**: `GET /habits/templates`
- **Query Parameters**:
  - `category`: string

#### Create Habit from Template
- **Endpoint**: `POST /habits/from-template/:template_id`
- **Request Body**:
```json
{
  "name": "string (optional, override template name)",
  "target_value": "number (optional, override suggested value)",
  "reminder_enabled": "boolean (optional)",
  "reminder_time": "HH:MM (optional)"
}
```

### Habit Analytics

#### Get Habit Analytics
- **Endpoint**: `GET /habits/analytics`
- **Query Parameters**:
  - `habit_id`: number
  - `start_date`: YYYY-MM-DD
  - `end_date`: YYYY-MM-DD
  - `category`: string

### Reminders

#### Get Upcoming Reminders
- **Endpoint**: `GET /habits/reminders/upcoming`

#### Update Reminder
- **Endpoint**: `PUT /habits/:habit_id/reminders`
- **Request Body**:
```json
{
  "reminder_enabled": "boolean (required)",
  "reminder_time": "HH:MM (optional)"
}
```

---

## Detailed Mood Tracking

### Core Mood Operations (Enhanced)

#### Create Mood Entry
- **Endpoint**: `POST /mood`
- **Request Body**:
```json
{
  "mood_score": "number (1-5, required)",
  "mood_category": "string (optional)",
  "notes": "string (optional)",
  "entry_date": "YYYY-MM-DD (optional, default: today)",
  "secondary_mood": "string (optional)",
  "energy_level": "number (1-10, optional)",
  "stress_level": "number (1-10, optional)",
  "location": "string (optional)",
  "weather": "string (optional)",
  "context_tags": {
    "activities": "[string] (optional)",
    "people": "[string] (optional)",
    "emotions": "[string] (optional)",
    "locations": "[string] (optional)"
  },
  "trigger_ids": "[number] (optional)"
}
```

#### Get Mood Entries (Enhanced)
- **Endpoint**: `GET /mood`
- **Query Parameters**:
  - `start_date`: YYYY-MM-DD
  - `end_date`: YYYY-MM-DD
  - `mood_category`: string
  - `min_score`: number (1-5)
  - `max_score`: number (1-5)
  - `secondary_mood`: string
  - `min_energy`: number (1-10)
  - `max_energy`: number (1-10)
  - `min_stress`: number (1-10)
  - `max_stress`: number (1-10)
  - `location`: string
  - `weather`: string
  - `trigger_ids`: comma-separated numbers
  - `has_triggers`: boolean

### Mood Triggers

#### Create Trigger
- **Endpoint**: `POST /mood/triggers`
- **Request Body**:
```json
{
  "name": "string (required)",
  "category": "work|personal|health|social (optional)",
  "icon": "string (optional)"
}
```

#### Get Triggers
- **Endpoint**: `GET /mood/triggers`
- **Query Parameters**:
  - `category`: string

#### Delete Trigger
- **Endpoint**: `DELETE /mood/triggers/:id`

### Custom Moods

#### Create Custom Mood
- **Endpoint**: `POST /mood/custom-moods`
- **Request Body**:
```json
{
  "name": "string (required)",
  "color": "#RRGGBB (optional)",
  "icon": "string (optional)"
}
```

#### Get Custom Moods
- **Endpoint**: `GET /mood/custom-moods`

#### Update Custom Mood
- **Endpoint**: `PUT /mood/custom-moods/:id`

#### Delete Custom Mood
- **Endpoint**: `DELETE /mood/custom-moods/:id`

### Advanced Analytics

#### Get Mood Patterns
- **Endpoint**: `GET /mood/patterns`
- **Query Parameters**:
  - `start_date`: YYYY-MM-DD
  - `end_date`: YYYY-MM-DD
  - `pattern_type`: daily|weekly|monthly|triggers|correlations

#### Get Mood Insights
- **Endpoint**: `GET /mood/insights`
- **Query Parameters**:
  - `days`: number (default: 30)

---

## Calendar Integration

### Calendar Events

#### Create Event
- **Endpoint**: `POST /calendar/events`
- **Request Body**:
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "start_datetime": "ISO datetime (required)",
  "end_datetime": "ISO datetime (optional)",
  "is_all_day": "boolean (optional, default: false)",
  "location": "string (optional)",
  "color": "#RRGGBB (optional)",
  "recurrence_rule": "RRULE string (optional)",
  "task_id": "number (optional)"
}
```

#### Get Events
- **Endpoint**: `GET /calendar/events`
- **Query Parameters**:
  - `start_date`: YYYY-MM-DD
  - `end_date`: YYYY-MM-DD
  - `task_id`: number
  - `include_tasks`: boolean
  - `include_recurring`: boolean

#### Update Event
- **Endpoint**: `PUT /calendar/events/:id`

#### Delete Event
- **Endpoint**: `DELETE /calendar/events/:id`

### Calendar Views

#### Day View
- **Endpoint**: `GET /calendar/events/day/:date`
- **Parameters**:
  - `date`: YYYY-MM-DD
- **Query Parameters**:
  - `include_tasks`: boolean

#### Week View
- **Endpoint**: `GET /calendar/events/week/:date`
- **Parameters**:
  - `date`: YYYY-MM-DD (any date in the desired week)
- **Query Parameters**:
  - `include_tasks`: boolean

#### Month View
- **Endpoint**: `GET /calendar/events/month/:year/:month`
- **Parameters**:
  - `year`: number
  - `month`: number (1-12)
- **Query Parameters**:
  - `include_tasks`: boolean

### Conflict Detection

#### Check Conflicts
- **Endpoint**: `POST /calendar/conflicts`
- **Request Body**:
```json
{
  "start_datetime": "ISO datetime (required)",
  "end_datetime": "ISO datetime (optional)",
  "exclude_event_id": "number (optional)"
}
```

### Recurrence Exceptions

#### Create Exception
- **Endpoint**: `POST /calendar/events/:id/exceptions`
- **Request Body**:
```json
{
  "exception_date": "YYYY-MM-DD (required)",
  "cancelled": "boolean (optional, default: false)",
  "modified_event": "CreateEventRequest (optional)"
}
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., duplicate name)
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error

---

## Authentication

Currently, the API operates without authentication. When user management is implemented in future phases, all endpoints will require authentication via:

- **Authorization Header**: `Bearer <token>`
- **Session Cookie**: For web applications

---

## Rate Limiting

API requests are currently unlimited. Future implementations will include:

- **Rate Limits**: 1000 requests per hour per IP
- **Burst Limits**: 100 requests per minute
- **Headers**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Data Formats

### Date Formats
- **Date**: YYYY-MM-DD (ISO 8601 date)
- **DateTime**: ISO 8601 datetime with timezone
- **Time**: HH:MM (24-hour format)

### Response Format
All successful responses follow this structure:

```json
{
  "data": {
    // Response data here
  },
  "meta": {
    "timestamp": "ISO datetime",
    "version": "2.0"
  }
}
```

### Pagination
For endpoints returning lists, pagination is available:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 150,
    "total_pages": 3
  }
}
```

---

## Migration from Phase 1

### Breaking Changes
- None. Phase 2 is fully backward compatible with Phase 1 APIs.

### New Optional Fields
- All Phase 2 enhancements are additive
- Existing API calls continue to work unchanged
- New fields in responses are optional and can be safely ignored

### Database Migration
Run the following migrations in order:
1. `002_add_task_categories.up.sql`
2. `003_add_task_tags.up.sql`
3. `004_add_time_tracking.up.sql`
4. `002_add_habit_templates.up.sql`
5. `003_flexible_targets.up.sql`
6. `002_detailed_mood_tracking.up.sql`
7. `001_create_calendar_events.up.sql`
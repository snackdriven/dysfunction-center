# Database Migration Order Guide

To properly deploy Phase 2 of Meh-trics, run the database migrations in the following order:

## Migration Execution Order

### 1. Core Tables (Run these first)
```bash
# Tasks - Core task management
tasks/migrations/001_create_tasks.up.sql

# Habits - Core habit tracking  
habits/migrations/001_create_habits.up.sql

# Mood - Core mood tracking
mood/migrations/001_create_mood_entries.up.sql

# Calendar - Core calendar events (without task foreign key)
calendar/migrations/001_create_calendar_events.up.sql
```

### 2. Task Enhancements
```bash
# Task categories and enhanced fields
tasks/migrations/002_add_task_categories.up.sql

# Task tagging system
tasks/migrations/003_add_task_tags.up.sql

# Time tracking for tasks
tasks/migrations/004_add_time_tracking.up.sql
```

### 3. Habit Enhancements
```bash
# Habit templates
habits/migrations/002_add_habit_templates.up.sql

# Flexible targets and streaks
habits/migrations/003_flexible_targets.up.sql
```

### 4. Mood Enhancements
```bash
# Detailed mood tracking with triggers
mood/migrations/002_detailed_mood_tracking.up.sql
```

### 5. Calendar-Task Integration
```bash
# Add foreign key constraint to link calendar events to tasks
calendar/migrations/002_add_task_foreign_key.up.sql
```

## Verification Steps

After running migrations, verify the setup:

### 1. Check Tables Exist
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- `calendar_events`
- `calendar_event_exceptions`
- `custom_moods`
- `habit_completions`
- `habit_streaks`
- `habit_templates`
- `habits`
- `mood_entries`
- `mood_entry_triggers`
- `mood_triggers`
- `task_categories`
- `task_tag_assignments`
- `task_tags`
- `task_time_entries`
- `tasks`

### 2. Check Foreign Key Constraints
```sql
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

### 3. Check Indexes
```sql
SELECT 
    schemaname, 
    tablename, 
    indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

## Rollback Instructions

If you need to rollback, run the down migrations in reverse order:

### Rollback Order
```bash
# 1. Remove calendar-task integration
calendar/migrations/002_add_task_foreign_key.down.sql

# 2. Remove mood enhancements
mood/migrations/002_detailed_mood_tracking.down.sql

# 3. Remove habit enhancements
habits/migrations/003_flexible_targets.down.sql
habits/migrations/002_add_habit_templates.down.sql

# 4. Remove task enhancements
tasks/migrations/004_add_time_tracking.down.sql
tasks/migrations/003_add_task_tags.down.sql
tasks/migrations/002_add_task_categories.down.sql

# 5. Remove core tables (if needed)
calendar/migrations/001_create_calendar_events.down.sql
mood/migrations/001_create_mood_entries.down.sql
habits/migrations/001_create_habits.down.sql
tasks/migrations/001_create_tasks.down.sql
```

## Troubleshooting

### Common Issues

1. **"relation does not exist" errors**: 
   - Ensure you're running migrations in the correct order
   - Check that prerequisite tables exist before adding foreign keys

2. **Constraint violations**:
   - Verify data integrity before adding constraints
   - Check for orphaned records

3. **Index creation failures**:
   - Ensure columns exist before creating indexes
   - Check for duplicate index names

### Database Service Requirements

Make sure each Encore service's database is properly configured:
- `tasks` service → `task` database
- `habits` service → `habit` database  
- `mood` service → `mood` database
- `calendar` service → `calendar` database

Each service manages its own database schema and migrations independently.
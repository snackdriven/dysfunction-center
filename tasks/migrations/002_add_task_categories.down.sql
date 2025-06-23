-- Remove task category enhancements
ALTER TABLE tasks DROP COLUMN category_id;
ALTER TABLE tasks DROP COLUMN notes;
ALTER TABLE tasks DROP COLUMN estimated_minutes;
ALTER TABLE tasks DROP COLUMN actual_minutes;
ALTER TABLE tasks DROP COLUMN parent_task_id;
ALTER TABLE tasks DROP COLUMN recurrence_pattern;

DROP TABLE task_categories;
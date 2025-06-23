-- Remove flexible targets system
ALTER TABLE habits DROP COLUMN target_type;
ALTER TABLE habits DROP COLUMN completion_type;
ALTER TABLE habits DROP COLUMN target_value;
ALTER TABLE habits DROP COLUMN unit;
ALTER TABLE habits DROP COLUMN template_id;
ALTER TABLE habits DROP COLUMN reminder_enabled;
ALTER TABLE habits DROP COLUMN reminder_time;

ALTER TABLE habit_completions DROP COLUMN completion_value;

DROP TABLE habit_streaks;
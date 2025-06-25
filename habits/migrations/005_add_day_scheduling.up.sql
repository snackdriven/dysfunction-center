-- Add day-of-week scheduling support to habits table
-- This enables custom scheduling patterns beyond daily/weekly/monthly

-- Add schedule pattern column for quick pattern recognition
ALTER TABLE habits ADD COLUMN schedule_pattern VARCHAR(20) DEFAULT 'daily';
-- Values: 'daily', 'weekdays', 'weekends', 'custom'

-- Add scheduled days array for custom day-of-week scheduling
-- Using JSON to store array of days for PostgreSQL compatibility
ALTER TABLE habits ADD COLUMN scheduled_days JSONB;

-- Add constraint to ensure valid schedule patterns
ALTER TABLE habits ADD CONSTRAINT chk_schedule_pattern 
  CHECK (schedule_pattern IN ('daily', 'weekdays', 'weekends', 'custom'));

-- Create index for schedule pattern queries
CREATE INDEX idx_habits_schedule_pattern ON habits(schedule_pattern);

-- Create index for scheduled days queries (useful for finding habits for specific days)
CREATE INDEX idx_habits_scheduled_days ON habits USING GIN(scheduled_days);

-- Update existing habits to have default scheduling
-- All existing habits should be set to 'daily' (which was the implicit default)
UPDATE habits 
SET schedule_pattern = 'daily', 
    scheduled_days = '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]'::jsonb
WHERE schedule_pattern IS NULL OR scheduled_days IS NULL;

-- Add helpful comments
COMMENT ON COLUMN habits.schedule_pattern IS 'Quick pattern for habit scheduling: daily, weekdays, weekends, or custom';
COMMENT ON COLUMN habits.scheduled_days IS 'JSON array of day names for custom scheduling (e.g., ["monday", "wednesday", "friday"])';

-- Examples of scheduled_days values:
-- Daily: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
-- Weekdays: ["monday", "tuesday", "wednesday", "thursday", "friday"]  
-- Weekends: ["saturday", "sunday"]
-- Custom: ["monday", "wednesday", "friday"] or any combination
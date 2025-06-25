-- Remove day-of-week scheduling support from habits table
-- This will revert the table to its previous state

-- Drop indexes
DROP INDEX IF EXISTS idx_habits_schedule_pattern;
DROP INDEX IF EXISTS idx_habits_scheduled_days;

-- Remove constraints
ALTER TABLE habits DROP CONSTRAINT IF EXISTS chk_schedule_pattern;

-- Remove columns
ALTER TABLE habits DROP COLUMN IF EXISTS schedule_pattern;
ALTER TABLE habits DROP COLUMN IF EXISTS scheduled_days;
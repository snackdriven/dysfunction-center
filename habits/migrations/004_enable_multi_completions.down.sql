-- Rollback migration to restore unique constraint
-- WARNING: This will prevent multiple completions per day and may cause data loss
-- if multiple completions exist for the same habit on the same day

-- Remove the new indexes
DROP INDEX IF EXISTS idx_habit_completions_habit_date;
DROP INDEX IF EXISTS idx_habit_completions_created_at;
DROP INDEX IF EXISTS idx_habit_completions_timestamp;
DROP INDEX IF EXISTS idx_habit_completions_habit_timestamp;

-- Remove the completion_timestamp column
ALTER TABLE habit_completions DROP COLUMN IF EXISTS completion_timestamp;

-- Restore the unique constraint
-- NOTE: This will fail if there are multiple completions per day for any habit
-- In that case, you would need to manually clean up the data first
CREATE UNIQUE INDEX idx_habit_completions_unique ON habit_completions(habit_id, completion_date);
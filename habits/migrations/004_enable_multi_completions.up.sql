-- Remove unique constraint to enable multiple habit completions per day
-- This is essential for multi-count habits (e.g., "drink 6 glasses of water")

-- Drop the unique constraint that prevents multiple completions per day
DROP INDEX IF EXISTS idx_habit_completions_unique;

-- Add a composite index for better performance while allowing multiple entries
CREATE INDEX idx_habit_completions_habit_date ON habit_completions(habit_id, completion_date);

-- Add an index on created_at for timestamp-based queries
CREATE INDEX idx_habit_completions_created_at ON habit_completions(created_at);

-- Add completion_timestamp column to track exact time of completion
-- This enables multiple completions per day with precise timestamps
ALTER TABLE habit_completions ADD COLUMN completion_timestamp TIMESTAMPTZ DEFAULT NOW();

-- Update existing records to have proper completion timestamps
-- Use created_at as the completion timestamp for existing records
UPDATE habit_completions 
SET completion_timestamp = created_at 
WHERE completion_timestamp IS NULL;

-- Make completion_timestamp NOT NULL after updating existing records
ALTER TABLE habit_completions ALTER COLUMN completion_timestamp SET NOT NULL;

-- Add index on completion_timestamp for performance
CREATE INDEX idx_habit_completions_timestamp ON habit_completions(completion_timestamp);

-- Add index for queries that need both habit_id and timestamp ordering
CREATE INDEX idx_habit_completions_habit_timestamp ON habit_completions(habit_id, completion_timestamp);
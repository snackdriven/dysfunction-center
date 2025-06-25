-- Remove shared user_preferences table from habits service
-- This reverts the changes made in 006_add_shared_user_preferences.up.sql

-- Drop indexes first
DROP INDEX IF EXISTS idx_user_preferences_unique;
DROP INDEX IF EXISTS idx_user_preferences_key;
DROP INDEX IF EXISTS idx_user_preferences_user_id;

-- Drop the table
DROP TABLE IF EXISTS user_preferences;
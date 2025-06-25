-- Remove user_preferences table and related indexes
-- This reverts the changes made in 001_create_user_preferences.up.sql

-- Drop indexes first
DROP INDEX IF EXISTS idx_user_preferences_unique;
DROP INDEX IF EXISTS idx_user_preferences_key;
DROP INDEX IF EXISTS idx_user_preferences_user_id;

-- Drop the table
DROP TABLE IF EXISTS user_preferences;
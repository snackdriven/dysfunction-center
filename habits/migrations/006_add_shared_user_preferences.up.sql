-- Create shared user_preferences table for the habits service
-- This allows the habits service to access preferences when the preferences service is not available
-- Note: This creates the same table structure as in the preferences service

CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) DEFAULT 'default_user',
  preference_key VARCHAR(100) NOT NULL,
  preference_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_unique ON user_preferences(user_id, preference_key);

-- Insert default preferences if they don't exist
INSERT INTO user_preferences (preference_key, preference_value) 
VALUES ('end_of_day_time', '23:59')
ON CONFLICT (user_id, preference_key) DO NOTHING;

INSERT INTO user_preferences (preference_key, preference_value) 
VALUES ('theme', 'light')
ON CONFLICT (user_id, preference_key) DO NOTHING;
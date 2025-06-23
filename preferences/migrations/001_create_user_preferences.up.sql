-- Create user_preferences table for theme and other preferences
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) DEFAULT 'default_user', -- for future multi-user support
  preference_key VARCHAR(100) NOT NULL,
  preference_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);
CREATE UNIQUE INDEX idx_user_preferences_unique ON user_preferences(user_id, preference_key);

-- Insert default theme preference
INSERT INTO user_preferences (preference_key, preference_value) 
VALUES ('theme', 'light');

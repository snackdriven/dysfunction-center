-- Add detailed mood tracking features to existing mood_entries table
ALTER TABLE mood_entries ADD COLUMN secondary_mood VARCHAR(50);
ALTER TABLE mood_entries ADD COLUMN energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10);
ALTER TABLE mood_entries ADD COLUMN stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10);
ALTER TABLE mood_entries ADD COLUMN location VARCHAR(100);
ALTER TABLE mood_entries ADD COLUMN weather VARCHAR(50);
ALTER TABLE mood_entries ADD COLUMN context_tags JSONB;

-- Create mood triggers system
CREATE TABLE mood_triggers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- work, personal, health, social
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mood_entry_triggers (
    mood_entry_id INTEGER REFERENCES mood_entries(id) ON DELETE CASCADE,
    trigger_id INTEGER REFERENCES mood_triggers(id) ON DELETE CASCADE,
    PRIMARY KEY (mood_entry_id, trigger_id)
);

-- Create custom moods table for user-defined moods
CREATE TABLE custom_moods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL DEFAULT 1, -- placeholder for when user management is added
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_mood_entries_secondary_mood ON mood_entries(secondary_mood);
CREATE INDEX idx_mood_entries_energy_level ON mood_entries(energy_level);
CREATE INDEX idx_mood_entries_stress_level ON mood_entries(stress_level);
CREATE INDEX idx_mood_entries_location ON mood_entries(location);
CREATE INDEX idx_mood_entries_weather ON mood_entries(weather);
CREATE INDEX idx_mood_entries_context_tags ON mood_entries USING GIN(context_tags);

CREATE INDEX idx_mood_triggers_category ON mood_triggers(category);
CREATE INDEX idx_mood_triggers_name ON mood_triggers(name);
CREATE INDEX idx_mood_entry_triggers_mood_id ON mood_entry_triggers(mood_entry_id);
CREATE INDEX idx_mood_entry_triggers_trigger_id ON mood_entry_triggers(trigger_id);

CREATE INDEX idx_custom_moods_user_id ON custom_moods(user_id);
CREATE INDEX idx_custom_moods_name ON custom_moods(name);

-- Insert default mood triggers
INSERT INTO mood_triggers (name, category, icon) VALUES 
('Work Stress', 'work', 'briefcase'),
('Deadline Pressure', 'work', 'clock'),
('Team Meeting', 'work', 'users'),
('Presentation', 'work', 'presentation'),
('Exercise', 'health', 'activity'),
('Good Sleep', 'health', 'moon'),
('Poor Sleep', 'health', 'sunrise'),
('Healthy Meal', 'health', 'apple'),
('Social Event', 'social', 'heart'),
('Family Time', 'social', 'home'),
('Friend Hangout', 'social', 'coffee'),
('Alone Time', 'personal', 'user'),
('Accomplished Goal', 'personal', 'check-circle'),
('Learned Something', 'personal', 'book'),
('Weather Change', 'personal', 'cloud'),
('Financial Concern', 'personal', 'dollar-sign');
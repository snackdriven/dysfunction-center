-- Create habit templates for common habits
CREATE TABLE habit_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    suggested_target_type VARCHAR(20) DEFAULT 'daily', -- daily, weekly, custom
    suggested_target_value DECIMAL(10,2) DEFAULT 1,
    suggested_unit VARCHAR(50), -- minutes, reps, pages, etc.
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_habit_templates_category ON habit_templates(category);
CREATE INDEX idx_habit_templates_name ON habit_templates(name);

-- Insert common habit templates
INSERT INTO habit_templates (name, description, category, suggested_target_type, suggested_target_value, suggested_unit, icon) VALUES 
('Drink Water', 'Stay hydrated throughout the day', 'health', 'daily', 8, 'glasses', 'droplet'),
('Exercise', 'Physical activity and fitness', 'health', 'daily', 30, 'minutes', 'zap'),
('Meditate', 'Mindfulness and mental wellness', 'health', 'daily', 10, 'minutes', 'circle'),
('Read', 'Daily reading habit', 'personal', 'daily', 30, 'minutes', 'book'),
('Write Journal', 'Daily reflection and writing', 'personal', 'daily', 1, 'entry', 'edit-3'),
('Take Vitamins', 'Daily vitamin supplement', 'health', 'daily', 1, 'dose', 'plus-circle'),
('Walk', 'Daily walking for health', 'health', 'daily', 10000, 'steps', 'activity'),
('Learn Language', 'Practice language learning', 'productivity', 'daily', 15, 'minutes', 'globe'),
('Stretch', 'Daily stretching routine', 'health', 'daily', 10, 'minutes', 'move'),
('No Social Media', 'Limit social media usage', 'productivity', 'daily', 1, 'day', 'smartphone');
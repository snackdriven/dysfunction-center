-- Add flexible target system to existing habits table
ALTER TABLE habits ADD COLUMN target_type VARCHAR(20) DEFAULT 'daily'; -- daily, weekly, custom
ALTER TABLE habits ADD COLUMN completion_type VARCHAR(20) DEFAULT 'boolean'; -- boolean, count, duration
ALTER TABLE habits ADD COLUMN target_value DECIMAL(10,2) DEFAULT 1;
ALTER TABLE habits ADD COLUMN unit VARCHAR(50); -- minutes, reps, pages, etc.
ALTER TABLE habits ADD COLUMN template_id INTEGER REFERENCES habit_templates(id);
ALTER TABLE habits ADD COLUMN reminder_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE habits ADD COLUMN reminder_time TIME;

-- Update habit_completions to support flexible completion values
ALTER TABLE habit_completions ADD COLUMN completion_value DECIMAL(10,2) DEFAULT 1;

-- Create habit streaks tracking table
CREATE TABLE habit_streaks (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    streak_length INTEGER NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_habits_target_type ON habits(target_type);
CREATE INDEX idx_habits_completion_type ON habits(completion_type);
CREATE INDEX idx_habits_template_id ON habits(template_id);
CREATE INDEX idx_habit_streaks_habit_id ON habit_streaks(habit_id);
CREATE INDEX idx_habit_streaks_current ON habit_streaks(is_current);

-- Ensure only one current streak per habit
CREATE UNIQUE INDEX idx_habit_streaks_unique_current ON habit_streaks(habit_id) WHERE is_current = true;
-- Create time tracking system for tasks
CREATE TABLE task_time_entries (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for time tracking performance
CREATE INDEX idx_task_time_entries_task_id ON task_time_entries(task_id);
CREATE INDEX idx_task_time_entries_start_time ON task_time_entries(start_time);
CREATE INDEX idx_task_time_entries_end_time ON task_time_entries(end_time);

-- Add constraint to ensure end_time is after start_time when both are present
ALTER TABLE task_time_entries ADD CONSTRAINT chk_time_entry_valid_range 
CHECK (end_time IS NULL OR end_time > start_time);
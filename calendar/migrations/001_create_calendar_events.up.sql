-- Create calendar events table
CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    is_all_day BOOLEAN DEFAULT FALSE,
    location VARCHAR(200),
    color VARCHAR(7), -- hex color
    recurrence_rule TEXT, -- RRULE format for recurring events
    task_id INTEGER, -- Will add foreign key constraint later if tasks table exists
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar event exceptions table for recurring event modifications
CREATE TABLE calendar_event_exceptions (
    id SERIAL PRIMARY KEY,
    parent_event_id INTEGER REFERENCES calendar_events(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    cancelled BOOLEAN DEFAULT FALSE,
    modified_event_id INTEGER REFERENCES calendar_events(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient date range queries
CREATE INDEX idx_calendar_events_date_range ON calendar_events(start_datetime, end_datetime);
CREATE INDEX idx_calendar_events_start_datetime ON calendar_events(start_datetime);
CREATE INDEX idx_calendar_events_end_datetime ON calendar_events(end_datetime);
CREATE INDEX idx_calendar_events_recurrence ON calendar_events(recurrence_rule) WHERE recurrence_rule IS NOT NULL;
CREATE INDEX idx_calendar_events_title ON calendar_events(title);

CREATE INDEX idx_calendar_event_exceptions_parent ON calendar_event_exceptions(parent_event_id);
CREATE INDEX idx_calendar_event_exceptions_date ON calendar_event_exceptions(exception_date);

-- Add constraint to ensure end_datetime is after start_datetime for non-all-day events
ALTER TABLE calendar_events ADD CONSTRAINT chk_calendar_event_valid_time_range 
CHECK (
    is_all_day = TRUE OR 
    end_datetime IS NULL OR 
    end_datetime > start_datetime
);
-- Create mood_entries table for mood logging
CREATE TABLE mood_entries (
  id SERIAL PRIMARY KEY,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5) NOT NULL,
  mood_category VARCHAR(50), -- optional category like 'work', 'personal', etc.
  notes TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_mood_entries_date ON mood_entries(entry_date);
CREATE INDEX idx_mood_entries_score ON mood_entries(mood_score);
CREATE INDEX idx_mood_entries_category ON mood_entries(mood_category);
CREATE UNIQUE INDEX idx_mood_entries_unique_date ON mood_entries(entry_date);

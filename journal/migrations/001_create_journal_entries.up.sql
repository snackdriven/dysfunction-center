-- Create journal entries table
CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  mood_reference INTEGER, -- References mood_entries(id) but no FK constraint for flexibility
  tags JSONB DEFAULT '[]',
  privacy_level VARCHAR(20) DEFAULT 'private' CHECK (privacy_level IN ('private', 'shared', 'public')),
  related_tasks JSONB DEFAULT '[]',
  related_habits JSONB DEFAULT '[]',
  productivity_score INTEGER CHECK (productivity_score >= 1 AND productivity_score <= 10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX idx_journal_entries_updated_at ON journal_entries(updated_at);
CREATE INDEX idx_journal_entries_privacy_level ON journal_entries(privacy_level);
CREATE INDEX idx_journal_entries_mood_reference ON journal_entries(mood_reference);
CREATE INDEX idx_journal_entries_productivity_score ON journal_entries(productivity_score);

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_journal_entries_tags ON journal_entries USING GIN (tags);
CREATE INDEX idx_journal_entries_related_tasks ON journal_entries USING GIN (related_tasks);
CREATE INDEX idx_journal_entries_related_habits ON journal_entries USING GIN (related_habits);

-- Full text search index on title and content
CREATE INDEX idx_journal_entries_fulltext ON journal_entries USING GIN (to_tsvector('english', title || ' ' || content));

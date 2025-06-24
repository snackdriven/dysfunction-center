-- Create journal templates table
CREATE TABLE journal_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  prompts JSONB NOT NULL DEFAULT '[]',
  category VARCHAR(50) NOT NULL CHECK (category IN ('reflection', 'planning', 'gratitude', 'productivity')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_journal_templates_category ON journal_templates(category);
CREATE INDEX idx_journal_templates_is_active ON journal_templates(is_active);
CREATE INDEX idx_journal_templates_created_at ON journal_templates(created_at);

-- Insert default templates
INSERT INTO journal_templates (name, description, prompts, category) VALUES
('Daily Reflection', 'A simple daily reflection template', 
 '["What am I grateful for today?", "What did I learn today?", "What could I have done better?", "What are my goals for tomorrow?"]', 
 'reflection'),

('Weekly Review', 'Weekly review and planning template', 
 '["What were my biggest achievements this week?", "What challenges did I face?", "What patterns do I notice in my mood and energy?", "What are my priorities for next week?"]', 
 'reflection'),

('Morning Intentions', 'Start your day with clear intentions', 
 '["How am I feeling this morning?", "What are my top 3 priorities today?", "What am I looking forward to?", "How can I make today meaningful?"]', 
 'planning'),

('Evening Review', 'End your day with reflection and planning', 
 '["How did today go overall?", "What am I proud of accomplishing?", "What would I do differently?", "What am I grateful for from today?"]', 
 'reflection'),

('Gratitude Practice', 'Focus on gratitude and positive moments', 
 '["What are 3 things I''m grateful for today?", "Who made a positive impact on my day?", "What small moment brought me joy?", "What am I looking forward to?"]', 
 'gratitude'),

('Productivity Review', 'Analyze your productivity and efficiency', 
 '["What did I accomplish today?", "What helped me stay focused?", "What distracted me or held me back?", "How can I improve my productivity tomorrow?"]', 
 'productivity'),

('Problem Solving', 'Work through challenges and decisions', 
 '["What problem or challenge am I facing?", "What are my options?", "What are the pros and cons of each option?", "What would I advise a friend in this situation?"]', 
 'planning'),

('Mood Check-in', 'Deep dive into your emotional state', 
 '["How am I feeling right now?", "What might be contributing to this mood?", "What do I need right now?", "What small step can I take to care for myself?"]', 
 'reflection');

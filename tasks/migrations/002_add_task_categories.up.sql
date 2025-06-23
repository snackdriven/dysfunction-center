-- Add task categories and related enhancements
CREATE TABLE task_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7), -- hex color
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns to existing tasks table
ALTER TABLE tasks ADD COLUMN category_id INTEGER REFERENCES task_categories(id);
ALTER TABLE tasks ADD COLUMN notes TEXT;
ALTER TABLE tasks ADD COLUMN estimated_minutes INTEGER;
ALTER TABLE tasks ADD COLUMN actual_minutes INTEGER;
ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id);
ALTER TABLE tasks ADD COLUMN recurrence_pattern JSONB;

-- Create indexes for better performance
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_task_categories_name ON task_categories(name);

-- Insert some default categories
INSERT INTO task_categories (name, color, icon) VALUES 
('Work', '#3B82F6', 'briefcase'),
('Personal', '#10B981', 'user'),
('Health', '#EF4444', 'heart'),
('Learning', '#8B5CF6', 'book'),
('Errands', '#F59E0B', 'shopping-cart');
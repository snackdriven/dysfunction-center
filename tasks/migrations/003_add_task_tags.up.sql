-- Create task tags system
CREATE TABLE task_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_tag_assignments (
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES task_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_task_tags_name ON task_tags(name);
CREATE INDEX idx_task_tag_assignments_task_id ON task_tag_assignments(task_id);
CREATE INDEX idx_task_tag_assignments_tag_id ON task_tag_assignments(tag_id);

-- Insert some common tags
INSERT INTO task_tags (name) VALUES 
('urgent'),
('important'),
('quick'),
('meeting'),
('email'),
('call'),
('research'),
('review'),
('planning'),
('follow-up');
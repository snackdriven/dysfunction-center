-- Add foreign key constraint to task_id if tasks table exists
-- This migration should be run after the tasks migrations

-- Check if tasks table exists before adding the constraint
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        -- Add foreign key constraint
        ALTER TABLE calendar_events 
        ADD CONSTRAINT fk_calendar_events_task_id 
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL;
        
        -- Add index for the foreign key
        CREATE INDEX idx_calendar_events_task_id ON calendar_events(task_id);
        
        RAISE NOTICE 'Added foreign key constraint for task_id';
    ELSE
        RAISE NOTICE 'Tasks table does not exist, skipping foreign key constraint';
    END IF;
END $$;
-- Remove foreign key constraint for task_id
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_calendar_events_task_id' 
        AND table_name = 'calendar_events'
    ) THEN
        ALTER TABLE calendar_events DROP CONSTRAINT fk_calendar_events_task_id;
        DROP INDEX IF EXISTS idx_calendar_events_task_id;
        RAISE NOTICE 'Removed foreign key constraint for task_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint does not exist, nothing to remove';
    END IF;
END $$;
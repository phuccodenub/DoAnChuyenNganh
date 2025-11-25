-- Fix course_id NOT NULL constraint in live_sessions table
-- Run this SQL script directly in your PostgreSQL database

ALTER TABLE live_sessions 
ALTER COLUMN course_id DROP NOT NULL;

-- Verify the change
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'live_sessions' 
AND column_name = 'course_id';


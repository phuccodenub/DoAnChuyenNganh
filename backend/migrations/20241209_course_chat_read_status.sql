-- Create course_chat_read_status table
-- This table tracks when each user last read messages in a course chat

CREATE TABLE IF NOT EXISTS course_chat_read_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Ensure one record per user per course
    CONSTRAINT course_chat_read_status_course_user_unique UNIQUE (course_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS course_chat_read_status_user_id_idx ON course_chat_read_status(user_id);
CREATE INDEX IF NOT EXISTS course_chat_read_status_course_id_idx ON course_chat_read_status(course_id);

-- Add comment
COMMENT ON TABLE course_chat_read_status IS 'Tracks when each user last read messages in course chats for unread count calculation';

-- Migration: Create chat_messages table for Supabase
-- Date: 2025-12-05
-- Description: Add chat functionality for course discussions

-- Create ENUM type for message types (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_chat_messages_message_type') THEN
        CREATE TYPE enum_chat_messages_message_type AS ENUM ('text', 'file', 'image', 'system', 'announcement');
    END IF;
END $$;

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON UPDATE CASCADE ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type enum_chat_messages_message_type DEFAULT 'text',
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    reply_to UUID REFERENCES chat_messages(id) ON UPDATE CASCADE ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_course_id ON chat_messages(course_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to ON chat_messages(reply_to);

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read messages from courses they are enrolled in or teaching
CREATE POLICY "Users can read course messages" ON chat_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM enrollments 
            WHERE enrollments.course_id = chat_messages.course_id 
            AND enrollments.user_id = auth.uid()
            AND enrollments.status = 'active'
        )
        OR
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = chat_messages.course_id 
            AND courses.instructor_id = auth.uid()
        )
    );

-- Create policy: Users can insert messages to courses they have access to
CREATE POLICY "Users can send course messages" ON chat_messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND (
            EXISTS (
                SELECT 1 FROM enrollments 
                WHERE enrollments.course_id = chat_messages.course_id 
                AND enrollments.user_id = auth.uid()
                AND enrollments.status = 'active'
            )
            OR
            EXISTS (
                SELECT 1 FROM courses 
                WHERE courses.id = chat_messages.course_id 
                AND courses.instructor_id = auth.uid()
            )
        )
    );

-- Create policy: Users can update their own messages
CREATE POLICY "Users can update own messages" ON chat_messages
    FOR UPDATE
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Create policy: Users can delete their own messages
CREATE POLICY "Users can delete own messages" ON chat_messages
    FOR DELETE
    USING (sender_id = auth.uid());

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chat_messages_updated_at_trigger ON chat_messages;
CREATE TRIGGER chat_messages_updated_at_trigger
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_messages_updated_at();

-- Grant permissions (for service role access from backend)
GRANT ALL ON chat_messages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages TO authenticated;

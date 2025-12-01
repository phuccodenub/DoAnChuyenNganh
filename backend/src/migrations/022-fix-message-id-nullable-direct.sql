-- Direct SQL migration to fix message_id nullable
-- This ensures the column allows NULL

ALTER TABLE comment_moderations 
ALTER COLUMN message_id DROP NOT NULL;


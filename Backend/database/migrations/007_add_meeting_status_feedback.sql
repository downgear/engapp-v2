-- Migration: Add meeting status and feedback fields to bookings
-- Date: 2026-01-31
-- Description: Add meeting status tracking and feedback/rating system

-- Add meeting status field
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_status VARCHAR(50) DEFAULT 'pending';

-- Add ended_at timestamp
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP;

-- Add teacher feedback
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS teacher_feedback TEXT;

-- Add student rating (1-5 stars)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS student_rating INTEGER;

-- Add student comment
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS student_comment TEXT;

-- Add constraint for student_rating
ALTER TABLE bookings ADD CONSTRAINT IF NOT EXISTS check_student_rating 
  CHECK (student_rating IS NULL OR (student_rating >= 1 AND student_rating <= 5));

-- Create index for meeting status
CREATE INDEX IF NOT EXISTS idx_bookings_meeting_status ON bookings(meeting_status);

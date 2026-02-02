-- Migration: Add teacher_id to cohort_courses table
-- Description: Allows assigning a teacher to each cohort course

-- Add teacher_id column
ALTER TABLE cohort_courses ADD COLUMN teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_cohort_courses_teacher_id ON cohort_courses(teacher_id);

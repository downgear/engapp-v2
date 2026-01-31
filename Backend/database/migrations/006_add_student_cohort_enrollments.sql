-- Migration: Add student cohort enrollments table
-- Date: 2026-01-31
-- Description: Track which students are enrolled in which cohort courses and their payment status

CREATE TABLE IF NOT EXISTS student_cohort_enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    cohort_course_id INTEGER NOT NULL REFERENCES cohort_courses(id) ON DELETE CASCADE,
    paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMP,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, cohort_course_id)
);

CREATE INDEX IF NOT EXISTS idx_sce_student_id ON student_cohort_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_sce_cohort_course_id ON student_cohort_enrollments(cohort_course_id);
CREATE INDEX IF NOT EXISTS idx_sce_paid ON student_cohort_enrollments(paid);

-- Migration: Add payment columns to enrollments table
-- Run this if you have an existing database

-- For PostgreSQL:
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS paid BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP NULL;

-- For SQLite (run each line separately, SQLite doesn't support IF NOT EXISTS for columns):
-- ALTER TABLE enrollments ADD COLUMN paid BOOLEAN NOT NULL DEFAULT 0;
-- ALTER TABLE enrollments ADD COLUMN paid_at DATETIME NULL;

-- Migration: Add Google Meet integration
-- Date: 2026-01-26
-- Description: Add meeting_link to bookings and create teacher_google_tokens table

-- Add meeting_link and google_event_id to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_link TEXT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS google_event_id TEXT NULL;

-- Create teacher_google_tokens table to store OAuth tokens
CREATE TABLE IF NOT EXISTS teacher_google_tokens (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL UNIQUE REFERENCES teachers(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP NOT NULL,
    scope TEXT,
    google_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teacher_google_tokens_teacher_id ON teacher_google_tokens(teacher_id);

-- For SQLite (uncomment if using SQLite):
-- ALTER TABLE bookings ADD COLUMN meeting_link TEXT NULL;
-- ALTER TABLE bookings ADD COLUMN google_event_id TEXT NULL;
-- 
-- CREATE TABLE IF NOT EXISTS teacher_google_tokens (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     teacher_id INTEGER NOT NULL UNIQUE,
--     access_token TEXT NOT NULL,
--     refresh_token TEXT NOT NULL,
--     token_type TEXT DEFAULT 'Bearer',
--     expires_at DATETIME NOT NULL,
--     scope TEXT,
--     google_email TEXT,
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
-- );

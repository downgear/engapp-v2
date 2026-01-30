-- =============================================
-- Migration 002: Add User Management Features
-- - Add is_locked column to users table
-- - Add admin role to users table
-- - Create login_sessions table for tracking
-- =============================================

-- Add is_locked column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;

-- Update role constraint to include 'admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('student', 'parent', 'teacher', 'admin'));

-- Create login_sessions table for tracking user logins
CREATE TABLE IF NOT EXISTS login_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_login_sessions_logged_in_at ON login_sessions(logged_in_at);

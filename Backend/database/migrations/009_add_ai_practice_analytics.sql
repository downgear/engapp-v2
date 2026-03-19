-- Add analytics fields for AI speaking sessions (no score-focused evaluation)
ALTER TABLE ai_feedback
ADD COLUMN IF NOT EXISTS speech_to_text TEXT,
ADD COLUMN IF NOT EXISTS response_duration REAL,
ADD COLUMN IF NOT EXISTS pause_detection JSONB,
ADD COLUMN IF NOT EXISTS session_length REAL;

-- Keep overall_score for backward compatibility with old records

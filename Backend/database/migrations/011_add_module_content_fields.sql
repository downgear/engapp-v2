-- Migration 011: Add content fields for the 3 weekly parts of each module
-- Part 1: Monday (offline class practice)
-- Part 2: Tuesday-Thursday (AI practice)
-- Part 3: Friday-Sunday (practice with foreign teacher)

ALTER TABLE modules
  ADD COLUMN IF NOT EXISTS monday_content JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ai_practice_content JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS teacher_session_content JSONB DEFAULT NULL;

COMMENT ON COLUMN modules.monday_content IS 'Content for Monday offline class: vocabulary, grammar, activities, notes';
COMMENT ON COLUMN modules.ai_practice_content IS 'Content for Tue-Thu AI practice: topics, exercises, notes';
COMMENT ON COLUMN modules.teacher_session_content IS 'Content for Fri-Sun foreign teacher session: goals, focus, notes';

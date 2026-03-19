-- Remove old detailed-evaluation fields (score-based model)
ALTER TABLE ai_feedback
DROP COLUMN IF EXISTS pronunciation_notes,
DROP COLUMN IF EXISTS grammar_notes,
DROP COLUMN IF EXISTS fluency_notes,
DROP COLUMN IF EXISTS vocabulary_notes,
DROP COLUMN IF EXISTS overall_score;

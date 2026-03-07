-- Migration 008: Add weekly_focus table for 3L model data linking
-- Links offline class → AI practice → Mentor session

CREATE TABLE IF NOT EXISTS weekly_focus (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    week_topic VARCHAR(255) NOT NULL,
    speaking_goals TEXT[] DEFAULT '{}',
    teacher_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, teacher_id)
);

CREATE INDEX idx_weekly_focus_module ON weekly_focus(module_id);
CREATE INDEX idx_weekly_focus_teacher ON weekly_focus(teacher_id);

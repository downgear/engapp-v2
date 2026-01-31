-- Migration: Add Programs and Cohorts tables
-- Date: 2026-01-31
-- Description: Create programs, cohorts, and cohort_courses tables for course management

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cohorts table
CREATE TABLE IF NOT EXISTS cohorts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'upcoming',
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cohort_courses table (links cohorts to courses)
CREATE TABLE IF NOT EXISTS cohort_courses (
    id SERIAL PRIMARY KEY,
    cohort_id INTEGER NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    level VARCHAR(50) DEFAULT 'basic',
    display_name VARCHAR(255),
    description TEXT,
    enrolled_students INTEGER DEFAULT 0,
    max_students INTEGER DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cohort_id, course_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cohorts_program_id ON cohorts(program_id);
CREATE INDEX IF NOT EXISTS idx_cohort_courses_cohort_id ON cohort_courses(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_courses_course_id ON cohort_courses(course_id);

-- Insert default program and cohort
INSERT INTO programs (name, description) 
VALUES ('Chương trình Tiếng Anh Giao tiếp', 'Chương trình học tiếng Anh giao tiếp toàn diện dành cho người Việt')
ON CONFLICT DO NOTHING;

-- Get the program ID and insert cohort
DO $$
DECLARE
    program_id_val INTEGER;
    cohort_id_val INTEGER;
    course_id_val INTEGER;
BEGIN
    SELECT id INTO program_id_val FROM programs WHERE name = 'Chương trình Tiếng Anh Giao tiếp' LIMIT 1;
    
    IF program_id_val IS NOT NULL THEN
        -- Insert cohort
        INSERT INTO cohorts (name, start_date, status, program_id)
        VALUES ('Khóa Khai Giảng Tháng 1/2026', '2026-01-15', 'active', program_id_val)
        ON CONFLICT DO NOTHING;
        
        SELECT id INTO cohort_id_val FROM cohorts WHERE program_id = program_id_val LIMIT 1;
        
        IF cohort_id_val IS NOT NULL THEN
            -- Link existing course to cohort (basic level)
            SELECT id INTO course_id_val FROM courses LIMIT 1;
            IF course_id_val IS NOT NULL THEN
                INSERT INTO cohort_courses (cohort_id, course_id, level, display_name, description, enrolled_students, max_students)
                VALUES (cohort_id_val, course_id_val, 'basic', 'Khóa Cơ Bản', 'Khóa học dành cho người mới bắt đầu, xây dựng nền tảng vững chắc', 12, 20)
                ON CONFLICT (cohort_id, course_id) DO NOTHING;
                
                -- Also add as advanced (same course for demo)
                INSERT INTO cohort_courses (cohort_id, course_id, level, display_name, description, enrolled_students, max_students)
                SELECT cohort_id_val, course_id_val, 'advanced', 'Khóa Nâng Cao', 'Khóa học nâng cao kỹ năng giao tiếp chuyên nghiệp', 0, 15
                WHERE NOT EXISTS (
                    SELECT 1 FROM cohort_courses WHERE cohort_id = cohort_id_val AND level = 'advanced'
                );
            END IF;
        END IF;
    END IF;
END $$;

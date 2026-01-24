-- =============================================
-- LINGRISER DATABASE SCHEMA
-- PostgreSQL (Neon) Database
-- =============================================

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

-- Base users table (all roles share this)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'teacher')),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student-specific data
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    grade TEXT, -- e.g., "Lớp 8", "Lớp 10"
    cefr_level TEXT, -- e.g., "A2", "B1", "B1+"
    assigned_inperson_teacher_id INTEGER, -- Fixed teacher for in-person classes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Parent-specific data
CREATE TABLE parents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Teacher-specific data
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    teacher_type TEXT NOT NULL CHECK (teacher_type IN ('in_person', 'video_call', 'both')),
    bio TEXT,
    specialties TEXT, -- JSON array of specialties
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add foreign key for students.assigned_inperson_teacher_id after teachers table is created
ALTER TABLE students ADD CONSTRAINT fk_students_teacher FOREIGN KEY (assigned_inperson_teacher_id) REFERENCES teachers(id);

-- Account linking (student links to parent/teacher via phone)
CREATE TABLE account_links (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    linked_user_id INTEGER NOT NULL,
    link_type TEXT NOT NULL CHECK (link_type IN ('parent', 'teacher')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, linked_user_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (linked_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- COURSE & MODULES
-- =============================================

-- Course (single course/cohort)
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_open_date DATE NOT NULL,
    registration_close_date DATE NOT NULL,
    price INTEGER NOT NULL, -- in VND
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'in_progress', 'completed')),
    class_day TEXT NOT NULL DEFAULT 'monday', -- Day of week for in-person class
    class_start_time TEXT NOT NULL DEFAULT '08:00', -- e.g., "08:00"
    class_end_time TEXT NOT NULL DEFAULT '09:30', -- e.g., "09:30"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules (8 modules per course)
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    module_number INTEGER NOT NULL CHECK (module_number BETWEEN 1 AND 8),
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    description TEXT,
    learning_outcomes TEXT, -- JSON array
    week_start_date DATE, -- Calculated from course start date
    week_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, module_number),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Student enrollment in course
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    current_module_number INTEGER DEFAULT 1,
    UNIQUE(student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- =============================================
-- BOOKING & SCHEDULING
-- =============================================

-- Teacher availability for video calls (Sat/Sun only)
CREATE TABLE teacher_availability (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week IN (6, 7)), -- 6=Saturday, 7=Sunday
    slot_start_time TEXT NOT NULL, -- e.g., "09:00", "10:00"
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(teacher_id, day_of_week, slot_start_time),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Video call bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    booking_date DATE NOT NULL, -- Actual date of the video call
    slot_start_time TEXT NOT NULL, -- e.g., "09:00"
    slot_end_time TEXT NOT NULL, -- e.g., "10:00"
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- =============================================
-- LEARNING HISTORY & FEEDBACK
-- =============================================

-- Learning history (tracks all learning activities)
CREATE TABLE learning_history (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('in_person_class', 'ai_practice', 'video_call')),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    booking_id INTEGER, -- Only for video_call type
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- AI-generated feedback (for ai_practice activities)
CREATE TABLE ai_feedback (
    id SERIAL PRIMARY KEY,
    learning_history_id INTEGER NOT NULL,
    feedback_text TEXT NOT NULL,
    pronunciation_notes TEXT, -- Specific pronunciation issues
    grammar_notes TEXT, -- Grammar issues
    fluency_notes TEXT, -- Fluency observations
    vocabulary_notes TEXT, -- Vocabulary suggestions
    overall_score REAL, -- 0-10 scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learning_history_id) REFERENCES learning_history(id) ON DELETE CASCADE
);

-- Teacher feedback (for video_call activities)
CREATE TABLE teacher_feedback (
    id SERIAL PRIMARY KEY,
    learning_history_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    feedback_text TEXT NOT NULL,
    confidence_notes TEXT, -- Notes about student's confidence
    improvement_suggestions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learning_history_id) REFERENCES learning_history(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- In-person class feedback (optional, from assigned teacher)
CREATE TABLE class_feedback (
    id SERIAL PRIMARY KEY,
    learning_history_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    feedback_text TEXT,
    topics_covered TEXT, -- JSON array of topics covered in class
    homework_notes TEXT, -- What to practice with AI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learning_history_id) REFERENCES learning_history(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- =============================================
-- STUDENT VIDEOS (Before/After Course)
-- =============================================

CREATE TABLE student_videos (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    video_type TEXT NOT NULL CHECK (video_type IN ('before', 'after')),
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_size INTEGER, -- in bytes
    duration INTEGER, -- in seconds
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, video_type),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- =============================================
-- PAYMENTS (Mock data only)
-- =============================================

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER, -- Parent pays
    student_id INTEGER NOT NULL, -- Payment for which student
    course_id INTEGER NOT NULL,
    amount INTEGER NOT NULL, -- in VND
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    transaction_id TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_parents_user_id ON parents(user_id);
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_type ON teachers(teacher_type);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_teacher ON bookings(teacher_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE INDEX idx_learning_history_student ON learning_history(student_id);
CREATE INDEX idx_learning_history_module ON learning_history(module_id);
CREATE INDEX idx_learning_history_type ON learning_history(activity_type);

CREATE INDEX idx_account_links_student ON account_links(student_id);

-- =============================================
-- INAUGURAL REGISTRATIONS (Interest Form)
-- =============================================

CREATE TABLE inaugural_registrations (
    id SERIAL PRIMARY KEY,
    parent_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    primary_goal TEXT,
    wants_to_signup BOOLEAN NOT NULL,
    interest_reason TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inaugural_registrations_email ON inaugural_registrations(email);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('connection_request', 'connection_accepted', 'booking_reminder', 'general')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);


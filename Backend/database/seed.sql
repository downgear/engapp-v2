-- =============================================
-- LINGRISER SEED DATA
-- Mock data for demo
-- =============================================

-- =============================================
-- USERS
-- =============================================

-- Password stored as plaintext for demo simplicity
-- Default password: 123456

-- Admin user
INSERT INTO users (email, password_hash, phone, full_name, role, avatar_url, is_locked) VALUES
('admin@lingriser.com', '123456', NULL, 'System Admin', 'admin', NULL, 0);

-- Teachers (5 teachers)
INSERT INTO users (email, password_hash, phone, full_name, role, avatar_url) VALUES
('teacher.sarah@lingriser.com', '123456', '0901000001', 'Sarah Johnson', 'teacher', NULL),
('teacher.james@lingriser.com', '123456', '0901000002', 'James Wilson', 'teacher', NULL),
('teacher.khai@lingriser.com', '123456', '0901000003', 'Trần Quốc Khải', 'teacher', NULL),
('teacher.emma@lingriser.com', '123456', '0901000004', 'Emma Thompson', 'teacher', NULL),
('teacher.michael@lingriser.com', '123456', '0901000005', 'Michael Brown', 'teacher', NULL);

-- Students (3 students)
INSERT INTO users (email, password_hash, phone, full_name, role, avatar_url) VALUES
('minhanh@gmail.com', '123456', '0912000001', 'Nguyễn Minh Anh', 'student', NULL),
('giabao@gmail.com', '123456', '0912000002', 'Trần Gia Bảo', 'student', NULL),
('thanhha@gmail.com', '123456', '0912000003', 'Lê Thanh Hà', 'student', NULL);

-- Parents (3 parents)
INSERT INTO users (email, password_hash, phone, full_name, role, avatar_url) VALUES
('parent.minhanh@gmail.com', '123456', '0922000001', 'Nguyễn Văn Hùng', 'parent', NULL),
('parent.giabao@gmail.com', '123456', '0922000002', 'Trần Thị Mai', 'parent', NULL),
('parent.thanhha@gmail.com', '123456', '0922000003', 'Lê Văn Đức', 'parent', NULL);

-- =============================================
-- TEACHERS
-- =============================================

INSERT INTO teachers (user_id, teacher_type, bio, specialties) VALUES
(1, 'both', 'Native English speaker from the USA with 5 years of teaching experience in Vietnam.', '["IELTS Speaking", "Business English", "Pronunciation"]'),
(2, 'video_call', 'British English teacher specializing in conversational English and exam preparation.', '["Conversation", "IELTS", "Grammar"]'),
(3, 'in_person', 'Giảng viên tiếng Anh với hơn 6 năm kinh nghiệm giảng dạy giao tiếp.', '["Speaking", "Pronunciation", "Confidence Building"]'),
(4, 'video_call', 'Australian English teacher focusing on natural communication and fluency.', '["Fluency", "Daily Conversation", "Vocabulary"]'),
(5, 'video_call', 'American English teacher with expertise in academic and professional English.', '["Academic English", "Presentation Skills", "Interview Prep"]');

-- =============================================
-- STUDENTS
-- =============================================

INSERT INTO students (user_id, grade, cefr_level, assigned_inperson_teacher_id) VALUES
(6, 'Lớp 8', 'B1', 3),   -- Minh Anh - assigned to teacher Khai (in-person)
(7, 'Lớp 6', 'A2', 3),   -- Gia Bảo - assigned to teacher Khai (in-person)
(8, 'Lớp 10', 'B1+', 3); -- Thanh Hà - assigned to teacher Khai (in-person)

-- =============================================
-- PARENTS
-- =============================================

INSERT INTO parents (user_id) VALUES
(9),  -- Parent of Minh Anh
(10), -- Parent of Gia Bảo
(11); -- Parent of Thanh Hà

-- =============================================
-- ACCOUNT LINKS
-- =============================================

-- Link students to their parents
INSERT INTO account_links (student_id, linked_user_id, link_type) VALUES
(1, 9, 'parent'),  -- Minh Anh -> Parent Hùng
(2, 10, 'parent'), -- Gia Bảo -> Parent Mai
(3, 11, 'parent'); -- Thanh Hà -> Parent Đức

-- Link students to their in-person teacher
INSERT INTO account_links (student_id, linked_user_id, link_type) VALUES
(1, 3, 'teacher'), -- Minh Anh -> Teacher Khai
(2, 3, 'teacher'), -- Gia Bảo -> Teacher Khai
(3, 3, 'teacher'); -- Thanh Hà -> Teacher Khai

-- =============================================
-- COURSE
-- =============================================

INSERT INTO courses (name, description, start_date, end_date, registration_open_date, registration_close_date, price, status, class_day, class_start_time, class_end_time) VALUES
('Speaking Foundation Program - Cohort 1', 
 'Khóa học 8 tuần giúp học sinh cải thiện kiến thức và sự tự tin khi nói tiếng Anh.',
 '2026-03-02', -- Monday, March 2nd 2026 (start date)
 '2026-04-26', -- End after 8 weeks
 '2026-02-01', -- Registration opens
 '2026-02-28', -- Registration closes
 2000000, -- 2,000,000 VND
 'in_progress',
 'monday',
 '08:00',
 '09:30');

-- =============================================
-- MODULES (8 modules about "Work")
-- =============================================

INSERT INTO modules (course_id, module_number, title, topic, description, learning_outcomes, week_start_date, week_end_date) VALUES
(1, 1, 'Introduction to Work Vocabulary', 'Work', 
 'Học các từ vựng cơ bản về công việc và nghề nghiệp.',
 '["Describe different jobs and professions", "Talk about daily work routines", "Use basic work-related vocabulary confidently"]',
 '2026-03-02', '2026-03-08'),

(1, 2, 'Talking About Your Job', 'Work',
 'Học cách mô tả công việc của bản thân và người khác.',
 '["Describe your job responsibilities", "Ask and answer questions about work", "Use present simple for work routines"]',
 '2026-03-09', '2026-03-15'),

(1, 3, 'Workplace Communication', 'Work',
 'Giao tiếp hiệu quả tại nơi làm việc.',
 '["Make polite requests at work", "Give and receive instructions", "Handle phone calls professionally"]',
 '2026-03-16', '2026-03-22'),

(1, 4, 'Job Interviews', 'Work',
 'Chuẩn bị cho các cuộc phỏng vấn xin việc.',
 '["Answer common interview questions", "Talk about strengths and weaknesses", "Describe past work experience"]',
 '2026-03-23', '2026-03-29'),

(1, 5, 'Meetings and Presentations', 'Work',
 'Tham gia họp và thuyết trình bằng tiếng Anh.',
 '["Participate in meetings confidently", "Give short presentations", "Express opinions and agree/disagree politely"]',
 '2026-03-30', '2026-04-05'),

(1, 6, 'Work-Life Balance', 'Work',
 'Thảo luận về cân bằng công việc và cuộc sống.',
 '["Discuss work-life balance", "Talk about hobbies and free time", "Use comparative structures"]',
 '2026-04-06', '2026-04-12'),

(1, 7, 'Career Goals and Plans', 'Work',
 'Nói về mục tiêu và kế hoạch nghề nghiệp.',
 '["Talk about career aspirations", "Use future tenses for plans", "Discuss skills needed for career growth"]',
 '2026-04-13', '2026-04-19'),

(1, 8, 'Review and Final Practice', 'Work',
 'Ôn tập và thực hành tổng hợp.',
 '["Consolidate all work-related vocabulary", "Demonstrate improved speaking confidence", "Apply all learned communication strategies"]',
 '2026-04-20', '2026-04-26');

-- =============================================
-- ENROLLMENTS
-- =============================================

INSERT INTO enrollments (student_id, course_id, status, current_module_number, enrolled_at) VALUES
(1, 1, 'active', 3, '2026-02-15 10:00:00'), -- Minh Anh - currently on module 3
(2, 1, 'active', 2, '2026-02-20 14:30:00'), -- Gia Bảo - currently on module 2
(3, 1, 'active', 4, '2026-02-10 09:00:00'); -- Thanh Hà - currently on module 4

-- =============================================
-- TEACHER AVAILABILITY (Video call teachers)
-- Saturday = 6, Sunday = 7
-- Slots: 09:00 to 21:00 (9am to 9pm)
-- =============================================

-- Sarah (teacher_id = 1) - available on Saturday and Sunday
INSERT INTO teacher_availability (teacher_id, day_of_week, slot_start_time, is_available) VALUES
(1, 6, '09:00', 1), (1, 6, '10:00', 1), (1, 6, '11:00', 1), (1, 6, '14:00', 1), (1, 6, '15:00', 1), (1, 6, '16:00', 1),
(1, 7, '09:00', 1), (1, 7, '10:00', 1), (1, 7, '14:00', 1), (1, 7, '15:00', 1);

-- James (teacher_id = 2) - available on Saturday and Sunday
INSERT INTO teacher_availability (teacher_id, day_of_week, slot_start_time, is_available) VALUES
(2, 6, '10:00', 1), (2, 6, '11:00', 1), (2, 6, '13:00', 1), (2, 6, '14:00', 1), (2, 6, '19:00', 1), (2, 6, '20:00', 1),
(2, 7, '10:00', 1), (2, 7, '11:00', 1), (2, 7, '15:00', 1), (2, 7, '16:00', 1);

-- Emma (teacher_id = 4) - available on Saturday and Sunday
INSERT INTO teacher_availability (teacher_id, day_of_week, slot_start_time, is_available) VALUES
(4, 6, '09:00', 1), (4, 6, '10:00', 1), (4, 6, '11:00', 1), (4, 6, '17:00', 1), (4, 6, '18:00', 1),
(4, 7, '14:00', 1), (4, 7, '15:00', 1), (4, 7, '16:00', 1), (4, 7, '17:00', 1);

-- Michael (teacher_id = 5) - available on Saturday and Sunday
INSERT INTO teacher_availability (teacher_id, day_of_week, slot_start_time, is_available) VALUES
(5, 6, '13:00', 1), (5, 6, '14:00', 1), (5, 6, '15:00', 1), (5, 6, '16:00', 1),
(5, 7, '09:00', 1), (5, 7, '10:00', 1), (5, 7, '11:00', 1), (5, 7, '19:00', 1), (5, 7, '20:00', 1);

-- =============================================
-- SAMPLE BOOKINGS (Video calls already made)
-- =============================================

-- Minh Anh's bookings
INSERT INTO bookings (student_id, teacher_id, module_id, booking_date, slot_start_time, slot_end_time, status) VALUES
(1, 1, 1, '2026-03-07', '10:00', '11:00', 'completed'), -- Module 1 with Sarah
(1, 2, 2, '2026-03-14', '14:00', '15:00', 'completed'), -- Module 2 with James
(1, 1, 3, '2026-03-21', '15:00', '16:00', 'confirmed'); -- Module 3 with Sarah (upcoming)

-- Gia Bảo's bookings
INSERT INTO bookings (student_id, teacher_id, module_id, booking_date, slot_start_time, slot_end_time, status) VALUES
(2, 4, 1, '2026-03-08', '14:00', '15:00', 'completed'), -- Module 1 with Emma
(2, 5, 2, '2026-03-15', '10:00', '11:00', 'confirmed'); -- Module 2 with Michael (upcoming)

-- Thanh Hà's bookings
INSERT INTO bookings (student_id, teacher_id, module_id, booking_date, slot_start_time, slot_end_time, status) VALUES
(3, 1, 1, '2026-03-07', '09:00', '10:00', 'completed'), -- Module 1 with Sarah
(3, 2, 2, '2026-03-14', '11:00', '12:00', 'completed'), -- Module 2 with James
(3, 4, 3, '2026-03-21', '17:00', '18:00', 'completed'), -- Module 3 with Emma
(3, 5, 4, '2026-03-28', '14:00', '15:00', 'confirmed'); -- Module 4 with Michael (upcoming)

-- =============================================
-- LEARNING HISTORY
-- =============================================

-- Minh Anh's learning history
-- Module 1
INSERT INTO learning_history (student_id, module_id, activity_type, start_time, end_time, booking_id, status) VALUES
(1, 1, 'in_person_class', '2026-03-02 08:00:00', '2026-03-02 09:30:00', NULL, 'completed'),
(1, 1, 'ai_practice', '2026-03-03 19:00:00', '2026-03-03 19:20:00', NULL, 'completed'),
(1, 1, 'ai_practice', '2026-03-05 20:00:00', '2026-03-05 20:25:00', NULL, 'completed'),
(1, 1, 'video_call', '2026-03-07 10:00:00', '2026-03-07 11:00:00', 1, 'completed');

-- Module 2
INSERT INTO learning_history (student_id, module_id, activity_type, start_time, end_time, booking_id, status) VALUES
(1, 2, 'in_person_class', '2026-03-09 08:00:00', '2026-03-09 09:30:00', NULL, 'completed'),
(1, 2, 'ai_practice', '2026-03-10 18:30:00', '2026-03-10 18:50:00', NULL, 'completed'),
(1, 2, 'ai_practice', '2026-03-12 19:00:00', '2026-03-12 19:30:00', NULL, 'completed'),
(1, 2, 'video_call', '2026-03-14 14:00:00', '2026-03-14 15:00:00', 2, 'completed');

-- Module 3 (current)
INSERT INTO learning_history (student_id, module_id, activity_type, start_time, end_time, booking_id, status) VALUES
(1, 3, 'in_person_class', '2026-03-16 08:00:00', '2026-03-16 09:30:00', NULL, 'completed'),
(1, 3, 'ai_practice', '2026-03-17 20:00:00', '2026-03-17 20:15:00', NULL, 'completed');

-- Thanh Hà's learning history (more advanced)
-- Module 1
INSERT INTO learning_history (student_id, module_id, activity_type, start_time, end_time, booking_id, status) VALUES
(3, 1, 'in_person_class', '2026-03-02 08:00:00', '2026-03-02 09:30:00', NULL, 'completed'),
(3, 1, 'ai_practice', '2026-03-03 17:00:00', '2026-03-03 17:30:00', NULL, 'completed'),
(3, 1, 'ai_practice', '2026-03-04 18:00:00', '2026-03-04 18:25:00', NULL, 'completed'),
(3, 1, 'ai_practice', '2026-03-06 19:00:00', '2026-03-06 19:20:00', NULL, 'completed'),
(3, 1, 'video_call', '2026-03-07 09:00:00', '2026-03-07 10:00:00', 6, 'completed');

-- Module 2
INSERT INTO learning_history (student_id, module_id, activity_type, start_time, end_time, booking_id, status) VALUES
(3, 2, 'in_person_class', '2026-03-09 08:00:00', '2026-03-09 09:30:00', NULL, 'completed'),
(3, 2, 'ai_practice', '2026-03-10 17:30:00', '2026-03-10 18:00:00', NULL, 'completed'),
(3, 2, 'ai_practice', '2026-03-12 18:00:00', '2026-03-12 18:30:00', NULL, 'completed'),
(3, 2, 'video_call', '2026-03-14 11:00:00', '2026-03-14 12:00:00', 7, 'completed');

-- Module 3
INSERT INTO learning_history (student_id, module_id, activity_type, start_time, end_time, booking_id, status) VALUES
(3, 3, 'in_person_class', '2026-03-16 08:00:00', '2026-03-16 09:30:00', NULL, 'completed'),
(3, 3, 'ai_practice', '2026-03-17 17:00:00', '2026-03-17 17:25:00', NULL, 'completed'),
(3, 3, 'ai_practice', '2026-03-19 18:30:00', '2026-03-19 19:00:00', NULL, 'completed'),
(3, 3, 'video_call', '2026-03-21 17:00:00', '2026-03-21 18:00:00', 8, 'completed');

-- Module 4 (current)
INSERT INTO learning_history (student_id, module_id, activity_type, start_time, end_time, booking_id, status) VALUES
(3, 4, 'in_person_class', '2026-03-23 08:00:00', '2026-03-23 09:30:00', NULL, 'completed'),
(3, 4, 'ai_practice', '2026-03-24 18:00:00', '2026-03-24 18:30:00', NULL, 'completed');

-- =============================================
-- AI FEEDBACK
-- =============================================

-- Minh Anh's AI feedback
INSERT INTO ai_feedback (learning_history_id, feedback_text, pronunciation_notes, grammar_notes, fluency_notes, vocabulary_notes, overall_score) VALUES
(2, 'Bạn đã làm tốt việc mô tả công việc! Cần cải thiện phát âm một số từ.',
   'Từ "tourists" bị thiếu âm cuối "s". Cần kéo dài âm "s" hơn.',
   'Chưa nói lưu loát được khi dùng cấu trúc ngữ pháp phức tạp.',
   'Tốc độ nói vừa phải, đôi khi hơi chậm khi nghĩ từ.',
   'Từ vựng cơ bản tốt, cần bổ sung thêm từ vựng chuyên ngành.',
   7.0),

(3, 'Tiến bộ rõ rệt so với buổi trước! Phát âm tốt hơn.',
   'Phát âm tốt, tuy nhiên có một số âm nối vẫn chưa xử lí được.',
   'Sử dụng thì hiện tại đơn chính xác hơn.',
   'Nói trôi chảy hơn, ít dừng để nghĩ.',
   'Đã sử dụng được một số từ vựng mới về công việc.',
   7.5),

(6, 'Buổi học đầu tiên với chủ đề mới. Cần luyện tập thêm từ vựng.',
   'Phát âm "responsibilities" cần cải thiện.',
   'Cần chú ý cách dùng giới từ với các động từ.',
   'Đôi khi dừng lâu để tìm từ.',
   'Từ vựng hạn chế về mô tả công việc.',
   6.5),

(7, 'Cải thiện tốt! Đã sử dụng được nhiều cấu trúc câu hơn.',
   'Phát âm rõ ràng hơn buổi trước.',
   'Sử dụng được câu phức hợp.',
   'Nói tự nhiên hơn.',
   'Từ vựng phong phú hơn.',
   7.5);

-- Thanh Hà's AI feedback
INSERT INTO ai_feedback (learning_history_id, feedback_text, pronunciation_notes, grammar_notes, fluency_notes, vocabulary_notes, overall_score) VALUES
(12, 'Xuất sắc! Phát âm rất tốt và tự tin.',
    'Phát âm chuẩn, âm nối tốt.',
    'Ngữ pháp chính xác.',
    'Nói rất trôi chảy và tự nhiên.',
    'Từ vựng đa dạng.',
    8.5),

(13, 'Tiếp tục duy trì phong độ tốt!',
    'Phát âm tự nhiên như người bản xứ.',
    'Sử dụng thành thạo các thì.',
    'Tốc độ nói tự nhiên.',
    'Biết cách paraphrase.',
    8.5),

(14, 'Rất tốt! Sẵn sàng cho video call với giáo viên.',
    'Hoàn hảo.',
    'Không có lỗi đáng kể.',
    'Rất lưu loát.',
    'Từ vựng phong phú và chính xác.',
    9.0);

-- =============================================
-- TEACHER FEEDBACK
-- =============================================

-- Feedback for Minh Anh
INSERT INTO teacher_feedback (learning_history_id, teacher_id, feedback_text, confidence_notes, improvement_suggestions) VALUES
(4, 1, 'Minh Anh đã làm tốt buổi video call đầu tiên. Có thể trả lời các câu hỏi cơ bản về công việc.',
    'Thiếu sự tự tin khi nói, hay nhìn xuống.',
    'Cần luyện tập nhiều hơn để tự tin hơn. Thử nhìn vào camera khi nói.'),

(8, 2, 'Tiến bộ so với tuần trước! Tự tin hơn và sử dụng được nhiều từ vựng hơn.',
    'Tự tin hơn tuần trước, nhưng vẫn còn e dè khi được hỏi câu hỏi khó.',
    'Tiếp tục luyện tập với AI trước khi video call. Chuẩn bị trước một số câu trả lời mẫu.');

-- Feedback for Thanh Hà
INSERT INTO teacher_feedback (learning_history_id, teacher_id, feedback_text, confidence_notes, improvement_suggestions) VALUES
(15, 1, 'Thanh Hà rất xuất sắc! Nói rất tự tin và lưu loát.',
    'Rất tự tin, nhìn thẳng vào camera, ngôn ngữ cơ thể tốt.',
    'Có thể thử các chủ đề khó hơn để thử thách bản thân.'),

(19, 2, 'Tiếp tục duy trì phong độ tốt. Đã có thể thảo luận các chủ đề sâu hơn.',
    'Tự tin ở mọi tình huống.',
    'Có thể tham gia các buổi thảo luận nhóm để phát triển thêm.'),

(23, 4, 'Xuất sắc! Đã sẵn sàng cho các kỳ thi IELTS Speaking.',
    'Tự tin tuyệt đối.',
    'Tiếp tục duy trì việc luyện tập hàng ngày.');

-- =============================================
-- CLASS FEEDBACK (from in-person teacher)
-- =============================================

INSERT INTO class_feedback (learning_history_id, teacher_id, feedback_text, topics_covered, homework_notes) VALUES
(1, 3, 'Buổi học đầu tiên. Học sinh đã làm quen với các từ vựng cơ bản về công việc.',
    '["Introduction to Work Vocabulary", "Common Jobs", "Daily Routines"]',
    'Luyện tập mô tả công việc với AI. Tập trung vào phát âm.'),

(5, 3, 'Học sinh đã nắm được cách mô tả công việc. Cần cải thiện cấu trúc câu.',
    '["Describing Job Responsibilities", "Present Simple for Routines"]',
    'Luyện hỏi đáp về công việc với AI.');

-- =============================================
-- STUDENT VIDEOS
-- =============================================

INSERT INTO student_videos (student_id, course_id, video_type, file_url, file_name, file_size, duration) VALUES
(1, 1, 'before', '/uploads/videos/minhanh_before.mp4', 'minhanh_before.mp4', 15000000, 120),
(3, 1, 'before', '/uploads/videos/thanhha_before.mp4', 'thanhha_before.mp4', 18000000, 150),
(3, 1, 'after', '/uploads/videos/thanhha_after.mp4', 'thanhha_after.mp4', 20000000, 180);

-- =============================================
-- PAYMENTS (Mock data)
-- =============================================

INSERT INTO payments (parent_id, student_id, course_id, amount, status, payment_method, transaction_id, paid_at) VALUES
(1, 1, 1, 2000000, 'completed', 'bank_transfer', 'TXN001', '2026-02-15 10:30:00'),
(2, 2, 1, 2000000, 'completed', 'bank_transfer', 'TXN002', '2026-02-20 15:00:00'),
(3, 3, 1, 2000000, 'completed', 'bank_transfer', 'TXN003', '2026-02-10 09:30:00');


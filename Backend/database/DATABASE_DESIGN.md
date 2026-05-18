# Lingriser Database Design

## 📊 Entity Relationship Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USERS & ROLES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │      users       │◄───│ students │    │ parents  │    │ teachers │      │
│  │──────────────────│    │──────────│    │──────────│    │──────────│      │
│  │ id (PK)          │    │ id (PK)  │    │ id (PK)  │    │ id (PK)  │      │
│  │ email            │    │ user_id  │    │ user_id  │    │ user_id  │      │
│  │ password_hash    │    │ grade    │    └──────────┘    │ type     │      │
│  │ full_name        │    │ cefr_level│                    │ bio      │      │
│  │ role             │    │ teacher_id│                    │ specialties│    │
│  │ avatar_url       │    └──────────┘                    └──────────┘      │
│  │ is_locked        │                                                       │
│  └──────────────────┘                                                       │
│       │                     │                                               │
│       │                     │    ┌──────────────────┐                       │
│       │                     │    │ account_links    │                       │
│       │                     │    │──────────────────│                       │
│       │                     │    │ student_id       │                       │
│       │                     │    │ linked_user_id   │                       │
│       │                     │    │ link_type        │                       │
│       │                     │    └──────────────────┘                       │
│       │                                                       │              │
│       │              ┌──────────────────┐                       │              │
│       ├──────────────│  login_sessions  │                       │              │
│       │              │──────────────────│                       │              │
│       │              │ user_id          │                       │              │
│       │              │ logged_in_at     │                       │              │
│       │              │ ip_address       │                       │              │
│       │              └──────────────────┘                       │              │
│       │                                                       │              │
│       │              ┌──────────────────────┐                  │              │
│       ├──────────────│ notifications        │                  │              │
│       │              │──────────────────────│                  │              │
│       │              │ user_id              │                  │              │
│       │              │ type                 │                  │              │
│       │              │ title, message       │                  │              │
│       │              └──────────────────────┘                  │              │
│       │                                                       │              │
│       │              ┌──────────────────────┐                  │              │
│       ├──────────────│ chat_conversations   │                  │              │
│       │              │──────────────────────│                  │              │
│       │              │ user_id              │                  │              │
│       │              │ admin_id             │                  │              │
│       │              │ status               │                  │              │
│       │              └──────────────────────┘                  │              │
│       │                                                       │              │
│       └─────────────►┌──────────────────────┐                 │              │
│                      │ chat_messages        │                 │              │
│                      │──────────────────────│                 │              │
│                      │ conversation_id      │                 │              │
│                      │ sender_id            │                 │              │
│                      │ message              │                 │              │
│                      └──────────────────────┘                 │              │
│                                                              │              │
│                      ┌──────────────────────┐                │              │
│                      │ teacher_google_tokens│◄───────────────┘              │
│                      │──────────────────────│                              │
│                      │ teacher_id           │                              │
│                      │ access_token         │                              │
│                      │ refresh_token        │                              │
│                      │ expires_at           │                              │
│                      └──────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROGRAMS, COURSES & MODULES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐         ┌──────────┐         ┌─────────────┐                 │
│  │ programs │◄────────│ cohorts  │         │cohort_courses│                 │
│  │──────────│         │──────────│         │─────────────│                 │
│  │ id (PK)  │         │ id (PK)  │         │ id (PK)     │                 │
│  │ name     │         │ program_id│        │ cohort_id   │                 │
│  │ is_active│         │ start_date│        │ course_id   │                 │
│  └──────────┘         │ status    │        │ teacher_id  │                 │
│                       └──────────┘        │ level         │                 │
│                                            │ max_students  │                 │
│                       ┌──────────┐         └──────┬──────┘                 │
│                       │ courses  │                 │                         │
│                       │──────────│                 │                         │
│                       │ id (PK)  │                 │                         │
│                       │ name     │                 │                         │
│                       │ image_url│                 │                         │
│                       │ start/end│                 │                         │
│                       │ price    │                 │                         │
│                       │ class_day│                 │                         │
│                       └────┬─────┘                 │                         │
│                       ┌────┴─────┐                 │                         │
│                       │ modules  │                 │                         │
│                       │──────────│                 │                         │
│                       │ id (PK)  │                 │                         │
│                       │ course_id│                 │                         │
│                       │ image_url│                 │                         │
│                       │ content  │◄────────────────┘                         │
│                       └──────────┘                                           │
│                                                                             │
│  ┌──────────────────────┐              ┌──────────┐                         │
│  │ enrollments          │              │student_cohort│                      │
│  │──────────────────────│              │_enrollments │                      │
│  │ student_id           │              │─────────────│                      │
│  │ course_id            │              │ student_id  │                      │
│  │ status               │              │cohort_course│                      │
│  │ current_module       │              │ paid        │                      │
│  │ paid                 │              └─────────────┘                      │
│  └──────────────────────┘                                                   │
│                                                                             │
│  ┌──────────────────────┐                                                   │
│  │ weekly_focus         │                                                   │
│  │──────────────────────│                                                   │
│  │ module_id            │                                                   │
│  │ teacher_id           │                                                   │
│  │ week_topic           │                                                   │
│  │ speaking_goals       │                                                   │
│  └──────────────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         BOOKING & SCHEDULING                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐              ┌────────────────────┐                │
│  │teacher_availability │              │      bookings      │                │
│  │─────────────────────│              │────────────────────│                │
│  │ teacher_id          │              │ id (PK)            │                │
│  │ day_of_week (6,7)   │◄─────────────│ teacher_id         │                │
│  │ slot_start_time     │              │ student_id         │                │
│  │ is_available        │              │ module_id          │                │
│  └─────────────────────┘              │ booking_date       │                │
│                                       │ meeting_status     │                │
│  Note: Slots are 60 mins,             │ meeting_link       │                │
│  from 9:00am to 9:00pm                │ google_event_id    │                │
│  (Sat & Sun only)                     │ ended_at           │                │
│                                       │ teacher_feedback   │                │
│                                       │ student_rating     │                │
│                                       └────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      LEARNING HISTORY & FEEDBACK                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐                                                       │
│  │ learning_history │                                                       │
│  │──────────────────│                                                       │
│  │ id (PK)          │                                                       │
│  │ student_id       │                                                       │
│  │ module_id        │                                                       │
│  │ activity_type    │  ─► in_person_class | ai_practice | video_call        │
│  │ start_time       │                                                       │
│  │ end_time         │                                                       │
│  │ booking_id       │  (nullable, for video_call)                           │
│  │ status           │                                                       │
│  └────────┬─────────┘                                                       │
│           │                                                                 │
│           ├──────────────────┬──────────────────┐                           │
│           ▼                  ▼                  ▼                           │
│  ┌──────────────────┐ ┌─────────────────┐  ┌───────────────┐               │
│  │ ai_feedback      │ │teacher_feedback │  │class_feedback │               │
│  │──────────────────│ │─────────────────│  │───────────────│               │
│  │ feedback_text    │ │ feedback_text   │  │ feedback_text │               │
│  │ speech_to_text   │ │ confidence_notes│  │ topics_covered│               │
│  │ response_duration│ │ improvement     │  │ homework_notes│               │
│  │ pause_detection  │ └─────────────────┘  └───────────────┘               │
│  │ session_length   │                                                       │
│  └──────────────────┘                                                       │
│  (Auto by OpenAI)        (Manual by teacher)      (Manual by teacher)       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    VIDEOS, PAYMENTS & REGISTRATIONS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐        ┌──────────────────┐  ┌─────────────────────┐   │
│  │ student_videos │        │    payments      │  │inaugural_registrations│  │
│  │────────────────│        │──────────────────│  │─────────────────────│   │
│  │ student_id     │        │ parent_id        │  │ parent_name         │   │
│  │ course_id      │        │ student_id       │  │ phone, email        │   │
│  │ video_type     │        │ course_id        │  │ primary_goal        │   │
│  │ file_url       │        │ amount           │  │ wants_to_signup     │   │
│  │ file_name      │        │ status           │  │ interest_reason     │   │
│  │ file_size      │        │ payment_method   │  │ rejection_reason    │   │
│  │ duration       │        │ transaction_id   │  └─────────────────────┘   │
│  │ uploaded_at    │        │ paid_at          │                             │
│  └────────────────┘        └──────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Bảng Tổng Hợp

### Users & Authentication
| Bảng | Mô tả |
|-------|-------------|
| `users` | Bảng người dùng cơ bản cho tất cả roles (student, parent, teacher, mentor, admin) |
| `students` | Dữ liệu riêng của học sinh, liên kết với giáo viên in-person |
| `parents` | Dữ liệu riêng của phụ huynh |
| `teachers` | Dữ liệu giáo viên với type (in_person, video_call, both) |
| `account_links` | Liên kết học sinh với phụ huynh/giáo viên |
| `login_sessions` | Theo dõi lịch sử đăng nhập (IP, user agent) |

### Programs & Course Hierarchy
| Bảng | Mô tả |
|-------|-------------|
| `programs` | Chương trình đào tạo (toplevel hierarchy) |
| `cohorts` | Khóa học theo đợt, thuộc về program |
| `cohort_courses` | Môn học trong cohort, có giáo viên phụ trách, level (basic/advanced) |
| `courses` | Khóa học/cơ bản với ngày, giá, lịch học |
| `modules` | 8 modules mỗi khóa, tuần tự, có nội dung chi tiết (Monday, AI Practice, Teacher Session) |
| `enrollments` | Đăng ký khóa học cũ, theo dõi module hiện tại, trạng thái thanh toán |
| `student_cohort_enrollments` | Đăng ký cohort course mới, theo dõi thanh toán |
| `weekly_focus` | Focus hàng tuần cho mô hình 3L (teacher set per module) |

### Booking & Scheduling
| Bảng | Mô tả |
|-------|-------------|
| `teacher_availability` | Slot trống của giáo viên (T7/CN, 9h-21h) |
| `bookings` | Đặt lịch video call, có Google Meet integration, meeting status, feedback, rating |

### Learning History & Feedback
| Bảng | Mô tả |
|-------|-------------|
| `learning_history` | Theo dõi mọi hoạt động học tập theo module |
| `ai_feedback` | Feedback tự động từ AI (OpenAI) + analytics (STT, pause detection, session length) |
| `teacher_feedback` | Feedback thủ công từ giáo viên video call |
| `class_feedback` | Feedback thủ công từ giáo viên in-person |

### Chat & Notifications
| Bảng | Mô tả |
|-------|-------------|
| `chat_conversations` | Cuộc trò chuyện hỗ trợ giữa user và admin |
| `chat_messages` | Tin nhắn trong cuộc trò chuyện |
| `notifications` | Thông báo hệ thống (connection, booking, general) |

### Google Integration
| Bảng | Mô tả |
|-------|-------------|
| `teacher_google_tokens` | OAuth token Google Calendar/Meet của giáo viên/mentor |

### Videos & Payments
| Bảng | Mô tả |
|-------|-------------|
| `student_videos` | Video before/after khóa học |
| `payments` | Ghi nhận thanh toán (SePay webhook + manual) |
| `inaugural_registrations` | Đăng ký quan tâm chương trình khai trương |

---

## 🔑 Mối Quan Hệ Chính

### 1. User Roles
```
users (1) ─────────► students (0..1)
users (1) ─────────► parents (0..1)
users (1) ─────────► teachers (0..1)
```
Role enum: `student` | `parent` | `teacher` | `mentor` | `admin`

### 2. Program Hierarchy
```
programs (1) ─────► cohorts (N) ─────► cohort_courses (N)
                                    ─────► courses (1)
                                              ─────► modules (8)
```

### 3. Student Enrollment (2 hệ thống)
```
students ──► enrollments ◄── courses          (Hệ cũ)
students ──► student_cohort_enrollments ◄── cohort_courses (Hệ mới)
```

### 4. Student ↔ Teacher/Parent Connection
```
students ──► account_links ◄── users (parent/teacher)
```

### 5. Booking Flow
```
students ──► bookings ◄── teachers
            │
            ▼
        modules
            │
            ▼ (nullable)
    learning_history
```

### 6. Learning History Flow
```
learning_history ◄── students
       │
       ├── ai_feedback (for ai_practice)
       ├── teacher_feedback (for video_call)
       └── class_feedback (for in_person_class)
```

### 7. Weekly Focus (3L Model)
```
modules ──► weekly_focus ◄── teachers
```

---

## 📅 Lịch Học Hàng Tuần

| Ngày | Hoạt động | Bảng Dữ liệu |
|-----|----------|-------------|
| Thứ 2 | Lớp in-person | `learning_history` + `class_feedback` |
| Thứ 3-6 | AI Practice | `learning_history` + `ai_feedback` |
| T7/CN | Video Call | `bookings` + `learning_history` + `teacher_feedback` |

### Ràng buộc:
1. ✅ Phải hoàn thành lớp in-person trước khi AI practice
2. ✅ Phải có ít nhất 1 AI practice mỗi tuần
3. ✅ Phải book video call cho T7/CN
4. ✅ Modules tuần tự (1 → 2 → ... → 8)

---

## 🗃️ Dữ Liệu Mẫu

| Entity | Số lượng | Ghi chú |
|--------|---------|---------|
| Users | 11 | 1 admin, 5 teachers, 3 students, 2 parents |
| Teachers | 5 | Sarah (both), James (video_call), Khai (in_person), Emma (video_call), Michael (video_call) |
| Students | 3 | Minh Anh (L8, B1), Gia Bao (L6, A2), Thanh Ha (L10, B1+) |
| Parents | 3 | Hung, Mai, Duc |
| Account Links | 6 | 3 student-parent + 3 student-teacher |
| Course | 1 | "Speaking Foundation Program - Cohort 1" (2M VND) |
| Modules | 8 | Topic "Work", từ 2026-03-02 đến 2026-04-26 |
| Enrollments | 3 | Tất cả active |
| Teacher Availability | 39 | Slot cho 4 video-call teachers |
| Bookings | 8 | Mix completed/confirmed |
| Learning History | 24 | Minh Anh: 10, Thanh Ha: 14 |
| AI Feedback | 7 | Minh Anh: 4, Thanh Ha: 3 |
| Teacher Feedback | 5 | Minh Anh: 2, Thanh Ha: 3 |
| Class Feedback | 2 | Của Minh Anh |
| Student Videos | 3 | Minh Anh: 1 before, Thanh Ha: 1 before + 1 after |
| Payments | 3 | Tất cả completed, 2,000,000 VND |

---

## 🛠️ Cách Khởi Tạo

### PostgreSQL (Production)
```bash
cd Backend/database
python3 init_postgres.py --reset
```

### SQLite (Development - cũ)
```bash
cd Backend/database
python3 init_db.py --reset
```

### Migrations
Tất cả migrations nằm trong `Backend/database/migrations/`:
- `001` - Payment columns trên enrollments
- `002` - User management, login sessions, admin role
- `003` - Chat system
- `004` - Google Meet integration
- `005` - Programs & cohorts hierarchy
- `006` - Student cohort enrollments
- `007a` - Meeting status & feedback trên bookings
- `007b` - Teacher assignment cho cohort courses
- `008` - Weekly focus (3L model)
- `009` - AI practice analytics
- `010` - Bỏ score-based evaluation
- `011` - Module content fields (Monday, AI, Teacher)
- `012` - Image URL cho courses & modules
- `013` - Mentor role mới

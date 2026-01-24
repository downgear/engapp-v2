# Lingriser Database Design

## 📊 Entity Relationship Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USERS & ROLES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐                    │
│  │  users   │◄────────│ students │         │ parents  │                    │
│  │──────────│         │──────────│         │──────────│                    │
│  │ id (PK)  │         │ id (PK)  │         │ id (PK)  │                    │
│  │ email    │         │ user_id  │         │ user_id  │                    │
│  │ phone    │         │ grade    │         └──────────┘                    │
│  │ name     │         │ cefr_lvl │                                         │
│  │ role     │         │ teacher_id│        ┌──────────┐                    │
│  └──────────┘         └──────────┘         │ teachers │                    │
│       │                     │              │──────────│                    │
│       │                     │              │ id (PK)  │                    │
│       │                     │              │ user_id  │                    │
│       │                     │              │ type     │                    │
│       └─────────────────────┴──────────────│ bio      │                    │
│                                            └──────────┘                    │
│                                                                             │
│  ┌───────────────┐                                                         │
│  │ account_links │  (Connects students to parents/teachers)                │
│  │───────────────│                                                         │
│  │ student_id    │                                                         │
│  │ linked_user_id│                                                         │
│  │ link_type     │                                                         │
│  └───────────────┘                                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           COURSE & MODULES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐         ┌──────────┐         ┌─────────────┐                 │
│  │ courses  │◄────────│ modules  │         │ enrollments │                 │
│  │──────────│         │──────────│         │─────────────│                 │
│  │ id (PK)  │         │ id (PK)  │         │ student_id  │                 │
│  │ name     │         │ course_id│         │ course_id   │                 │
│  │ start    │         │ number   │         │ status      │                 │
│  │ end      │         │ title    │         │ current_mod │                 │
│  │ price    │         │ topic    │         └─────────────┘                 │
│  │ status   │         │ outcomes │                                         │
│  └──────────┘         └──────────┘                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         BOOKING & SCHEDULING                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐              ┌──────────┐                         │
│  │ teacher_availability│              │ bookings │                         │
│  │─────────────────────│              │──────────│                         │
│  │ teacher_id          │              │ id (PK)  │                         │
│  │ day_of_week (6,7)   │◄─────────────│ teacher_id                         │
│  │ slot_start_time     │              │ student_id                         │
│  │ is_available        │              │ module_id │                         │
│  └─────────────────────┘              │ date      │                         │
│                                       │ status    │                         │
│  Note: Slots are 60 mins,             └──────────┘                         │
│  from 9:00am to 9:00pm                                                     │
│  (Sat & Sun only)                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      LEARNING HISTORY & FEEDBACK                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐                                                      │
│  │ learning_history │                                                      │
│  │──────────────────│                                                      │
│  │ id (PK)          │                                                      │
│  │ student_id       │                                                      │
│  │ module_id        │                                                      │
│  │ activity_type    │  ─► in_person_class | ai_practice | video_call       │
│  │ start_time       │                                                      │
│  │ end_time         │                                                      │
│  │ booking_id       │  (nullable, for video_call)                          │
│  └────────┬─────────┘                                                      │
│           │                                                                │
│           ├──────────────────┬──────────────────┐                          │
│           ▼                  ▼                  ▼                          │
│  ┌──────────────┐   ┌─────────────────┐   ┌───────────────┐                │
│  │ ai_feedback  │   │teacher_feedback │   │class_feedback │                │
│  │──────────────│   │─────────────────│   │───────────────│                │
│  │ feedback_text│   │ feedback_text   │   │ feedback_text │                │
│  │ pronunciation│   │ confidence_notes│   │ topics_covered│                │
│  │ grammar      │   │ improvement     │   │ homework_notes│                │
│  │ fluency      │   └─────────────────┘   └───────────────┘                │
│  │ vocabulary   │                                                          │
│  │ score        │   (Manual by teacher)   (Manual by in-person teacher)    │
│  └──────────────┘                                                          │
│  (Auto by OpenAI)                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         VIDEOS & PAYMENTS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────┐              ┌──────────┐                              │
│  │ student_videos │              │ payments │                              │
│  │────────────────│              │──────────│                              │
│  │ student_id     │              │ parent_id│  (Parent pays)               │
│  │ course_id      │              │ student_id                              │
│  │ video_type     │ ─► before|after         │ course_id │                  │
│  │ file_url       │              │ amount    │                              │
│  │ uploaded_at    │              │ status    │                              │
│  └────────────────┘              └──────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Tables Summary

### Users & Authentication
| Table | Description |
|-------|-------------|
| `users` | Base user table for all roles (student, parent, teacher) |
| `students` | Student-specific data, links to assigned in-person teacher |
| `parents` | Parent-specific data |
| `teachers` | Teacher data with type (in_person, video_call, both) |
| `account_links` | Links students to parents/teachers via phone number |

### Course & Modules
| Table | Description |
|-------|-------------|
| `courses` | Single course/cohort with dates, price, schedule |
| `modules` | 8 modules per course, ordered sequentially |
| `enrollments` | Student enrollment in course, tracks current module |

### Booking & Scheduling
| Table | Description |
|-------|-------------|
| `teacher_availability` | Teacher's available slots (Sat/Sun, 9am-9pm) |
| `bookings` | Video call bookings (auto-confirmed if slot available) |

### Learning History & Feedback
| Table | Description |
|-------|-------------|
| `learning_history` | Tracks all learning activities per module |
| `ai_feedback` | AI-generated feedback (via OpenAI API) |
| `teacher_feedback` | Manual feedback from video call teacher |
| `class_feedback` | Manual feedback from in-person class teacher |

### Videos & Payments
| Table | Description |
|-------|-------------|
| `student_videos` | Before/after course videos uploaded by students |
| `payments` | Payment records (mock data, parent pays) |

---

## 🔑 Key Relationships

### 1. User Roles
```
users (1) ─────────► students (0..1)
users (1) ─────────► parents (0..1)
users (1) ─────────► teachers (0..1)
```

### 2. Student ↔ Teacher Assignment
```
students.assigned_inperson_teacher_id ──► teachers.id
(Fixed for entire 8-module course)
```

### 3. Booking Flow
```
students ──► bookings ◄── teachers
                │
                ▼
            modules
```

### 4. Learning History Flow
```
learning_history ◄── students
       │
       ├── ai_feedback (for ai_practice)
       ├── teacher_feedback (for video_call)
       └── class_feedback (for in_person_class)
```

---

## 📅 Weekly Schedule Logic

| Day | Activity | Data Tables |
|-----|----------|-------------|
| Monday | In-person class | `learning_history` (auto-added from course schedule) |
| Tue-Fri | AI Practice | `learning_history` + `ai_feedback` |
| Sat/Sun | Video Call | `bookings` + `learning_history` + `teacher_feedback` |

### Constraints:
1. ✅ Must complete in-person class before AI practice
2. ✅ Must have at least 1 AI practice per week
3. ✅ Must book video call for Sat/Sun
4. ✅ Modules are sequential (1 → 2 → ... → 8)

---

## 🗃️ Mock Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Teachers | 5 | 1 in-person only, 3 video-call only, 1 both |
| Students | 3 | Minh Anh (B1), Gia Bảo (A2), Thanh Hà (B1+) |
| Parents | 3 | One per student |
| Course | 1 | Starting 2026-03-02, 8 weeks |
| Modules | 8 | All "Work" topic (placeholder) |
| Learning History | 25 | Various activities across modules |
| AI Feedback | 7 | Sample AI-generated feedback |
| Teacher Feedback | 5 | Sample teacher feedback |

---

## 🛠️ How to Initialize

```bash
cd Backend/database
python3 init_db.py --reset
```

This creates `lingriser.db` with schema and seed data.


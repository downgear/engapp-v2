# Lingriser Backend API

Backend API cho hệ thống Lingriser - Nền tảng học tiếng Anh giao tiếp.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL (Neon) với TypeORM
- **Deployment**: Vercel Serverless
- **Testing**: Jest (Unit tests + E2E tests)
- **Authentication**: JWT (Bearer token, 7 ngày hết hạn)
- **User Roles**: `student` | `parent` | `teacher` | `mentor` | `admin`

## Cài đặt

```bash
cd Backend/api
npm install
```

## Environment Variables

Tạo file `.env` trong thư mục `Backend/api/` (có thể copy từ mẫu):

```bash
cp .env.example .env
```

Các biến quan trọng:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:8080
CORS_ORIGINS=http://localhost:8080,http://localhost:5173,http://localhost:3000

# Gửi email (đăng ký, tạo user admin) — xem chi tiết Gmail: docs/SMTP-GMAIL.md
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password-16-chars

# Hoặc dùng Resend thay SMTP
RESEND_API_KEY=your-resend-api-key

OPENAI_API_KEY=sk-your-openai-key  # Cho AI Practice
ELEVENLABS_API_KEY=your-elevenlabs-key  # Cho TTS

# Google OAuth (cho Google Calendar/Meet)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/exchange-code

# SePay Payment Gateway
SEPAY_API_KEY=your-sepay-api-key
SEPAY_MERCHANT_CODE=your-sepay-merchant-code

# S3 Storage (video, image upload)
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_KEY=your-s3-secret-key
S3_BUCKET=your-bucket-name
S3_REGION=ap-southeast-1
```

File **`.env.example`** trong cùng thư mục có đầy đủ placeholder. **SMTP với Gmail:** bật 2FA → tạo [App Password](https://myaccount.google.com/apppasswords) → dán vào `SMTP_PASS` (không dùng mật khẩu đăng nhập web).

## Chạy API

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

API sẽ chạy tại: `http://localhost:3000/api`

## Authentication

API sử dụng JWT Bearer token. Gửi token trong header:
```
Authorization: Bearer <your-jwt-token>
```

Token có thời hạn 7 ngày. Một số endpoint yêu cầu role cụ thể (ADMIN, TEACHER, MENTOR).

## API Endpoints

### Health Check
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api` | Thông tin API | Public |
| GET | `/api/health` | Health check | Public |

### Auth
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/register` | Đăng ký tài khoản | Public |
| POST | `/api/auth/login` | Đăng nhập | Public |
| GET | `/api/auth/profile` | Lấy thông tin profile | JWT |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại | JWT |

### Google Auth (Teacher/Mentor)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/google/exchange-code` | Exchange Google OAuth code | JWT + TEACHER/MENTOR |
| GET | `/api/auth/google/status` | Kiểm tra trạng thái kết nối Google | JWT + TEACHER/MENTOR |
| GET | `/api/auth/google/disconnect` | Ngắt kết nối Google | JWT + TEACHER/MENTOR |

### Admin
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/admin/statistics/users` | Thống kê người dùng | JWT + ADMIN |
| GET | `/api/admin/statistics/visits?hours=` | Thống kê lượt truy cập | JWT + ADMIN |
| GET | `/api/admin/statistics/practice?hours=` | Thống kê AI practice | JWT + ADMIN |
| GET | `/api/admin/users?page=&limit=&role=&search=` | Danh sách users (phân trang) | JWT + ADMIN |
| GET | `/api/admin/users/:id` | Chi tiết user | JWT + ADMIN |
| POST | `/api/admin/users` | Tạo user | JWT + ADMIN |
| POST | `/api/admin/users/bulk-create` | Tạo bulk users | JWT + ADMIN |
| PATCH | `/api/admin/users/:id` | Cập nhật user | JWT + ADMIN |
| PATCH | `/api/admin/users/:id/role` | Thay đổi role | JWT + ADMIN |
| PATCH | `/api/admin/users/:id/lock` | Khóa/mở khóa user | JWT + ADMIN |

### Students
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/students` | Danh sách học sinh | Public |
| GET | `/api/students/:id` | Thông tin 1 học sinh | Public |
| GET | `/api/students/:id/enrollment` | Thông tin đăng ký khóa học | Public |
| GET | `/api/students/:id/learning-history?moduleId=` | Lịch sử học tập | Public |
| POST | `/api/students/:id/learning-history` | Tạo bản ghi học tập | Public |
| GET | `/api/students/:id/progress-videos?courseId=` | Video before/after | Public |
| POST | `/api/students/:id/upload-video` | Upload video tiến độ | Public |
| DELETE | `/api/students/:id/progress-video?videoType=&courseId=` | Xóa video | Public |
| GET | `/api/students/by-parent/:parentId` | Danh sách con theo phụ huynh | Public |
| GET | `/api/students/:id/connections` | Kết nối của học sinh | Public |
| GET | `/api/students/:id/ai-practice-stats?weeks=` | Thống kê AI practice theo tuần | Public |

### Teachers
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/teachers?type=` | Danh sách giáo viên | Public |
| GET | `/api/teachers/video-call` | Giáo viên video call | Public |
| GET | `/api/teachers/mentors` | Danh sách mentors | Public |
| GET | `/api/teachers/:id` | Thông tin giáo viên | Public |
| GET | `/api/teachers/:id/availability?date=` | Lịch trống | Public |
| GET | `/api/teachers/:id/teaching-courses` | Khóa học đang dạy | Public |

### Parents
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/parents/:id` | Thông tin phụ huynh | Public |
| GET | `/api/parents/:id/children` | Danh sách con | Public |
| GET | `/api/parents/:id/children/:studentId/learning-history?moduleId=` | Lịch sử học tập của con | Public |
| GET | `/api/parents/:id/children/:studentId/enrollment` | Enrollment của con | Public |
| GET | `/api/parents/:id/children/:studentId/enrollments` | Tất cả enrollments của con | Public |
| GET | `/api/parents/:id/children/:studentId/progress-videos?courseId=` | Video của con | Public |
| GET | `/api/parents/:id/children/:studentId/ai-practice-stats?weeks=` | Thống kê AI practice của con | Public |
| GET | `/api/parents/:id/payments` | Lịch sử thanh toán | Public |

### Courses
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/courses` | Danh sách khóa học | Public |
| GET | `/api/courses/current` | Khóa học hiện tại | Public |
| GET | `/api/courses/:id` | Thông tin khóa học | Public |
| GET | `/api/courses/:id/modules` | Danh sách modules | Public |
| GET | `/api/courses/modules/:moduleId` | Thông tin 1 module | Public |

### Programs & Cohorts
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/programs` | Danh sách programs | Public |
| GET | `/api/programs/:id` | Chi tiết program | Public |
| POST | `/api/programs` | Tạo program | JWT |
| PUT | `/api/programs/:id` | Cập nhật program | JWT |
| DELETE | `/api/programs/:id` | Xóa program | JWT |
| GET | `/api/programs/cohorts/:id` | Chi tiết cohort | Public |
| POST | `/api/programs/cohorts` | Tạo cohort | JWT |
| PUT | `/api/programs/cohorts/:id` | Cập nhật cohort | JWT |
| DELETE | `/api/programs/cohorts/:id` | Xóa cohort | JWT |
| GET | `/api/programs/cohort-courses/:id` | Chi tiết cohort course | Public |
| POST | `/api/programs/cohort-courses` | Tạo cohort course | JWT |
| PUT | `/api/programs/cohort-courses/:id` | Cập nhật cohort course | JWT |
| DELETE | `/api/programs/cohort-courses/:id` | Xóa cohort course | JWT |
| GET | `/api/programs/cohort-courses/:id/enrollments` | Enrollments của cohort course | JWT |
| POST | `/api/programs/courses` | Tạo course standalone | JWT |
| PUT | `/api/programs/courses/:id` | Cập nhật course | JWT |
| POST | `/api/programs/modules` | Tạo module | JWT |
| PUT | `/api/programs/modules/:id` | Cập nhật module | JWT |
| DELETE | `/api/programs/modules/:id` | Xóa module | JWT |
| POST | `/api/programs/upload-image` | Upload ảnh program/module | JWT |

### Programs - Enrollment
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/programs/enroll` | Đăng ký cohort course | JWT |
| POST | `/api/programs/enroll/by-user` | Đăng ký theo user ID | JWT |
| DELETE | `/api/programs/enroll/:studentId/:cohortCourseId` | Hủy đăng ký | JWT |
| GET | `/api/programs/enrollment/:studentId/:cohortCourseId` | Trạng thái đăng ký | JWT |
| GET | `/api/programs/enrollments/:studentId` | Tất cả enrollments của học sinh | JWT |
| GET | `/api/programs/enrollments/:studentId/formatted` | Enrollments định dạng | JWT |
| POST | `/api/programs/enrollment/pay` | Đánh dấu đã thanh toán | JWT |
| GET | `/api/programs/enrollment/check/:studentId/:cohortCourseId` | Kiểm tra đã thanh toán | JWT |

### Bookings
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/bookings` | Đặt lịch video call | Public |
| GET | `/api/bookings?studentId=X` | Bookings của học sinh | Public |
| GET | `/api/bookings/by-teacher/:teacherId` | Bookings của giáo viên | Public |
| GET | `/api/bookings/:id` | Thông tin booking | Public |
| PATCH | `/api/bookings/:id/complete` | Hoàn thành booking | Public |
| PATCH | `/api/bookings/:id/cancel` | Hủy booking | Public |
| PATCH | `/api/bookings/:id/start-meeting` | Bắt đầu meeting | JWT |
| PATCH | `/api/bookings/:id/end-meeting` | Kết thúc meeting | JWT |
| PATCH | `/api/bookings/:id/teacher-feedback` | Thêm feedback giáo viên | JWT |
| PATCH | `/api/bookings/:id/student-rating` | Đánh giá của học sinh | JWT |

### AI Practice
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/ai-practice/chat` | Chat AI practice | Public |
| POST | `/api/ai-practice/feedback` | Sinh feedback từ AI | Public |
| POST | `/api/ai-practice/transcribe` | Chuyển đổi giọng nói thành văn bản | Public |
| POST | `/api/ai-practice/tts` | Text-to-Speech | Public |

### Chat (User)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/chat/conversations` | Tạo/lấy cuộc trò chuyện | JWT |
| GET | `/api/chat/conversations/my` | Cuộc trò chuyện của tôi | JWT |
| GET | `/api/chat/user/unread-count` | Số tin nhắn chưa đọc | JWT |
| GET | `/api/chat/conversations/:id/messages` | Tin nhắn trong cuộc trò chuyện | JWT |
| POST | `/api/chat/conversations/:id/messages` | Gửi tin nhắn | JWT |

### Chat (Admin)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/chat/admin/conversations?status=&page=&limit=` | Tất cả cuộc trò chuyện | JWT + ADMIN |
| GET | `/api/chat/admin/unread-count` | Số tin nhắn chưa đọc (admin) | JWT + ADMIN |
| PATCH | `/api/chat/admin/conversations/:id/close` | Đóng cuộc trò chuyện | JWT + ADMIN |

### Connections
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/connections` | Tạo kết nối (parent/teacher ↔ student) | Public |
| DELETE | `/api/connections/:id` | Xóa kết nối | Public |

### Notifications
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/notifications?userId=` | Thông báo của user | Public |
| GET | `/api/notifications/unread-count?userId=` | Số thông báo chưa đọc | Public |
| PATCH | `/api/notifications/:id/read` | Đánh dấu đã đọc | Public |
| PATCH | `/api/notifications/mark-all-read?userId=` | Đánh dấu tất cả đã đọc | Public |

### Payments
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/payments/create-pending` | Tạo thanh toán pending | Public |
| POST | `/api/payments/process` | Xác nhận thanh toán thủ công | Public |
| GET | `/api/payments/status/:studentId` | Kiểm tra trạng thái thanh toán | Public |
| POST | `/api/payments/sepay-webhook` | SePay webhook | API Key |
| GET | `/api/payments/sepay-webhook` | SePay webhook health check | Public |

### Inaugural Registrations
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/inaugural-registrations` | Đăng ký quan tâm chương trình khai trương | Public |
| GET | `/api/inaugural-registrations` | Danh sách đăng ký | Public |
| GET | `/api/inaugural-registrations/:id` | Chi tiết đăng ký | Public |

### Weekly Focus (3L Model)
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/weekly-focus` | Tạo/cập nhật weekly focus | JWT |
| PUT | `/api/weekly-focus/:id` | Cập nhật weekly focus | JWT |
| GET | `/api/weekly-focus/module/:moduleId` | Tìm focus theo module | Public |
| GET | `/api/weekly-focus/teacher/:teacherId` | Tìm focus theo giáo viên | JWT |
| GET | `/api/weekly-focus/mentor-brief?studentId=&moduleId=` | Mentor brief | JWT |
| DELETE | `/api/weekly-focus/:id` | Xóa weekly focus | JWT |

## CORS Configuration

API được cấu hình CORS qua biến `CORS_ORIGINS` (mặc định: localhost:8080, 8081, 5173, 3000).

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Cấu trúc thư mục

```
src/
├── database/                    # Database configuration
├── entities/                    # TypeORM entities (25 entities)
├── modules/
│   ├── admin/                   # Admin management dashboard
│   ├── ai-practice/             # AI speaking practice (chat, feedback, STT, TTS)
│   ├── auth/                    # Authentication (JWT, roles, guards)
│   ├── bookings/                # Video call booking system
│   ├── chat/                    # Customer support chat
│   ├── connections/             # Student-parent-teacher connections
│   ├── courses/                 # Course & module management
│   ├── email/                   # Email service (SMTP/Resend)
│   ├── google-auth/             # Google Calendar/Meet OAuth
│   ├── inaugural-registrations/ # Inaugural program interest form
│   ├── notifications/           # System notifications
│   ├── parents/                 # Parent dashboard endpoints
│   ├── payments/                # Payment processing (SePay)
│   ├── programs/                # Programs, cohorts, enrollment
│   ├── students/                # Student management
│   ├── teachers/                # Teacher management
│   └── weekly-focus/            # Weekly focus for 3L model
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
test/
├── app.e2e-spec.ts
└── jest-e2e.json
```

## Kết nối với Frontend

Frontend gọi API qua service centralized:

```typescript
// Frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Ví dụ: Lấy danh sách con của phụ huynh
const response = await fetch(`${API_BASE_URL}/parents/1/children`);
const children = await response.json();
```

# Lingriser Backend API

Backend API cho hệ thống Lingriser - Nền tảng học tiếng Anh giao tiếp.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL (Neon) với TypeORM
- **Deployment**: Vercel Serverless
- **Testing**: Jest (Unit tests + E2E tests)

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

# Gửi email (đăng ký, tạo user admin) — xem chi tiết Gmail: docs/SMTP-GMAIL.md
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password-16-chars

OPENAI_API_KEY=sk-your-openai-key  # Optional: cho AI Practice
```

File **`.env.example`** trong cùng thư mục có đầy đủ placeholder. **SMTP với Gmail:** bật 2FA → tạo [App Password](https://myaccount.google.com/apppasswords) → dán vào `SMTP_PASS` (không dùng mật khẩu đăng nhập web).

## Chạy API

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

API sẽ chạy tại: `http://localhost:3001/api`

## API Endpoints

### Health Check
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api` | Thông tin API |
| GET | `/api/health` | Health check |

### Students
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/students` | Lấy danh sách học sinh |
| GET | `/api/students/:id` | Lấy thông tin 1 học sinh |
| GET | `/api/students/:id/enrollment` | Lấy thông tin đăng ký khoá học |
| GET | `/api/students/:id/learning-history` | Lấy lịch sử học tập |
| GET | `/api/students/:id/progress-videos` | Lấy video before/after |
| GET | `/api/students/by-parent/:parentId` | Lấy danh sách con theo phụ huynh |

### Teachers
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/teachers` | Lấy danh sách giáo viên |
| GET | `/api/teachers/video-call` | Lấy giáo viên video call |
| GET | `/api/teachers/:id` | Lấy thông tin 1 giáo viên |
| GET | `/api/teachers/:id/availability` | Lấy lịch trống của giáo viên |

### Courses
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/courses` | Lấy danh sách khoá học |
| GET | `/api/courses/current` | Lấy khoá học hiện tại |
| GET | `/api/courses/:id` | Lấy thông tin 1 khoá học |
| GET | `/api/courses/:id/modules` | Lấy danh sách modules |
| GET | `/api/courses/modules/:moduleId` | Lấy thông tin 1 module |

### Bookings
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/bookings` | Đặt lịch video call |
| GET | `/api/bookings?studentId=X` | Lấy bookings của học sinh |
| GET | `/api/bookings/by-teacher/:teacherId` | Lấy bookings của giáo viên |
| GET | `/api/bookings/:id` | Lấy thông tin 1 booking |
| PATCH | `/api/bookings/:id/complete` | Hoàn thành booking |
| PATCH | `/api/bookings/:id/cancel` | Huỷ booking |

### Parents
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/parents/:id` | Lấy thông tin phụ huynh |
| GET | `/api/parents/:id/children` | Lấy danh sách con |
| GET | `/api/parents/:id/children/:studentId/learning-history` | Lấy lịch sử học tập của con |
| GET | `/api/parents/:id/children/:studentId/enrollment` | Lấy enrollment của con |
| GET | `/api/parents/:id/children/:studentId/progress-videos` | Lấy video của con |
| GET | `/api/parents/:id/payments` | Lấy lịch sử thanh toán |

## CORS Configuration

API đã được cấu hình CORS cho các origins sau:
- `http://localhost:8080`
- `http://localhost:5173`
- `http://localhost:3000`

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
├── database/           # Database configuration
├── entities/           # TypeORM entities
├── modules/
│   ├── students/       # Students module
│   ├── teachers/       # Teachers module
│   ├── courses/        # Courses module
│   ├── bookings/       # Bookings module
│   └── parents/        # Parents module
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
test/
├── app.e2e-spec.ts     # E2E tests
└── jest-e2e.json
```

## Kết nối với Frontend

Frontend có thể gọi API qua:

```typescript
// Frontend/src/services/api.ts
const API_BASE_URL = 'http://localhost:3001/api';

// Ví dụ: Lấy danh sách học sinh của phụ huynh
const response = await fetch(`${API_BASE_URL}/parents/1/children`);
const children = await response.json();
```
# Trigger deploy Mon Jan 26 22:35:35 +07 2026

# Gửi email qua Gmail (SMTP)

Ứng dụng dùng biến môi trường `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (và tuỳ chọn `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM`).

## Giá trị mẫu cho Gmail

| Biến | Giá trị thường dùng |
|------|---------------------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` (khi dùng port 587) |
| `SMTP_USER` | Địa chỉ Gmail đầy đủ, ví dụ: `luuchilap@gmail.com` |
| `SMTP_PASS` | **Mật khẩu ứng dụng (App Password)** — không phải mật khẩu đăng nhập web |
| `SMTP_FROM` | Có thể trùng `SMTP_USER` hoặc để trống (code sẽ dùng `SMTP_USER`) |

Nếu dùng port **465** (SSL): đặt `SMTP_PORT=465` và `SMTP_SECURE=true`.

## Cách lấy `SMTP_PASS` (App Password) cho Gmail

Google **không** cho phép dùng mật khẩu tài khoản thường để đăng nhập SMTP từ ứng dụng. Bạn cần:

1. Bật **Xác minh 2 bước** cho tài khoản Google:  
   [Google Account → Security → 2-Step Verification](https://myaccount.google.com/security)

2. Tạo **Mật khẩu ứng dụng** (App Password):  
   - Vào [App passwords](https://myaccount.google.com/apppasswords) (hoặc Tìm kiếm trong Cài đặt Google: "App passwords").  
   - Chọn ứng dụng: **Mail**, thiết bị: **Other** → đặt tên ví dụ `Lingriser API`.  
   - Google hiển thị **16 ký tự** (có thể có dấu cách) — đó là giá trị cho `SMTP_PASS` (có thể gõ liền không cách).

3. Copy 16 ký tự đó vào `SMTP_PASS` trong file `.env` (không commit `.env` lên Git).

## Kiểm tra

- Khởi động lại API sau khi sửa `.env`.  
- Trong log API khi khởi động sẽ có `Email service initialized` nếu SMTP đã cấu hình đủ.  
- Nếu thiếu `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`, mail sẽ **không** gửi (đăng ký vẫn thành công).

## Lưu ý

- Không chia sẻ App Password; coi như mật khẩu.  
- Nếu dùng workspace Google Workspace, admin có thể tắt SMTP — cần hỏi IT.  
- Có thể dùng nhà cung cấp khác (SendGrid, Mailgun, Resend, v.v.) — thay `SMTP_HOST`, port và user/pass theo tài liệu của họ.

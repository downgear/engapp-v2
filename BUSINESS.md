# LINGRISER - Tài Liệu Dự Án

## 📋 Tổng Quan Dự Án

### Tên sản phẩm
**Lingriser** - Nền tảng luyện nói tiếng Anh kết hợp AI và Giáo viên bản ngữ

### Mục tiêu
Giúp học sinh Việt Nam cải thiện **kiến thức** và **sự tự tin** khi nói tiếng Anh thông qua khóa học 8 tuần (8 modules) với phương pháp học tập kết hợp:
- Học trực tiếp trên lớp
- Luyện tập với AI
- Luyện tập với giáo viên qua video call

### Đối tượng khách hàng
- **Học sinh** từ lớp 6-12 muốn cải thiện kỹ năng nói tiếng Anh
- **Phụ huynh** muốn theo dõi và hỗ trợ con em học tập
- Học sinh có trình độ từ A2 đến B1+ (theo khung CEFR)

---

## 👥 Vai Trò Người Dùng

### 1. Học sinh (Student)
Là người dùng chính của hệ thống.

**Chức năng chính:**
- Truy cập và học 8 modules của khóa học
- Luyện nói với AI hàng ngày (Thứ 3-6)
- Đặt lịch video call với giáo viên (Thứ 7, Chủ nhật)
- Xem lịch sử học tập và feedback từ AI/giáo viên
- Quay video trước và sau khóa học để thấy sự tiến bộ
- Kết nối tài khoản với phụ huynh và giáo viên

### 2. Phụ huynh (Parent)
Theo dõi và hỗ trợ quá trình học tập của con.

**Chức năng chính:**
- Xem lịch sử học tập của con (đã học gì, bao lâu, feedback ra sao)
- Xem video tiến bộ của con (trước và sau khóa học)
- Theo dõi tiến độ hoàn thành các module
- Quản lý thanh toán học phí (2.000.000 VNĐ/khóa)
- Nhận thông báo về hoạt động học tập của con

### 3. Giáo viên (Teacher)
Hướng dẫn và đánh giá học sinh.

**Chức năng chính:**
- Xem lịch sử học tập của học sinh trong lớp mình dạy
- Nhận và quản lý lịch đặt video call từ học sinh
- Video call 1-1 với học sinh vào cuối tuần
- Viết feedback/nhận xét sau mỗi buổi học
- Theo dõi tiến bộ của từng học sinh qua thời gian

---

## 📚 Cấu Trúc Khóa Học

### Tổng quan
- **Thời lượng:** 8 tuần
- **Số module:** 8 (mỗi tuần 1 module)
- **Học phí:** 2.000.000 VNĐ

### Lịch học trong tuần

| Ngày | Hoạt động | Mô tả |
|------|-----------|-------|
| **Thứ 2** | Học trực tiếp | Học sinh đến lớp học với giáo viên (offline) |
| **Thứ 3-6** | Luyện tập với AI | Học sinh về nhà luyện nói với AI qua website |
| **Thứ 7, CN** | Video call | Học sinh video call 1-1 với giáo viên đã book |

### Quy trình học 1 module

**Bước 1 (Thứ 2):** Học trên lớp

**Bước 2 (Thứ 3-6):** Luyện tập với AI (tối thiểu 1 lần/tuần)

**Bước 3 (Thứ 7/CN):** Video call với giáo viên (60 phút)

### Ràng buộc học tập
1. Phải hoàn thành học trực tiếp trước khi luyện AI
2. Phải có ít nhất 1 buổi luyện AI mỗi tuần
3. Phải book video call vào Thứ 7 hoặc Chủ nhật
4. Các module học tuần tự (1 → 2 → ... → 8)

---

## 🎯 Tính Năng Chi Tiết

### 1. Luyện Nói với AI

**Mô tả:** Học sinh thực hành speaking với AI thông minh (tương tự ChatGPT nhưng chuyên về luyện nói).

**Cách hoạt động:**
- Học sinh nói qua microphone
- AI chuyển giọng nói thành văn bản
- AI phản hồi như một giáo viên thực sự
- AI đề xuất các câu trả lời gợi ý phù hợp trình độ

**Feedback từ AI bao gồm:**

| Tiêu chí | Mô tả |
|----------|-------|
| Phát âm (Pronunciation) | Đánh giá độ chính xác khi phát âm từ/câu |
| Ngữ pháp (Grammar) | Phát hiện lỗi ngữ pháp và gợi ý sửa |
| Từ vựng (Vocabulary) | Đánh giá mức độ phong phú của từ vựng |
| Độ lưu loát (Fluency) | Đánh giá khả năng nói trôi chảy, tự nhiên |
| Tính mạch lạc (Coherence) | Đánh giá logic và sự liên kết ý tưởng |
| Tính liên kết (Cohesion) | Đánh giá việc sử dụng từ nối, liên từ |

**Điểm số:** Mỗi tiêu chí được chấm từ 1-10

### 2. Đặt Lịch Video Call

**Mô tả:** Học sinh tự chủ động đặt lịch video call với giáo viên có sẵn trong hệ thống.

**Quy trình:**
1. Học sinh chọn ngày (Thứ 7 hoặc Chủ nhật)
2. Xem danh sách giáo viên có slot trống
3. Chọn giáo viên và khung giờ phù hợp
4. Xác nhận đặt lịch
5. Hệ thống tự động xác nhận nếu slot còn trống

**Thông tin lịch hẹn:**
- Ngày, giờ bắt đầu và kết thúc
- Thông tin giáo viên
- Module đang học
- Trạng thái: Đã xác nhận / Hoàn thành / Đã hủy

**Khung giờ:** 9:00 sáng - 9:00 tối, mỗi slot 60 phút

### 3. Lịch Sử Học Tập

**Mô tả:** Ghi lại chi tiết mọi hoạt động học tập của học sinh.

**Thông tin được lưu:**

| Loại hoạt động | Thông tin ghi nhận |
|----------------|-------------------|
| Học trên lớp | Ngày giờ, chủ đề đã học, ghi chú của giáo viên |
| Luyện với AI | Ngày giờ bắt đầu/kết thúc, điểm số, feedback chi tiết |
| Video call | Ngày giờ, giáo viên, feedback từ giáo viên |

**Ví dụ lịch sử học tập:**

| Hoạt động | Bắt đầu | Kết thúc | Feedback |
|-----------|---------|----------|----------|
| Học trực tiếp | 8:00, 23/07 | 9:30, 23/07 | Cần học chủ đề "Hometown" |
| Luyện với AI | 21:00, 26/07 | 21:15, 26/07 | Phát âm "tourists" thiếu âm cuối. Điểm: 7/10 |
| Luyện với AI | 19:00, 28/07 | 19:30, 28/07 | Phát âm tốt, cần cải thiện âm nối. Điểm: 8/10 |
| Video call | 21:00, 30/07 | 22:00, 30/07 | Thiếu tự tin, cần bổ sung từ vựng chủ đề hẹp |

### 4. Video Tiến Bộ

**Mô tả:** Học sinh quay 2 video để chứng minh sự tiến bộ.

| Video | Thời điểm | Mục đích |
|-------|-----------|----------|
| Video "Trước" | Trước khi bắt đầu khóa học | Ghi nhận trình độ ban đầu |
| Video "Sau" | Sau khi hoàn thành 8 modules | Thể hiện sự tiến bộ |

**Lợi ích:**
- Học sinh tự thấy được sự tiến bộ của mình
- Phụ huynh thấy được kết quả học tập rõ ràng
- Làm bằng chứng về chất lượng giảng dạy

### 5. Kết Nối Tài Khoản

**Mô tả:** Liên kết giữa học sinh, phụ huynh và giáo viên thông qua số điện thoại.

**Cách hoạt động:**
1. Học sinh đăng ký tài khoản
2. Vào mục "Kết nối", nhập số điện thoại của phụ huynh
3. Nếu phụ huynh đã có tài khoản → tự động kết nối
4. Phụ huynh có thể xem thông tin học tập của con

**Ai xem được lịch sử học tập của học sinh X?**
- Chính học sinh X
- Phụ huynh của X (đã kết nối)
- Giáo viên dạy trực tiếp của X
- Giáo viên được X book video call

---

## 📊 Hệ Thống Giáo Viên

### Phân loại giáo viên

| Loại | Mô tả | Chức năng |
|------|-------|-----------|
| **In-person** | Giáo viên dạy trực tiếp | Dạy học sinh tại lớp vào Thứ 2 |
| **Video call** | Giáo viên online | Nhận booking và video call cuối tuần |
| **Both** | Cả hai | Có thể làm cả hai vai trò |

### Lịch trống (Availability)
- Giáo viên video call đăng ký lịch trống cho Thứ 7 và Chủ nhật
- Khung giờ: 9:00 - 21:00 (mỗi slot 60 phút)
- Học sinh chỉ thấy và book được các slot còn trống

---

## 💰 Thanh Toán

### Thông tin gói học
- **Giá:** 2.990.000 VNĐ / khóa học (8 modules)
- **Giá gốc:** 3.990.000 VNĐ (khuyến mãi khai trương)
- **Người thanh toán:** Học sinh hoặc Phụ huynh

### Phương thức thanh toán (SePay Integration)

> ✅ **Đã tích hợp SePay** để tự động xác nhận thanh toán khi nhận được tiền chuyển khoản.

**Thông tin chuyển khoản:**

| Thông tin | Giá trị |
|-----------|---------|
| Ngân hàng | BIDV - CN Quảng Nam |
| Số tài khoản | 5622486301 |
| Chủ tài khoản | LUU CHI LAP |
| Nội dung CK | Thanh toan Lingriser + Mã giao dịch |

### Quy trình thanh toán (Auto-detect với SePay)

1. **Học sinh truy cập trang Chương trình học** (`/curriculum`)
2. **Click vào module có trạng thái "Chưa thanh toán"** → Chuyển đến trang thanh toán
3. **Hệ thống tạo mã giao dịch duy nhất** (format: `LR{studentId}{timestamp}`)
4. **Học sinh quét mã QR** bằng app ngân hàng để chuyển khoản
   - **QUAN TRỌNG:** Nội dung chuyển khoản phải chứa mã giao dịch: `Thanh toan Lingriser LR...`
5. **SePay phát hiện giao dịch** → Gửi webhook đến Backend
6. **Backend xác nhận thanh toán** → Cập nhật trạng thái enrollment
7. **Frontend poll và phát hiện** → Tự động redirect về `/curriculum` với tất cả modules đã mở khóa

**Thời gian chờ:** 5 phút (300 giây)
- Nếu hết thời gian mà chưa nhận được thanh toán → Quay lại trang Chương trình
- Có nút "Xác nhận thủ công" để backup nếu webhook bị delay

### Tích hợp SePay

**Cấu hình webhook trong SePay Dashboard:**
```
URL: https://your-domain.com/api/payments/sepay-webhook
Method: POST
```

**Biến môi trường (.env):**
```
SEPAY_API_KEY=your-sepay-api-key-here
```

**Cách SePay hoạt động:**
```
User chuyển khoản → Tiền vào TK BIDV → SePay phát hiện (< 5 giây) 
→ Gửi webhook đến Backend → Match mã giao dịch → Xác nhận thanh toán
→ Frontend poll và phát hiện → Redirect về /curriculum
```

### Trạng thái thanh toán trong hệ thống

| Trạng thái | Mô tả | Hiển thị |
|------------|-------|----------|
| Chưa thanh toán | Học sinh chưa thanh toán học phí | Module 2-8 hiển thị "Chưa thanh toán" |
| Đã thanh toán | Học sinh đã xác nhận thanh toán | Tất cả modules hiển thị "Đang học" hoặc "Hoàn thành" |

### Kế hoạch tương lai (Roadmap thanh toán)

**Đã hoàn thành:**
- [x] Tự động xác nhận thanh toán qua webhook (SePay)
- [x] Mã giao dịch duy nhất cho mỗi thanh toán
- [x] Frontend polling để phát hiện thanh toán

**Trong các phiên bản tiếp theo:**
- [ ] Cổng thanh toán VNPay/Momo/ZaloPay
- [ ] Thanh toán trả góp
- [ ] Mã giảm giá (Voucher/Coupon)
- [ ] Hóa đơn điện tử

---

## 🖥️ Các Màn Hình Chính

### Trang công khai (không cần đăng nhập)
| Trang | Mô tả |
|-------|-------|
| Trang chủ | Giới thiệu sản phẩm, lợi ích, giá cả |
| Đăng ký | Tạo tài khoản mới |
| Đăng nhập | Truy cập hệ thống |
| Chương trình khai giảng | Thông tin đăng ký khóa học mới |

### Học sinh
| Trang | Mô tả |
|-------|-------|
| Dashboard | Tổng quan khóa học, tiến độ, lịch sắp tới |
| Luyện tập AI | Giao diện luyện nói với AI |
| Đặt lịch | Xem và book video call với giáo viên |
| Chương trình học | Xem 8 modules và nội dung từng module |
| Chi tiết module | Mục tiêu học tập, yêu cầu đầu ra |
| Kết nối | Liên kết với phụ huynh/giáo viên |

### Phụ huynh
| Trang | Mô tả |
|-------|-------|
| Dashboard | Tổng quan học tập của con |
| Lịch sử học tập | Chi tiết từng buổi học của con |
| Video tiến bộ | Xem video trước/sau của con |
| Thanh toán | Lịch sử thanh toán học phí |

### Giáo viên
| Trang | Mô tả |
|-------|-------|
| Dashboard | Lịch dạy, danh sách học sinh |
| Chi tiết buổi học | Xem thông tin học sinh, viết feedback |

---

## 📈 Chỉ Số Thành Công (KPIs)

### Đối với học sinh
- Điểm đánh giá từ AI (trung bình 6 tiêu chí)
- Số buổi luyện tập AI mỗi tuần
- Tỷ lệ hoàn thành module đúng hạn
- Sự cải thiện giữa video "Trước" và "Sau"

### Đối với hệ thống
- Số học sinh đăng ký
- Tỷ lệ hoàn thành khóa học
- Số buổi video call được đặt
- Điểm hài lòng của phụ huynh

---

## 🔄 Quy Trình Nghiệp Vụ

### 1. Quy trình đăng ký học

1. Học sinh đăng ký tài khoản
2. Phụ huynh kết nối tài khoản
3. Thanh toán học phí
4. Bắt đầu học Module 1

### 2. Quy trình học 1 tuần

1. **Thứ 2:** Đến lớp học trực tiếp
2. **Thứ 3-6:** Luyện tập với AI (ít nhất 1 lần) + Book lịch video call cho cuối tuần
3. **Thứ 7/CN:** Video call với giáo viên (60 phút)
4. **Hoàn thành Module** -> Chuyển sang Module tiếp theo

### 3. Quy trình đánh giá

1. Học sinh nói
2. AI ghi nhận
3. AI phân tích
4. Feedback chi tiết
5. Lưu vào lịch sử
6. Phụ huynh/Giáo viên xem được

---

## 📋 Phụ Lục

### A. Khung trình độ CEFR

| Mức | Tên gọi | Mô tả |
|-----|---------|-------|
| A1 | Beginner | Hiểu và sử dụng các cụm từ cơ bản |
| A2 | Elementary | Giao tiếp trong các tình huống đơn giản |
| B1 | Intermediate | Xử lý hầu hết tình huống khi đi du lịch |
| B1+ | Upper Intermediate | Tương tác với mức độ lưu loát nhất định |

### B. Chủ đề 8 Modules (Ví dụ)

| Module | Chủ đề | Mục tiêu |
|--------|--------|----------|
| 1 | Work | Nói về công việc, nghề nghiệp |
| 2 | Hometown | Mô tả quê hương, nơi sống |
| 3 | Education | Thảo luận về giáo dục, trường học |
| 4 | Travel | Chia sẻ trải nghiệm du lịch |
| 5 | Technology | Bàn về công nghệ trong cuộc sống |
| 6 | Health | Nói về sức khỏe, lối sống |
| 7 | Environment | Thảo luận môi trường, thiên nhiên |
| 8 | Future Plans | Chia sẻ kế hoạch tương lai |

### C. Liên hệ & Hỗ trợ

Để biết thêm thông tin chi tiết về dự án, vui lòng liên hệ đội ngũ phát triển.

---

*Tài liệu này được cập nhật lần cuối: 27/01/2026*

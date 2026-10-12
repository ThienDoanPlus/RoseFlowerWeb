# HƯỚNG DẪN THIẾT LẬP LƯU TRỮ TRÊN CLOUD
## DỰ ÁN: Rose Flowers (DJANGO REST FRAMEWORK + CLOUD DATABASE + CLOUDINARY)

---

## 1. TỔNG QUAN HẠ TẦNG CLOUD

Hệ thống đã được thiết kế sẵn sàng để chạy 100% dữ liệu thực tế trên Cloud:
- **Cloud Database**: **PostgreSQL** trên [Neon.tech](https://neon.tech) hoặc [Supabase](https://supabase.com) (Miễn phí, Serverless, sao lưu tự động).
- **Cloud Storage (Hình ảnh hoa & Gallery)**: **Cloudinary** (Miễn phí 25GB, CDN toàn cầu tải ảnh cực nhanh, tự động nén WebP).
- **Backend API**: **Django REST Framework** (`/backend`).
- **Frontend SPA**: **React 19 + TypeScript + Vite** (`/`).

---

## 2. BƯỚC 1: LỰA CHỌN & LẤY LINK DATABASE CLOUD (TiDB hoặc Neon PostgreSQL)

Hệ thống hỗ trợ 100% cả **TiDB Cloud (MySQL Distributed)** và **PostgreSQL (Neon.tech / Supabase)**:

### 🔹 Cách 1: Sử dụng TiDB Cloud (Khuyên dùng - Rất mạnh, tương thích MySQL, Free 5GB vĩnh viễn)
1. Truy cập [https://tidbcloud.com](https://tidbcloud.com) và đăng nhập nhanh bằng Google/GitHub.
2. Nhấn **Create Cluster** -> Chọn loại **Serverless** (Miễn phí 5GiB, 50 triệu Request Units/tháng).
3. Chọn Region **Singapore (ap-southeast-1)** để có tốc độ truyền tải nhanh nhất về Việt Nam.
4. Đặt tên Cluster: `rose-flower-db` -> Nhấn **Create**.
5. Nhấn nút **Connect** ở góc phải:
   - Chọn phương thức kết nối: **General** hoặc **Django / Python**.
   - Tạo mật khẩu root và copy chuỗi **Connection String**:
     ```text
     mysql://2xxxxxx.root:YourPassword@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?ssl-mode=VERIFY_IDENTITY
     ```
   - (Bạn có thể đổi tên database từ `/test` thành tên mong muốn ví dụ `/rose_flower_db`).
6. Copy chuỗi này để dán vào biến `DATABASE_URL` trong file `backend/.env`.

---

### 🔹 Cách 2: Sử dụng Neon PostgreSQL (Nếu bạn thích PostgreSQL)
1. Truy cập [https://neon.tech](https://neon.tech) và đăng nhập nhanh bằng Google/GitHub.
2. Nhấn **Create a Project** (Đặt tên: `rose-flower-db`, chọn region Singapore: `ap-southeast-1`).
3. Sau khi tạo xong, copy chuỗi **Connection String**:
   ```text
   postgresql://alex:Abc123xyz@ep-cool-flower-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Dán vào biến `DATABASE_URL` trong file `backend/.env`.

---

## 3. BƯỚC 2: LẤY KHÓA LƯU ẢNH CLOUDINARY (1 PHÚT)

1. Truy cập [https://cloudinary.com](https://cloudinary.com) và tạo tài khoản miễn phí.
2. Tại trang Dashboard chính (Programmable Media), copy 3 thông số:
   - **Cloud Name**: ví dụ `dam7flower`
   - **API Key**: ví dụ `123456789012345`
   - **API Secret**: ví dụ `abcdefgh12345678`

---

## 4. BƯỚC 3: CẤU HÌNH FILE `backend/.env`

Trong thư mục `backend/`, sao chép file `.env` thành `.env`:
```bash
cp backend/.env backend/.env
```
Mở file `backend/.env` và điền các thông tin Cloud vừa lấy được:
```env
SECRET_KEY="django-insecure-rose-flowers-2026-production-key"
DEBUG=True
ALLOWED_HOSTS="localhost,127.0.0.1,0.0.0.0"

# Dán link Neon PostgreSQL của bạn vào đây:
DATABASE_URL="postgresql://alex:Abc123xyz@ep-cool-flower-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Dán thông tin Cloudinary của bạn vào đây:
CLOUDINARY_CLOUD_NAME="dam7flower"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefgh12345678"

CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

---

## 5. BƯỚC 4: KHỞI TẠO BẢNG & NẠP DỮ LIỆU LÊN CLOUD (SEED DATA)

Mở terminal trong thư mục `backend`:
```bash
cd backend

# 1. Cài đặt thư viện Python
pip install -r requirements.txt

# 2. Tạo các bảng cơ sở dữ liệu trên Cloud PostgreSQL
python manage.py makemigrations accounts catalog promotions orders payments reviews
python manage.py migrate

# 3. Tạo tài khoản Admin quản lý tiệm
python manage.py createsuperuser

# 4. Nạp tự động toàn bộ danh mục hoa, sản phẩm hoa sáp và voucher lên Cloud Database
python seed_data.py
```

Sau khi chạy xong lệnh `python seed_data.py`, toàn bộ dữ liệu mẫu đã chính thức nằm trên Cloud Database của bạn!

---

## 6. BƯỚC 5: KHỞI CHẠY HỆ THỐNG

### Khởi chạy Backend Django:
```bash
cd backend
python manage.py runserver 8000
```
- API sẽ hoạt động tại: `http://localhost:8000/api/`
- Trang quản trị Django Admin: `http://localhost:8000/admin/`

### Khởi chạy Frontend React:
Ở một cửa sổ terminal khác tại thư mục gốc:
```bash
npm run dev
```
- Giao diện web tại: `http://localhost:3000/`
- Frontend sẽ tự động gọi trực tiếp vào API Backend Cloud tại cổng 8000!

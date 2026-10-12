# HƯỚNG DẪN DEPLOY TOÀN DIỆN LÊN GITHUB, RENDER & VERCEL

Hệ thống **Rose Flowers** được thiết kế theo kiến trúc chuẩn doanh nghiệp:
- **Mã nguồn tập trung:** 1 Repository trên GitHub (chứa cả Frontend & Backend).
- **Backend API (Django REST Framework + TiDB Cloud):** Deploy miễn phí trên [Render.com](https://render.com).
- **Frontend SPA (React 19 + Vite):** Deploy miễn phí với CDN toàn cầu trên [Vercel.com](https://vercel.com).

---

## 🚀 BƯỚC 1: ĐẨY CODE LÊN GITHUB (1 PHÚT)

1. Mở trình duyệt, truy cập [https://github.com/new](https://github.com/new) và tạo một Repository mới:
   - **Repository name:** `RoseFlowerWeb`
   - Chọn: **Public** (hoặc **Private** tùy ý)
   - **Lưu ý:** Không tích chọn *Add a README file*, *Add .gitignore* (vì dự án đã có sẵn).
   - Nhấn **Create repository**.

2. Mở Terminal tại thư mục dự án (`/Users/macbook/Desktop/RoseFlowerWeb`) và chạy các lệnh sau:
   ```bash
   # 1. Thêm toàn bộ file vào Git
   git add .

   # 2. Tạo commit đầu tiên
   git commit -m "feat: complete Rose Flowers ecommerce system with Vite, DRF, TiDB Cloud and public deployment"

   # 3. Đổi tên nhánh chính thành main
   git branch -M main

   # 4. Gắn link GitHub của bạn (thay thế username của bạn vào URL dưới đây)
   git remote add origin https://github.com/<USERNAME_GITHUB_CUA_BAN>/RoseFlowerWeb.git

   # 5. Đẩy code lên GitHub
   git push -u origin main
   ```

---

## 🌐 BƯỚC 2: DEPLOY BACKEND DJANGO LÊN RENDER (2 PHÚT)

1. Truy cập [https://dashboard.render.com](https://dashboard.render.com) và đăng nhập bằng tài khoản GitHub.
2. Nhấn nút **New +** ở góc trên bên phải -> Chọn **Web Service**.
3. Chọn kết nối với repository **`RoseFlowerWeb`** vừa tạo.
4. Điền các thông số cấu hình như sau:
   - **Name:** `rose-flower-backend` (hoặc tên bạn thích)
   - **Region:** `Singapore` (để kết nối TiDB Cloud với độ trễ thấp nhất)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn config.wsgi:application`
   - **Instance Type:** `Free` ($0/tháng)

5. Kéo xuống mục **Environment Variables** (Biến môi trường), thêm các biến sau:
   | Key | Value | Ghi chú |
   |---|---|---|
   | `PYTHON_VERSION` | `3.11.0` | Phiên bản Python chuẩn |
   | `DEBUG` | `False` | Tắt chế độ debug trên production |
   | `DJANGO_SECRET_KEY` | *(Bấm Generate hoặc nhập chuỗi ngẫu nhiên)* | Khóa bí mật Django |
   | `ALLOWED_HOSTS` | `.onrender.com,localhost,127.0.0.1` | Cho phép domain Render |
   | `DATABASE_URL` | `mysql://...` *(Dán chuỗi kết nối TiDB Cloud của bạn)* | Cơ sở dữ liệu Cloud |

6. Nhấn **Deploy Web Service**:
   - Render sẽ tự động chạy file `backend/build.sh`: cài đặt thư viện, gom staticfiles, chạy migration và nạp tự động 78 sản phẩm hoa sáp thật vào TiDB Cloud!
   - Khi build xong, bạn sẽ nhận được một đường link công khai dạng:
     👉 `https://rose-flower-backend.onrender.com`

---

## ⚡ BƯỚC 3: DEPLOY FRONTEND REACT LÊN VERCEL (1 PHÚT)

1. Truy cập [https://vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Nhấn **Add New...** -> Chọn **Project**.
3. Tìm và nhấn nút **Import** bên cạnh repository **`RoseFlowerWeb`**.
4. Cấu hình dự án (Vercel đã tự động nhận diện file `vercel.json`):
   - **Project Name:** `rose-flowers` (hoặc tên tùy thích)
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (để mặc định)
   - **Build and Output Settings:** Để mặc định (`npm run build` và thư mục `dist`).
5. Mở rộng mục **Environment Variables** (Biến môi trường) và thêm:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://rose-flower-backend.onrender.com` *(Link Backend Render bạn vừa nhận được ở Bước 2, KHÔNG có dấu gạch chéo `/` ở cuối)*.
6. Nhấn nút **Deploy**:
   - Vercel sẽ tự động build trang web chỉ trong khoảng **30 - 45 giây**.
   - Khi hoàn tất, bạn sẽ nhận được đường link web public toàn cầu:
     🎉 `https://rose-flowers.vercel.app`

---

## 💡 CƠ CHẾ DỰ PHÒNG THÔNG MINH (HIGH AVAILABILITY)
- **Tự động chuyển đổi mượt mà:** Nếu Backend trên Render đang ở chế độ ngủ (Free tier sleep sau 15 phút không có request), Frontend trên Vercel có sẵn cơ chế **Smart Offline Cache / Mock Fallback** tự động hiển thị ngay 78 mẫu sản phẩm và giỏ hàng mà không bao giờ bị đứng màn hình hay lỗi trắng trang!
- **Tự động CI/CD:** Mỗi lần bạn `git push` lên GitHub, Render và Vercel sẽ tự động phát hiện và cập nhật phiên bản mới nhất hoàn toàn tự động!

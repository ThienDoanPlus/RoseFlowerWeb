1. Lệnh Khởi Chạy Nhanh Dự Án
Mở Terminal tại thư mục dự án (/Users/macbook/Desktop/RoseFlowerWeb):

🔹 Bước 1: Khởi chạy Backend (Django API)
bash
npm run backend
(Hoặc chạy trực tiếp bằng python: ./backend/venv/bin/python backend/manage.py runserver 0.0.0.0:8000)

🌐 Backend API: http://localhost:8000
📌 Danh mục hoa & bộ lọc: http://localhost:8000/api/flowers/
⚙️ Trang quản trị Django Admin: http://localhost:8000/admin/
🔹 Bước 2: Khởi chạy Frontend (Giao diện Khách hàng & Quản trị)
Mở một cửa sổ Terminal mới:

bash
npm run dev
🌐 Giao diện Website: http://localhost:3000
2. Các Lệnh Quản Lý & Nạp Dữ Liệu Sản Phẩm Thật
Mục đích	Lệnh thực thi	Ghi chú
Nạp dữ liệu thật vào Database	npm run seed	Tự động đọc và nạp toàn bộ 78 mẫu hoa từ thư mục production/ vào SQLite.
Tạo lại danh mục từ ảnh	./backend/venv/bin/python generate_catalog.py	Quét lại ảnh, phân tích màu sắc và cập nhật 6 chiều lọc.
Đồng bộ mockData	./backend/venv/bin/python build_mock_data.py	Cập nhật file dữ liệu src/data/mockData.ts.
Chạy Migration Database	./backend/venv/bin/python backend/manage.py migrate	Cập nhật cấu trúc bảng cơ sở dữ liệu.
3. Lệnh Chạy Toàn Bộ Kiểm Thử Tự Động (Tests)
Bộ kiểm thử	Lệnh thực thi	Kết quả chuẩn
Kiểm thử toàn bộ (All)	npm run test:all	Chạy cả Frontend và Backend song song.
Kiểm thử Frontend (Vitest CLI)	npm test	Kiểm tra giỏ hàng, cước ship, voucher, RBAC.
Kiểm thử Backend (DRF)	npm run test:backend	Kiểm tra MoMo, VNPay, VietQR, quyền Admin/Staff.
4. Tài Khoản Đăng Nhập Phân Quyền (RBAC)
Bạn có thể bấm Đăng nhập Google trên thanh điều hướng hoặc nhập các email sau để chuyển đổi vai trò:

Khách hàng (CUSTOMER): nguyenthiendoan2@gmail.com (Đặt hoa, xem đơn, chat Zalo)
Nhân viên cắm hoa (STAFF): florist.mai@roseflowers.vn (Xem Kanban đơn hàng, in thiệp, đổi trạng thái)
Chủ cửa hàng / Quản lý (ADMIN): admin@roseflowers.vn (Toàn quyền quản lý kho, doanh thu, voucher, duyệt đánh giá)
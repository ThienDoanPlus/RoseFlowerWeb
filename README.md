# Rose Flowers - NỀN TẢNG ĐẶT HOA TƯƠI TRỰC TUYẾN & THANH TOÁN BẢO MẬT

Hệ thống thương mại điện tử chuyên biệt cho ngành hoa tươi và hoa sáp nghệ thuật cao cấp tại Việt Nam, tích hợp đầy đủ phân hệ **Frontend React 19 SPA (Vite, TypeScript, Tailwind CSS v4)** và **Backend Django REST Framework (DRF, RBAC 3 Roles, SQLite/PostgreSQL)**.

---

## 1. TỔNG QUAN HỆ THỐNG & TÍNH NĂNG NỔI BẬT

1. **Phân quyền 3 Vai Trò (RBAC Matrix)**:
   - **Khách hàng (`CUSTOMER`)**: Duyệt catalog, tìm kiếm theo ý nghĩa hoa, đặt hàng, tự động hưởng chiết khấu số lượng lớn, áp dụng voucher ngày lễ (8/3, 20/10, Valentine...), chọn vị trí giao trên Google Maps, thanh toán trực tuyến bảo mật, tra cứu đơn hàng theo thời gian thực và đánh giá sản phẩm.
   - **Nhân viên tư vấn & Florist (`STAFF`)**: Bảng điều phối **Kanban đơn hàng thời gian thực**, xuất/in thiệp chúc mừng trang nhã (chuẩn 10x15cm), cập nhật tiến độ cắm hoa & bàn giao shipper, trực chat tư vấn khách hàng.
   - **Quản lý tiệm (`ADMIN`)**: Bảng điều hành tài chính & KPIs (doanh thu, đơn hàng, AOV, tỷ trọng thanh toán), Quản lý sản phẩm hoa (CRUD), Quản lý voucher khuyến mãi & dịp lễ (CRUD), Quản lý phân quyền & nhân sự, Kiểm duyệt đánh giá khách hàng.

2. **Cổng Thanh Toán Trực Tuyến Việt Nam**:
   - **VietQR (Napas 24/7)**: Tự động sinh mã QR động theo chuẩn Napas với MB Bank (970422), STK tiệm hoa, số tiền chính xác, nội dung chuyển khoản `HOA {MÃ_ĐƠN}`.
   - **Ví MoMo**: Tích hợp mã MoMo QR và chữ ký bảo mật HMAC-SHA256.
   - **Cổng VNPay**: Hỗ trợ quét VNPay-QR và thẻ ATM 40+ ngân hàng nội địa.
   - **Ví ZaloPay & COD**: Đa dạng lựa chọn cho khách hàng.

3. **Bản đồ & Vận chuyển**:
   - Tích hợp tính cước phí giao hoa tự động theo km từ chi nhánh **294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM**:
     - Bán kính < 3 km: **Miễn phí giao hàng (Freeship)**
     - 3 – 10 km: **25.000 ₫**
     - 10 – 20 km: **45.000 ₫**
     - Trên 20 km: **70.000 ₫** (Bảo quản chuyên dụng)

4. **Kiểm thử tự động toàn diện (100% Pass)**:
   - **Frontend Unit Tests (11 bài test)**: `testCalculateCartSubtotal`, `testApplyBulkOrderDiscount`, `testHolidayVoucherValidation`, `testShippingFeeByDistance`, `testFormatVND`, `testRatingAggregation`, `testRoleGuardAccess`.
   - **Backend DRF Tests (15 bài test)**: Workflow đơn hàng, chính sách voucher & đơn lớn, chữ ký thanh toán VietQR/MoMo/VNPay, ma trận phân quyền DRF Permissions (`IsCustomer`, `IsStaffMember`, `IsAdminUser`).

---

## 2. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### 2.1. Phân hệ Frontend Web (React 19 + TypeScript)

```bash
# Cài đặt thư viện
npm install --legacy-peer-deps

# Khởi chạy server phát triển (Port 3000)
npm run dev

# Chạy bộ kiểm thử đơn vị tự động (CLI Unit Tests)
npm test

# Build bản tối ưu cho Production
npm run build
```

Truy cập trên trình duyệt: `http://localhost:3000`

---

### 2.2. Phân hệ Backend API (Django REST Framework)

```bash
# Kích hoạt virtual environment Python
source backend/venv/bin/activate   # trên Linux/macOS
# hoặc backend\venv\Scripts\activate trên Windows

# Chạy migrations cơ sở dữ liệu
./backend/venv/bin/python backend/manage.py migrate

# Nạp dữ liệu mẫu (Sản phẩm hoa, Danh mục, Voucher, Tài khoản mẫu)
./backend/venv/bin/python backend/seed_data.py

# Khởi chạy DRF API Server (Port 8000)
./backend/venv/bin/python backend/manage.py runserver 0.0.0.0:8000

# Chạy bộ kiểm thử tự động Backend
./backend/venv/bin/python backend/run_tests.py
```

---

## 3. TÀI KHOẢN MẪU ĐỂ TRẢI NGHIỆM PHÂN QUYỀN RBAC

Bạn có thể sử dụng nút **Role Switcher** trực tiếp trên Header thanh điều hướng để chuyển đổi 1-click giữa các vai trò, hoặc đăng nhập với các tài khoản:

| Vai trò | Họ tên | Email | Mật khẩu | Quyền hạn đặc trưng |
|---|---|---|---|---|
| **CUSTOMER** | Nguyễn Thiên Đoan | `nguyenthiendoan2@gmail.com` | `Customer@123` | Mua hoa, áp voucher, thanh toán VietQR, tra cứu đơn, đánh giá |
| **STAFF** | Trần Thị Mai (Florist) | `florist.mai@roseflowers.vn` | `Staff@123` | Bảng Kanban tiếp nhận đơn, in thiệp chúc mừng, trực chat tư vấn |
| **ADMIN** | Lê Quốc Hưng (Quản lý) | `admin@roseflowers.vn` | `Admin@123` | Bảng điều hành doanh thu, CRUD hoa, CRUD voucher, phân quyền nhân sự |

---

## 4. CẤU TRÚC THƯ MỤC CHUẨN DOANH NGHIỆP

```text
RoseFlowerWeb/
├── backend/                      # PHÂN HỆ BACKEND DJANGO REST FRAMEWORK
│   ├── manage.py
│   ├── run_tests.py              # Runner kiểm thử Backend tự động
│   ├── seed_data.py              # Script nạp dữ liệu mẫu ban đầu
│   ├── requirements.txt
│   ├── config/                   # Cấu hình dự án Django (settings, urls, wsgi, asgi)
│   ├── apps/
│   │   ├── accounts/             # Quản lý User, Google Auth, Permissions RBAC
│   │   ├── catalog/              # Danh mục hoa, sản phẩm hoa tươi
│   │   ├── promotions/           # Voucher ngày lễ & chiết khấu sỉ
│   │   ├── orders/               # Đơn hàng, OrderItems, trạng thái đơn
│   │   ├── payments/             # Tích hợp VietQR, MoMo, VNPay, ZaloPay
│   │   ├── reviews/              # Đánh giá & bình luận sản phẩm
│   │   └── notifications/        # Dịch vụ gửi Gmail SMTP & Web Push
│   └── tests/                    # 15 bài kiểm thử đơn vị Backend DRF
│
├── src/                          # PHÂN HỆ FRONTEND REACT 19 TYPESCRIPT
│   ├── components/
│   │   ├── admin/                # AdminDashboard, FlowerManager, VoucherManager, UserRoleManager, ReviewModerator
│   │   ├── staff/                # StaffOrderBoard (Kanban), PrintCardModal, OrderStatusUpdater, CustomerChatDrawer
│   │   ├── layout/ & common/     # Navbar, Footer, MobileBottomBar, Toast, PromoBanner
│   │   └── checkout/ & catalog/  # CheckoutModal, CartDrawer, FlowerDetailModal, OrderTrackingModal
│   ├── store/                    # Redux-like Centralized State Store (RBAC, Cart, Orders, Chat, Vouchers)
│   ├── services/                 # API Client chuẩn DRF, paymentService
│   ├── types/                    # Định nghĩa kiểu dữ liệu an toàn TypeScript
│   └── utils/
│       ├── calculations.ts       # Hàm thuần tính toán: formatVND, subtotal, bulk discount, shipping fee
│       └── __tests__/            # Bộ kiểm thử đơn vị tự động (11 Unit Tests)
├── package.json
└── vite.config.ts
```

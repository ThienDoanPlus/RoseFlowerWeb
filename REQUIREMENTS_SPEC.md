# BỘ YÊU CẦU & KIẾN TRÚC HỆ THỐNG Rose Flowers
## Nền tảng Đặt hoa Tươi Trực Tuyến & Thanh Toán Bảo Mật

---

### 1. TỔNG QUAN HỆ THỐNG
Dự án **Rose Flowers** là nền tảng thương mại điện tử chuyên biệt cho ngành hoa tươi và quà tặng cao cấp tại Việt Nam. Hệ thống được thiết kế theo kiến trúc chuẩn mực:
- **Backend Architecture**: Chuẩn RESTful API mô hình Django Rest Framework (DRF) với Serializers, Generic Views, ViewSets, Authentication & Permissions.
- **Frontend Architecture**: React 19 SPA trên nền Vite, TypeScript an toàn kiểu dữ liệu, Tailwind CSS v4, Motion cho hiệu ứng mượt mà và Lucide Icons.
- **Thiết kế Responsive (Mobile-First)**: Tương thích 100% trên Smartphone, Tablet, Laptop và Desktop; tối ưu thao tác ngón cái (Thumb-zone) và Bottom Navigation Bar trên di động (>75% lượng truy cập).
- **Phân quyền 3 Role (RBAC)**: Khách hàng (`CUSTOMER`), Nhân viên tư vấn & Florist (`STAFF`), Quản lý tiệm (`ADMIN`).
- **State Management**: Redux-like centralized store quản lý toàn cục trạng thái giỏ hàng, thông tin người dùng, đơn hàng, mã giảm giá, đánh giá và thông báo.
- **Tích hợp Thanh toán Việt Nam**: VietQR (chuẩn Napas 24/7), Ví MoMo, Cổng VNPay, Ví ZaloPay, COD.
- **Bản đồ & Vận chuyển**: Tích hợp Google Maps xác định khoảng cách, chọn chi nhánh và tự động tính cước giao hoa hỏa tốc.
- **Tương tác Đa kênh**: Tích hợp Zalo OA / Chat, Facebook Messenger, Hotline tư vấn cắm hoa.
- **Thông báo & Tài khoản**: Đăng nhập qua Gmail/Google, gửi thông báo xác nhận đơn hàng qua Gmail, Push notification trạng thái đơn hàng thời gian thực.
- **Kiểm thử tự động**: Bộ kiểm thử đơn vị (Unit Tests) cho toàn bộ hàm tính toán nghiệp vụ.

---

### 2. THIẾT KẾ CƠ SỞ DỮ LIỆU & MỐI QUAN HỆ (RELATIONAL DATABASE SCHEMA)

#### 2.1 Bảng `users_user` (Người dùng & Phân quyền)
- `id` (UUID, Primary Key)
- `email` (Varchar 255, Unique, Indexed)
- `role` (Enum: `CUSTOMER`, `STAFF`, `ADMIN`, Default: `CUSTOMER`, Indexed)
- `full_name` (Varchar 150)
- `phone_number` (Varchar 20)
- `avatar_url` (Varchar 500)
- `is_active` (Boolean)
- `date_joined` (Timestamp)

#### 2.2 Bảng `catalog_category` (Danh mục hoa)
- `id` (Slug/Varchar 50, Primary Key)
- `name` (Varchar 100)
- `description` (Text)
- `icon_name` (Varchar 50)
- `display_order` (Integer)

#### 2.3 Bảng `catalog_flower` (Sản phẩm hoa tươi)
- `id` (Slug/Varchar 50, Primary Key)
- `name` (Varchar 200, Indexed)
- `botanical_name` (Varchar 200)
- `category_id` (ForeignKey -> `catalog_category.id`, on_delete=CASCADE)
- `base_price` (Decimal 12,2)
- `sale_price` (Decimal 12,2, Nullable)
- `image_url` (Varchar 500)
- `gallery` (JSONField - danh sách ảnh bổ sung)
- `short_description` (Varchar 500)
- `description` (Text)
- `meaning` (Text - Ý nghĩa loài hoa)
- `care_guide` (Text - Hướng dẫn chăm sóc)
- `occasions` (Array/JSONField - Danh sách dịp phù hợp)
- `rating_avg` (Decimal 3,2, Default 5.0)
- `reviews_count` (Integer, Default 0)
- `is_featured` (Boolean, Default False)
- `is_in_stock` (Boolean, Default True)
- `created_at` (Timestamp)

#### 2.4 Bảng `promotions_voucher` (Mã giảm giá & Khuyến mãi)
- `id` (Varchar 50, Primary Key)
- `code` (Varchar 50, Unique, Indexed)
- `title` (Varchar 200)
- `description` (Text)
- `discount_type` (Enum: `PERCENT`, `FIXED_AMOUNT`)
- `discount_value` (Decimal 12,2)
- `min_order_value` (Decimal 12,2, Default 0)
- `max_discount_amount` (Decimal 12,2, Nullable)
- `min_quantity` (Integer, Default 1 - Phục vụ giảm giá số lượng lớn)
- `is_holiday_special` (Boolean, Default False)
- `applicable_holiday` (Varchar 50, Nullable)
- `valid_from` (Timestamp)
- `valid_to` (Timestamp)
- `usage_limit` (Integer)
- `used_count` (Integer, Default 0)

#### 2.5 Bảng `orders_order` (Đơn hàng)
- `id` (Varchar 50, Primary Key, Indexed)
- `user_id` (ForeignKey -> `users_user.id`, Nullable cho khách vãng lai)
- `customer_name` (Varchar 150)
- `customer_phone` (Varchar 20)
- `customer_email` (Varchar 255)
- `shipping_address` (Text)
- `delivery_district` (Varchar 100)
- `delivery_city` (Varchar 100)
- `branch_origin_id` (Varchar 50)
- `distance_km` (Decimal 5,2)
- `shipping_fee` (Decimal 12,2)
- `subtotal` (Decimal 12,2)
- `discount_amount` (Decimal 12,2, Default 0)
- `total_amount` (Decimal 12,2)
- `voucher_code` (Varchar 50, Nullable)
- `status` (Enum: `PENDING`, `ARRANGING`, `SHIPPING`, `DELIVERED`, `CANCELLED`)
- `greeting_message` (Text - Lời chúc trên thiệp)
- `sender_signature` (Varchar 100)
- `delivery_date` (Date)
- `delivery_time_slot` (Varchar 50)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### 2.6 Bảng `orders_orderitem` (Chi tiết mục đơn hàng)
- `id` (UUID, Primary Key)
- `order_id` (ForeignKey -> `orders_order.id`, on_delete=CASCADE)
- `flower_id` (ForeignKey -> `catalog_flower.id`, on_delete=PROTECT)
- `flower_name` (Varchar 200)
- `size_variant` (Enum: `STANDARD`, `DELUXE`, `PREMIUM`)
- `unit_price` (Decimal 12,2)
- `quantity` (Integer)
- `total_price` (Decimal 12,2)

#### 2.7 Bảng `payments_transaction` (Giao dịch thanh toán)
- `id` (Varchar 50, Primary Key)
- `order_id` (ForeignKey -> `orders_order.id`, on_delete=CASCADE)
- `method` (Enum: `VIETQR`, `MOMO`, `VNPAY`, `ZALOPAY`, `COD`)
- `amount` (Decimal 12,2)
- `status` (Enum: `PENDING`, `SUCCESS`, `FAILED`)
- `transaction_code` (Varchar 100, Indexed)
- `payment_gateway_payload` (JSONField)
- `paid_at` (Timestamp, Nullable)

#### 2.8 Bảng `reviews_review` (Đánh giá & Bình luận)
- `id` (UUID, Primary Key)
- `flower_id` (ForeignKey -> `catalog_flower.id`, on_delete=CASCADE)
- `user_id` (ForeignKey -> `users_user.id`, on_delete=SET_NULL, Nullable)
- `author_name` (Varchar 150)
- `author_avatar` (Varchar 500, Nullable)
- `rating` (Integer, 1-5 sao)
- `comment` (Text)
- `is_verified_buyer` (Boolean, Default True)
- `created_at` (Timestamp)

---

### 3. ĐẶC TẢ DJANGO REST FRAMEWORK (DRF) API ENDPOINTS

| HTTP Method | Endpoint URI | Mô tả | Serializer | Quyền truy cập |
|---|---|---|---|---|
| `GET` | `/api/flowers/` | Lấy danh sách hoa (kèm lọc, tìm kiếm, phân trang) | `FlowerListSerializer` | AllowAny |
| `GET` | `/api/flowers/{slug}/` | Chi tiết sản phẩm, ý nghĩa hoa, bài đánh giá | `FlowerDetailSerializer` | AllowAny |
| `GET` | `/api/categories/` | Lấy danh sách danh mục hoa | `CategorySerializer` | AllowAny |
| `POST` | `/api/vouchers/validate/` | Kiểm tra tính hợp lệ & tính tiền giảm giá | `VoucherValidationSerializer` | AllowAny |
| `GET` | `/api/vouchers/` | Danh sách mã voucher công khai (ngày lễ, số lượng lớn) | `VoucherListSerializer` | AllowAny |
| `POST` | `/api/orders/` | Tạo đơn hàng mới & đặt chỗ hoa | `OrderCreateSerializer` | AllowAny/Auth |
| `GET` | `/api/orders/{id}/` | Tra cứu trạng thái đơn hàng thời gian thực | `OrderDetailSerializer` | AllowAny |
| `POST` | `/api/payments/create-intent/`| Khởi tạo thanh toán (VietQR, MoMo, VNPay, ZaloPay) | `PaymentIntentSerializer` | AllowAny |
| `POST` | `/api/payments/verify-webhook/`| Callback / Webhook xác thực giao dịch thành công | `PaymentWebhookSerializer`| Service/Key |
| `POST` | `/api/reviews/` | Gửi đánh giá cho sản phẩm đã mua | `ReviewCreateSerializer` | IsAuthenticated/Buyer |
| `POST` | `/api/auth/google/` | Đăng nhập / Đăng ký nhanh với Gmail/Google OAuth | `GoogleAuthSerializer` | AllowAny |

---

### 4. PHƯƠNG THỨC THANH TOÁN VIỆT NAM (PAYMENT GATEWAYS)

1. **VietQR (Napas 24/7)**:
   - Tự động sinh mã QR động theo chuẩn Napas với: Mã ngân hàng (970422 - MB Bank), STK (`0988776655`), Số tiền chính xác theo đơn hàng, Nội dung chuyển khoản định dạng `HOA {MÃ_ĐƠN}`.
   - Cơ chế Polling / WebSocket lắng nghe xác nhận tiền về tài khoản trong 5-10 giây.
2. **Cổng Ví MoMo**:
   - Tích hợp MoMo QR Code và liên kết mở ứng dụng MoMo trên thiết bị di động.
3. **Cổng VNPay**:
   - Hỗ trợ thanh toán qua quét VNPay-QR và thẻ ATM 40+ ngân hàng nội địa Việt Nam.
4. **Cổng ZaloPay**:
   - Hỗ trợ quét mã ZaloPay QR hoặc ví điện tử Zalo.
5. **COD (Thanh toán khi nhận hàng)**:
   - Dành cho khách hàng muốn kiểm tra hoa trực tiếp trước khi thanh toán.

---

### 5. KIỂM THỬ ĐƠN VỊ (UNIT TESTING SUITE)

Hệ thống được trang bị bộ kiểm thử tự động cho toàn bộ các hàm nghiệp vụ trọng yếu:
- `testCalculateCartSubtotal`: Kiểm tra tính tổng giá trị hàng hóa chính xác.
- `testApplyBulkOrderDiscount`: Kiểm tra điều kiện giảm giá khi mua số lượng lớn (>= 3 bó hoặc >= 2.000.000đ).
- `testHolidayVoucherValidation`: Kiểm tra hợp lệ của mã giảm giá dịp lễ (8/3, 20/10, Valentine).
- `testShippingFeeByDistance`: Kiểm tra logic tính cước phí giao hoa theo cự ly km từ Google Maps chi nhánh.
- `testFormatVND`: Đảm bảo định dạng tiền tệ Việt Nam đồng chuẩn xác có phân cách hàng nghìn.
- `testRatingAggregation`: Đảm bảo công thức tính điểm trung bình số sao và số lượt đánh giá.

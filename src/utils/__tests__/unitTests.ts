/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem, Review, TestResult, Voucher, PushNotification, User, Order, UsedVoucherRecord } from '../../types';
import {
  calculateAverageRating,
  calculateBulkDiscount,
  calculateCartSubtotal,
  calculateOrderFinalTotal,
  calculateShippingFee,
  calculateTotalQuantity,
  canAccessResource,
  formatVND,
  validateAndCalculateVoucher,
  checkVoucherUsageStatus,
} from '../calculations';
import { filterRelevantNotifications } from '../../store';
import { estimateDeliveryDistance } from '../distanceCalculator';

// Real flower fixture for testing
const mockFlower = {
  id: 'rose-679k-flower1',
  name: 'Rose Grand Majesty 99 Bông - Đỏ Nhung Quyến Rũ (Mẫu 1)',
  botanicalName: 'Everlasting Velvet Red Bouquet #1 (Grand Majesty 99 Bông)',
  categoryId: 'bo-hoa-dai-tiec',
  basePrice: 679000,
  imageUrl: '/production/679k/flower1/img.jpg',
  gallery: [],
  shortDescription: 'Bó hoa sáp đại tiệc 99 bông đỏ nhung lưu hương 3-5 năm',
  description: 'Mô tả hoa sáp thực tế tại 294 Phạm Văn Bạch',
  meaning: 'Tình yêu vĩnh cửu 99 năm thiên trường địa cửu',
  careGuide: 'Bảo quản nơi khô ráo, tránh nước',
  occasions: ['Valentine', 'Sinh nhật', 'Cầu hôn lãng mạn'],
  ratingAvg: 4.9,
  reviewsCount: 18,
  isInStock: true,
};

/**
 * Suite kiểm thử đơn vị tự động (Unit Test Runner)
 * Kiểm tra tính đúng đắn của toàn bộ các hàm xử lý nghiệp vụ theo đặc tả REQUIREMENTS_SPEC & ROADMAP
 */
export function runAllUnitTests(): {
  results: TestResult[];
  passedCount: number;
  failedCount: number;
  totalDurationMs: number;
} {
  const results: TestResult[] = [];
  const startTime = performance.now();

  function test(name: string, description: string, fn: () => { expected: unknown; actual: unknown; passed: boolean }) {
    const t0 = performance.now();
    try {
      const outcome = fn();
      const t1 = performance.now();
      results.push({
        name,
        description,
        passed: outcome.passed,
        expected: outcome.expected,
        actual: outcome.actual,
        durationMs: Number((t1 - t0).toFixed(2)),
      });
    } catch (err: unknown) {
      const t1 = performance.now();
      results.push({
        name,
        description,
        passed: false,
        expected: 'No Error',
        actual: 'Threw Error',
        error: err instanceof Error ? err.message : String(err),
        durationMs: Number((t1 - t0).toFixed(2)),
      });
    }
  }

  // TEST 1: formatVND
  test('testFormatVND', 'Định dạng 850.000 ₫ chuẩn phân cách hàng nghìn tiếng Việt', () => {
    const actual1 = formatVND(850000);
    const actual0 = formatVND(0);
    const passed = (actual1 === '850.000\u00A0₫' || actual1.replace(/\u00A0/g, ' ') === '850.000 ₫') &&
                   (actual0 === '0\u00A0₫' || actual0.replace(/\u00A0/g, ' ') === '0 ₫');
    return { expected: '850.000 ₫', actual: actual1.replace(/\u00A0/g, ' '), passed };
  });

  // TEST 2: calculateCartSubtotal
  test('testCalculateCartSubtotal', 'Tính tổng giá trị hàng hóa chính xác khi có nhiều sản phẩm và số lượng', () => {
    const items: CartItem[] = [
      { id: '1', flower: mockFlower, sizeVariant: 'standard', unitPrice: 500000, quantity: 2 },
      { id: '2', flower: mockFlower, sizeVariant: 'deluxe', unitPrice: 750000, quantity: 1 },
    ];
    // 500.000 * 2 + 750.000 * 1 = 1.750.000
    const actual = calculateCartSubtotal(items);
    const expected = 1750000;
    return { expected, actual, passed: actual === expected };
  });

  // TEST 3: calculateTotalQuantity
  test('testCalculateTotalQuantity', 'Đếm chính xác tổng số lượng bó hoa trong giỏ hàng', () => {
    const items: CartItem[] = [
      { id: '1', flower: mockFlower, sizeVariant: 'standard', unitPrice: 300000, quantity: 3 },
      { id: '2', flower: mockFlower, sizeVariant: 'premium', unitPrice: 600000, quantity: 2 },
    ];
    const actual = calculateTotalQuantity(items);
    const expected = 5;
    return { expected, actual, passed: actual === expected };
  });

  // TEST 4: calculateBulkDiscount - Mua >= 3 bó giảm 10%
  test('testApplyBulkOrderDiscount_QuantityTier', 'Tự động giảm 10% khi khách mua từ 3 bó trở lên', () => {
    const items: CartItem[] = [
      { id: '1', flower: mockFlower, sizeVariant: 'standard', unitPrice: 500000, quantity: 3 },
    ];
    const subtotal = 1500000;
    const result = calculateBulkDiscount(items, subtotal);
    // 10% of 1.500.000 = 150.000
    return {
      expected: 150000,
      actual: result.bulkDiscount,
      passed: result.isEligible && result.bulkDiscount === 150000 && result.bulkRate === 10,
    };
  });

  // TEST 5: calculateBulkDiscount - Mua >= 2.000.000đ giảm 15% VIP
  test('testApplyBulkOrderDiscount_VIPTier', 'Tự động giảm 15% VIP khi đơn hàng >= 2.000.000 ₫', () => {
    const items: CartItem[] = [
      { id: '1', flower: mockFlower, sizeVariant: 'premium', unitPrice: 1200000, quantity: 2 },
    ];
    const subtotal = 2400000;
    const result = calculateBulkDiscount(items, subtotal);
    // 15% of 2.400.000 = 360.000
    return {
      expected: 360000,
      actual: result.bulkDiscount,
      passed: result.isEligible && result.bulkDiscount === 360000 && result.bulkRate === 15,
    };
  });

  // TEST 6: validateAndCalculateVoucher - Holiday Special Voucher (8/3, 20/10, Valentine)
  test('testHolidayVoucherValidation', 'Kiểm tra tính hợp lệ của mã giảm giá dịp lễ (8/3, 20/10, Valentine)', () => {
    const womensDayVoucher: Voucher = {
      code: 'WOMENSDAY',
      title: 'Quốc Tế Phụ Nữ 8/3',
      description: 'Giảm 20% tối đa 200k',
      discountType: 'PERCENT',
      discountValue: 20,
      minOrderValue: 500000,
      maxDiscountAmount: 200000,
      isHolidaySpecial: true,
      validUntil: '2026-12-31',
    };
    const subtotal = 1500000; // 20% = 300.000 -> capped at 200.000
    const result = validateAndCalculateVoucher(womensDayVoucher, subtotal, 2);
    return {
      expected: 200000,
      actual: result.discountAmount,
      passed: result.isValid && result.discountAmount === 200000,
    };
  });

  // TEST 7: validateAndCalculateVoucher - Minimum order value constraint
  test('testValidateVoucher_MinOrderFail', 'Từ chối áp dụng voucher khi chưa đạt giá trị đơn tối thiểu', () => {
    const voucher: Voucher = {
      code: 'VIP500',
      title: 'Giảm 500k',
      description: 'Cho đơn từ 2 triệu',
      discountType: 'FIXED',
      discountValue: 500000,
      minOrderValue: 2000000,
      validUntil: '2026-12-31',
    };
    const subtotal = 1200000; // Nhỏ hơn 2 triệu
    const result = validateAndCalculateVoucher(voucher, subtotal, 1);
    return {
      expected: false,
      actual: result.isValid,
      passed: result.isValid === false && result.discountAmount === 0,
    };
  });

  // TEST 8: calculateShippingFee by Google Maps distance
  test('testShippingFeeByDistance', 'Tính cước phí giao hoa theo cự ly km từ Google Maps chi nhánh (<3km freeship, 3-10km 25k, 10-20km 45k, >20km 70k)', () => {
    const free = calculateShippingFee(2.5); // <= 3km -> 0đ
    const tier1 = calculateShippingFee(8.0); // 3-10km -> 25.000đ
    const tier2 = calculateShippingFee(15.0); // 10-20km -> 45.000đ
    const tier3 = calculateShippingFee(25.0); // > 20km -> 70.000đ
    const passed = free === 0 && tier1 === 25000 && tier2 === 45000 && tier3 === 70000;
    return {
      expected: { free: 0, tier1: 25000, tier2: 45000, tier3: 70000 },
      actual: { free, tier1, tier2, tier3 },
      passed,
    };
  });

  // TEST 9: calculateOrderFinalTotal
  test('testCalculateOrderFinalTotal', 'Tính tổng thanh toán cuối cùng không bị âm và chọn mức giảm cao nhất', () => {
    const subtotal = 1000000;
    const voucherDiscount = 100000;
    const bulkDiscount = 150000; // Lấy 150.000đ thay vì 100.000đ
    const shippingFee = 25000;
    // 1.000.000 - 150.000 + 25.000 = 875.000
    const actual = calculateOrderFinalTotal(subtotal, voucherDiscount, bulkDiscount, shippingFee);
    const expected = 875000;
    return { expected, actual, passed: actual === expected };
  });

  // TEST 10: calculateAverageRating
  test('testRatingAggregation', 'Đảm bảo công thức tính điểm trung bình số sao và số lượt đánh giá', () => {
    const reviews: Review[] = [
      { id: '1', flowerId: 'f1', authorName: 'Lan', rating: 5, comment: 'Đẹp', date: '', isVerifiedBuyer: true },
      { id: '2', flowerId: 'f1', authorName: 'Huy', rating: 4, comment: 'Tươi', date: '', isVerifiedBuyer: true },
      { id: '3', flowerId: 'f1', authorName: 'Thảo', rating: 5, comment: 'Xuất sắc', date: '', isVerifiedBuyer: true },
    ];
    // (5 + 4 + 5) / 3 = 4.666... -> 4.7
    const result = calculateAverageRating(reviews);
    return {
      expected: { average: 4.7, count: 3 },
      actual: result,
      passed: result.average === 4.7 && result.count === 3,
    };
  });

  // TEST 11: testRoleGuardAccess (RBAC Permission Matrix)
  test('testRoleGuardAccess', 'Kiểm tra phân quyền RBAC: Khách không vào trang Staff/Admin, Staff không thể xóa hoa hoặc xem báo cáo tài chính, Admin toàn quyền', () => {
    const customerAccessStaff = canAccessResource('CUSTOMER', 'staff_board'); // false
    const customerAccessAdmin = canAccessResource('CUSTOMER', 'admin_dashboard'); // false
    const staffAccessBoard = canAccessResource('STAFF', 'staff_board'); // true
    const staffDeleteFlower = canAccessResource('STAFF', 'delete_flower'); // false
    const staffViewFinancial = canAccessResource('STAFF', 'view_financial_reports'); // false
    const adminDeleteFlower = canAccessResource('ADMIN', 'delete_flower'); // true
    const adminViewFinancial = canAccessResource('ADMIN', 'view_financial_reports'); // true

    const passed =
      customerAccessStaff === false &&
      customerAccessAdmin === false &&
      staffAccessBoard === true &&
      staffDeleteFlower === false &&
      staffViewFinancial === false &&
      adminDeleteFlower === true &&
      adminViewFinancial === true;

    return {
      expected: { customerProtected: true, staffProtected: true, adminFullAccess: true },
      actual: {
        customerProtected: !customerAccessStaff && !customerAccessAdmin,
        staffProtected: staffAccessBoard && !staffDeleteFlower && !staffViewFinancial,
        adminFullAccess: adminDeleteFlower && adminViewFinancial,
      },
      passed,
    };
  });

  // [12/12] Phân quyền thông báo riêng tư theo vai trò (Role-Based Notification Privacy)
  test('testRoleBasedNotificationPrivacy', 'Đảm bảo thông báo chỉ hiển thị đúng cho người có liên quan', () => {
    const mockNotifs: PushNotification[] = [
      {
        id: 'notif-1',
        title: 'Đơn hàng #ROSE-1234',
        message: 'Đang cắm hoa',
        timestamp: '10:00',
        type: 'order',
        read: false,
        orderId: 'ROSE-1234',
        targetRole: 'CUSTOMER',
        targetUserId: 'user-cust-1',
      },
      {
        id: 'notif-2',
        title: 'Đơn hàng #ROSE-5678',
        message: 'Đang giao hoa',
        timestamp: '10:05',
        type: 'order',
        read: false,
        orderId: 'ROSE-5678',
        targetRole: 'CUSTOMER',
        targetUserId: 'user-cust-2',
      },
      {
        id: 'notif-3',
        title: 'Duyệt VietQR',
        message: 'Chờ Admin duyệt tiền STK Vietcombank',
        timestamp: '10:10',
        type: 'order',
        read: false,
        orderId: 'ROSE-1234',
        targetRole: 'ADMIN',
      },
      {
        id: 'notif-4',
        title: 'Ưu đãi chào bạn mới',
        message: 'Mã ROSE10',
        timestamp: '10:15',
        type: 'promo',
        read: false,
        targetRole: 'ALL',
      },
    ];

    const customer1: User = {
      id: 'user-cust-1',
      name: 'Nguyen Van A',
      email: 'a@gmail.com',
      role: 'CUSTOMER',
      avatarUrl: '/avatars/1.jpg',
    };

    const mockOrders: Order[] = [
      {
        id: 'ROSE-1234',
        userId: 'user-cust-1',
        items: [],
        subtotal: 500000,
        discountAmount: 0,
        bulkDiscountAmount: 0,
        shippingFee: 0,
        totalAmount: 500000,
        paymentStatus: 'PAID',
        paymentMethod: 'VIETQR',
        orderStatus: 'ARRANGING',
        deliveryInfo: {
          recipientName: 'Nguyen Van A',
          recipientPhone: '0901234567',
          recipientEmail: 'a@gmail.com',
          address: '294 Phạm Văn Bạch',
          district: 'Tân Sơn',
          city: 'TP.HCM',
          branchId: 'branch-pvb',
          distanceKm: 1,
          deliveryDate: '2026-11-10',
          deliveryTimeSlot: '45p',
          cardMessage: '',
          senderName: '',
        },
        createdAt: '2026-11-10T10:00:00Z',
      },
    ];

    // Khách hàng 1 chỉ thấy notif-1 (đơn của mình) và notif-4 (ưu đãi chung)
    const cust1Notifs = filterRelevantNotifications(mockNotifs, 'CUSTOMER', customer1, null, null, mockOrders);
    const cust1Ids = cust1Notifs.map((n) => n.id);

    // Admin thấy notif-3 (cần duyệt tiền)
    const adminNotifs = filterRelevantNotifications(mockNotifs, 'ADMIN', null, null, null, mockOrders);
    const adminIds = adminNotifs.map((n) => n.id);

    // Khách vãng lai chỉ thấy notif-4 (ưu đãi chung), không thấy đơn của khách 1 hay admin
    const guestNotifs = filterRelevantNotifications(mockNotifs, 'CUSTOMER', null, null, null, mockOrders);
    const guestIds = guestNotifs.map((n) => n.id);

    const passed =
      cust1Ids.includes('notif-1') &&
      !cust1Ids.includes('notif-2') &&
      !cust1Ids.includes('notif-3') &&
      cust1Ids.includes('notif-4') &&
      adminIds.includes('notif-3') &&
      !adminIds.includes('notif-1') &&
      guestIds.length === 1 &&
      guestIds[0] === 'notif-4';

    return {
      expected: { cust1SeesOwnOnly: true, adminSeesBankOnly: true, guestSeesPromoOnly: true },
      actual: {
        cust1SeesOwnOnly: cust1Ids.includes('notif-1') && !cust1Ids.includes('notif-2') && !cust1Ids.includes('notif-3'),
        adminSeesBankOnly: adminIds.includes('notif-3') && !adminIds.includes('notif-1'),
        guestSeesPromoOnly: guestIds.length === 1 && guestIds[0] === 'notif-4',
      },
      passed,
    };
  });

  // TEST 13: Chính sách voucher ROSE10 - Chỉ được dùng 1 lần duy nhất trong đời trên mỗi khách hàng
  test(
    'testVoucherUsagePolicy_Rose10OnceEver',
    'Khách hàng chỉ được sử dụng mã chào bạn mới ROSE10 đúng 1 lần duy nhất trong đời',
    () => {
      const rose10Voucher: Voucher = {
        code: 'ROSE10',
        title: 'Chào bạn mới',
        description: 'Giảm 10% tối đa 100k',
        discountType: 'PERCENT',
        discountValue: 10,
        minOrderValue: 300000,
        maxDiscountAmount: 100000,
        validUntil: '2026-12-31',
      };

      const customerContext = {
        userId: 'usr-newbie',
        email: 'newbie@gmail.com',
        phone: '0908889999',
        usedVouchersHistory: [] as UsedVoucherRecord[],
        currentYear: 2026,
      };

      // Lần 1: Chưa dùng bao giờ -> Hợp lệ
      const firstTry = validateAndCalculateVoucher(rose10Voucher, 500000, 1, customerContext);

      // Giả lập sau khi đã đặt đơn xong, mã được lưu vào lịch sử
      const usedHistory: UsedVoucherRecord[] = [
        {
          code: 'ROSE10',
          usedAt: '2026-03-01T10:00:00Z',
          year: 2026,
          orderId: 'ROSE-111111',
          userId: 'usr-newbie',
          customerEmail: 'newbie@gmail.com',
          customerPhone: '0908889999',
        },
      ];

      // Lần 2: Cùng khách hàng này thử áp dụng lại ROSE10 -> Bị từ chối
      const secondTry = validateAndCalculateVoucher(rose10Voucher, 600000, 1, {
        ...customerContext,
        usedVouchersHistory: usedHistory,
      });

      const passed =
        firstTry.isValid === true &&
        firstTry.discountAmount === 50000 &&
        secondTry.isValid === false &&
        secondTry.discountAmount === 0 &&
        secondTry.message.includes('1 lần duy nhất');

      return {
        expected: { firstValid: true, secondValid: false },
        actual: { firstValid: firstTry.isValid, secondValid: secondTry.isValid },
        passed,
      };
    }
  );

  // TEST 14: Chính sách voucher lễ - Dùng tối đa 1 lần trong năm, mở lại vào năm sau
  test(
    'testVoucherUsagePolicy_HolidayOncePerYear',
    'Voucher lễ chỉ dùng được duy nhất trong năm đó, sang năm sau mới được dùng lại',
    () => {
      const holidayVoucher: Voucher = {
        code: 'WOMENSDAY',
        title: 'Mừng Quốc Tế Phụ Nữ 8/3',
        description: 'Giảm 20% tối đa 200k',
        discountType: 'PERCENT',
        discountValue: 20,
        minOrderValue: 500000,
        maxDiscountAmount: 200000,
        isHolidaySpecial: true,
        validUntil: '2026-12-31',
      };

      // Lịch sử: khách đã dùng WOMENSDAY trong năm 2026
      const usedIn2026History: UsedVoucherRecord[] = [
        {
          code: 'WOMENSDAY',
          usedAt: '2026-03-08T09:00:00Z',
          year: 2026,
          orderId: 'ROSE-888333',
          userId: 'usr-holiday-lover',
          customerEmail: 'holiday@gmail.com',
          customerPhone: '0912999888',
        },
      ];

      // Cùng năm 2026 -> Bị từ chối, báo đợi sang năm sau
      const retrySameYear = validateAndCalculateVoucher(holidayVoucher, 800000, 1, {
        userId: 'usr-holiday-lover',
        email: 'holiday@gmail.com',
        phone: '0912999888',
        usedVouchersHistory: usedIn2026History,
        currentYear: 2026,
      });

      // Sang năm sau (2027) -> Tự động mở lại và hợp lệ!
      const retryNextYear = validateAndCalculateVoucher(holidayVoucher, 800000, 1, {
        userId: 'usr-holiday-lover',
        email: 'holiday@gmail.com',
        phone: '0912999888',
        usedVouchersHistory: usedIn2026History,
        currentYear: 2027,
      });

      const passed =
        retrySameYear.isValid === false &&
        retrySameYear.discountAmount === 0 &&
        retrySameYear.message.includes('năm sau') &&
        retryNextYear.isValid === true &&
        retryNextYear.discountAmount === 160000;

      return {
        expected: { retrySameYearValid: false, retryNextYearValid: true },
        actual: { retrySameYearValid: retrySameYear.isValid, retryNextYearValid: retryNextYear.isValid },
        passed,
      };
    }
  );

  // TEST 15: Thuật toán tính khoảng cách và cước vận chuyển theo địa chỉ giao hàng
  test(
    'testDynamicDistanceAndShippingFeeCalculation',
    'Tính cước vận chuyển thông minh theo địa chỉ/quận huyện, ngăn chặn thất thoát freeship sai quy định',
    () => {
      // 1. Quanh tiệm hoa (Phạm Văn Bạch, Cống Lở < 3km) -> Freeship 0₫
      const nearStore = estimateDeliveryDistance({
        address: '294 Phạm Văn Bạch, Phường Tân Sơn',
        district: 'Quận Tân Bình',
        city: 'TP. Hồ Chí Minh',
      });

      const congLoStreet = estimateDeliveryDistance({
        address: '15 Đường Cống Lở, Phường 15',
        district: 'Quận Tân Bình',
        city: 'TP. Hồ Chí Minh',
      });

      // 2. Nội thành trung bình (Phú Nhuận 3 - 10km) -> 25.000₫
      const phuNhuan = estimateDeliveryDistance({
        address: '88 Phan Xích Long',
        district: 'Quận Phú Nhuận',
        city: 'TP. Hồ Chí Minh',
      });

      // 3. Trung tâm Quận 1 (10 - 20km) -> 45.000₫
      const quan1 = estimateDeliveryDistance({
        address: 'Tòa nhà Bitexco, Bến Nghé',
        district: 'Quận 1',
        city: 'TP. Hồ Chí Minh',
      });

      // 4. Ngoại thành xa (Củ Chi > 20km) -> 70.000₫
      const cuChi = estimateDeliveryDistance({
        address: 'Thị trấn Củ Chi',
        district: 'Huyện Củ Chi',
        city: 'TP. Hồ Chí Minh',
      });

      // 5. Liên tỉnh (Hà Nội > 20km) -> 70.000₫
      const haNoi = estimateDeliveryDistance({
        address: '18 Tràng Tiền, Hoàn Kiếm',
        city: 'Hà Nội',
      });

      const passed =
        nearStore.shippingFee === 0 &&
        nearStore.isFreeship === true &&
        congLoStreet.shippingFee === 0 &&
        congLoStreet.isFreeship === true &&
        phuNhuan.shippingFee === 25000 &&
        quan1.shippingFee === 45000 &&
        cuChi.shippingFee === 70000 &&
        haNoi.shippingFee === 70000;

      return {
        expected: {
          nearStoreFee: 0,
          congLoFee: 0,
          phuNhuanFee: 25000,
          quan1Fee: 45000,
          cuChiFee: 70000,
          haNoiFee: 70000,
        },
        actual: {
          nearStoreFee: nearStore.shippingFee,
          congLoFee: congLoStreet.shippingFee,
          phuNhuanFee: phuNhuan.shippingFee,
          quan1Fee: quan1.shippingFee,
          cuChiFee: cuChi.shippingFee,
          haNoiFee: haNoi.shippingFee,
        },
        passed,
      };
    }
  );

  const totalDurationMs = Number((performance.now() - startTime).toFixed(2));
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return {
    results,
    passedCount,
    failedCount,
    totalDurationMs,
  };
}

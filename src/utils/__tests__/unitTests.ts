/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem, Review, TestResult, Voucher } from '../../types';
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
} from '../calculations';

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
    const passed = actual1 === '850.000 ₫' && actual0 === '0 ₫';
    return { expected: '850.000 ₫', actual: actual1, passed };
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

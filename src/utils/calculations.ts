/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem, Review, Voucher } from '../types';

/**
 * Định dạng số tiền sang chuẩn Việt Nam Đồng (VND)
 * Ví dụ: 850000 -> "850.000 ₫"
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 ₫';
  }
  const formatted = Math.round(amount).toLocaleString('vi-VN');
  return `${formatted} ₫`;
}

/**
 * Tính tổng tiền gốc của các sản phẩm trong giỏ hàng
 */
export function calculateCartSubtotal(items: CartItem[]): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
}

/**
 * Tính tổng số lượng hoa trong giỏ hàng
 */
export function calculateTotalQuantity(items: CartItem[]): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Chính sách chiết khấu mua số lượng lớn (Bulk Order Discount)
 * - Mua từ 3 bó trở lên: chiết khấu 10%
 * - Hoặc tổng giá trị đơn hàng >= 3.000.000 ₫: chiết khấu 15%
 */
export function calculateBulkDiscount(items: CartItem[], subtotal: number): {
  bulkDiscount: number;
  isEligible: boolean;
  bulkRate: number;
  reason: string;
} {
  const totalQty = calculateTotalQuantity(items);
  
  if (subtotal >= 2000000) {
    const rate = 0.15;
    return {
      bulkDiscount: Math.round(subtotal * rate),
      isEligible: true,
      bulkRate: 15,
      reason: 'Đơn hàng VIP trên 2.000.000 ₫ (giảm 15%)',
    };
  }

  if (totalQty >= 3) {
    const rate = 0.10;
    return {
      bulkDiscount: Math.round(subtotal * rate),
      isEligible: true,
      bulkRate: 10,
      reason: `Mua từ ${totalQty} bó hoa trở lên (giảm 10%)`,
    };
  }

  return {
    bulkDiscount: 0,
    isEligible: false,
    bulkRate: 0,
    reason: '',
  };
}

/**
 * Kiểm tra và áp dụng mã Voucher (khuyến mãi lễ, sự kiện, chào bạn mới)
 */
export function validateAndCalculateVoucher(
  voucher: Voucher | null | undefined,
  subtotal: number,
  totalQuantity: number
): {
  isValid: boolean;
  discountAmount: number;
  message: string;
} {
  if (!voucher) {
    return { isValid: false, discountAmount: 0, message: 'Chưa áp dụng voucher' };
  }

  if (subtotal < voucher.minOrderValue) {
    return {
      isValid: false,
      discountAmount: 0,
      message: `Đơn hàng tối thiểu ${formatVND(voucher.minOrderValue)} để áp dụng mã ${voucher.code}`,
    };
  }

  if (voucher.minQuantity && totalQuantity < voucher.minQuantity) {
    return {
      isValid: false,
      discountAmount: 0,
      message: `Cần tối thiểu ${voucher.minQuantity} sản phẩm để sử dụng mã này`,
    };
  }

  let calculatedDiscount = 0;
  if (voucher.discountType === 'PERCENT') {
    calculatedDiscount = (subtotal * voucher.discountValue) / 100;
    if (voucher.maxDiscountAmount && calculatedDiscount > voucher.maxDiscountAmount) {
      calculatedDiscount = voucher.maxDiscountAmount;
    }
  } else {
    calculatedDiscount = voucher.discountValue;
  }

  // Tiền giảm không thể vượt quá giá trị đơn hàng
  calculatedDiscount = Math.min(calculatedDiscount, subtotal);

  return {
    isValid: true,
    discountAmount: Math.round(calculatedDiscount),
    message: `Đã áp dụng mã ${voucher.code}: giảm ${formatVND(calculatedDiscount)}`,
  };
}

/**
 * Tính cước phí giao hoa dựa trên khoảng cách km từ Google Maps chi nhánh
 * - Dưới 3 km: Miễn phí giao hàng (Freeship)
 * - 3 đến 10 km: 25.000 ₫
 * - 10 đến 20 km: 45.000 ₫
 * - Trên 20 km: 70.000 ₫
 */
export function calculateShippingFee(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  if (distanceKm <= 3.0) return 0;
  if (distanceKm <= 10.0) return 25000;
  if (distanceKm <= 20.0) return 45000;
  return 70000;
}

/**
 * Tính tổng thanh toán cuối cùng của đơn hàng
 */
export function calculateOrderFinalTotal(
  subtotal: number,
  voucherDiscount: number,
  bulkDiscount: number,
  shippingFee: number
): number {
  // Áp dụng mức giảm cao nhất giữa voucher hoặc bulkDiscount (không cộng dồn để bảo đảm biên lợi nhuận)
  const effectiveDiscount = Math.max(voucherDiscount, bulkDiscount);
  const total = subtotal - effectiveDiscount + shippingFee;
  return Math.max(0, Math.round(total));
}

/**
 * Tính điểm đánh giá trung bình và số lượng đánh giá
 */
export function calculateAverageRating(reviews: Review[]): { average: number; count: number } {
  if (!reviews || reviews.length === 0) {
    return { average: 5.0, count: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = Number((sum / reviews.length).toFixed(1));
  return {
    average: avg,
    count: reviews.length,
  };
}

/**
 * Kiểm tra phân quyền RBAC (Role-Based Access Control)
 * CUSTOMER: chỉ xem cửa hàng, đặt hoa, xem đơn của mình
 * STAFF: xem đơn điều phối, kanban, in thiệp, chat (không được xóa hoa hoặc xem báo cáo tài chính)
 * ADMIN: toàn quyền
 */
export function canAccessResource(
  role: import('../types').Role,
  resource: 'storefront' | 'staff_board' | 'admin_dashboard' | 'delete_flower' | 'view_financial_reports'
): boolean {
  if (role === 'ADMIN') return true;

  if (role === 'STAFF') {
    if (resource === 'storefront' || resource === 'staff_board') return true;
    return false; // Cannot delete flowers or view financial reports
  }

  // CUSTOMER
  if (resource === 'storefront') return true;
  return false;
}

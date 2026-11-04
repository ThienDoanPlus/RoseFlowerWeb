/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PaymentMethod } from '../types';

export interface VietQRConfig {
  bankId: string;
  bankBin: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  description: string;
  qrImageUrl: string;
  staticQrUrl: string;
}

export const BANK_INFO = {
  bankId: 'VCB', // Vietcombank
  bankBin: '970436',
  bankName: 'Vietcombank - Ngân Hàng Ngoại Thương Việt Nam',
  branch: 'PGD Sông Vệ',
  accountNumber: '1027210627',
  accountHolder: 'NGUYEN THIEN DOAN',
  staticQrUrl: '/vietqr-payment.png',
  momoPhone: '0888208306',
  zaloPhone: '0888208306',
};

/**
 * Sinh cấu hình thanh toán mã VietQR chuẩn Napas 24/7
 */
export function generateVietQRPayload(order: Order): VietQRConfig {
  const cleanCode = `ROSE${order.id.replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase()}`;
  const amount = Math.round(order.totalAmount);
  // VietQR API Quick Link tạo ảnh QR chuẩn Napas
  const qrImageUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(cleanCode)}&accountName=${encodeURIComponent(BANK_INFO.accountHolder)}`;

  return {
    bankId: BANK_INFO.bankId,
    bankBin: BANK_INFO.bankBin,
    bankName: BANK_INFO.bankName,
    branch: BANK_INFO.branch,
    accountNumber: BANK_INFO.accountNumber,
    accountHolder: BANK_INFO.accountHolder,
    amount,
    description: cleanCode,
    qrImageUrl,
    staticQrUrl: BANK_INFO.staticQrUrl,
  };
}

/**
 * Giả lập gửi thông tin đơn hàng và khởi tạo phiên thanh toán VietQR
 */
export async function simulatePaymentVerification(
  orderId: string,
  method: PaymentMethod,
  onProgress?: (step: string) => void
): Promise<{ success: boolean; transactionCode: string }> {
  onProgress?.('Đang kết nối hệ thống đối soát chuyển khoản VietQR...');
  await new Promise((res) => setTimeout(res, 500));

  onProgress?.('Đang đồng bộ giao dịch tới Vietcombank (1027210627 - NGUYEN THIEN DOAN)...');
  await new Promise((res) => setTimeout(res, 600));

  onProgress?.('Đã tiếp nhận đơn hàng! Đang chờ Admin xác nhận biến động số dư...');
  await new Promise((res) => setTimeout(res, 400));

  return {
    success: true,
    transactionCode: `VCB-VQR-${orderId.replace(/[^0-9]/g, '').slice(-4) || Date.now().toString().slice(-4)}`,
  };
}

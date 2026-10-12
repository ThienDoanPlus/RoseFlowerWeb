/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PaymentMethod } from '../types';

export interface VietQRConfig {
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  description: string;
  qrImageUrl: string;
}

export const BANK_INFO = {
  bankId: 'MB',
  bankName: 'MBBank - Ngân Hàng Quân Đội',
  accountNumber: '0888208306',
  accountHolder: "TIEM HOA SAP ROSE",
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
    bankName: BANK_INFO.bankName,
    accountNumber: BANK_INFO.accountNumber,
    accountHolder: BANK_INFO.accountHolder,
    amount,
    description: cleanCode,
    qrImageUrl,
  };
}

/**
 * Giả lập xác thực thanh toán tức thì qua Webhook của cổng thanh toán
 * (VietQR / MoMo / VNPay / ZaloPay)
 */
export async function simulatePaymentVerification(
  orderId: string,
  method: PaymentMethod,
  onProgress?: (step: string) => void
): Promise<{ success: boolean; transactionCode: string }> {
  if (method === 'COD') {
    return {
      success: true,
      transactionCode: `COD-${Date.now().toString().slice(-6)}`,
    };
  }

  onProgress?.('Đang kết nối cổng thanh toán bảo mật...');
  await new Promise((res) => setTimeout(res, 800));

  onProgress?.('Đang lắng nghe tín hiệu biến động số dư...');
  await new Promise((res) => setTimeout(res, 1200));

  onProgress?.('Đã nhận thanh toán từ ngân hàng!');
  await new Promise((res) => setTimeout(res, 400));

  return {
    success: true,
    transactionCode: `TX-${method}-${Date.now().toString().slice(-8)}`,
  };
}

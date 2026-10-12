/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Wallet,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Tag,
  Copy,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../store';
import { PaymentMethod, Order } from '../types';
import { BRANCHES, VOUCHERS } from '../data/mockData';
import { formatVND } from '../utils/calculations';
import { generateVietQRPayload, simulatePaymentVerification, BANK_INFO } from '../services/paymentService';

export const CheckoutModal: React.FC = () => {
  const { state, dispatch, subtotal, totalQuantity, bulkDiscountInfo, voucherValidation, shippingFee, finalTotal } = useStore();

  const [recipientName, setRecipientName] = useState(state.deliveryInfo.recipientName);
  const [recipientPhone, setRecipientPhone] = useState(state.deliveryInfo.recipientPhone);
  const [recipientEmail, setRecipientEmail] = useState(state.deliveryInfo.recipientEmail);
  const [address, setAddress] = useState(state.deliveryInfo.address);
  const [district, setDistrict] = useState(state.deliveryInfo.district);
  const [city, setCity] = useState(state.deliveryInfo.city);
  const [deliveryDate, setDeliveryDate] = useState(state.deliveryInfo.deliveryDate);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(state.deliveryInfo.deliveryTimeSlot);
  const [cardMessage, setCardMessage] = useState(state.greetingCardMessage);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VIETQR');

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'payment'>('info');

  if (!state.isCheckoutOpen) return null;

  const currentBranch = state.selectedBranch;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientPhone.trim() || !address.trim()) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: 'Vui lòng điền đầy đủ tên, số điện thoại và địa chỉ giao hàng', type: 'error' },
      });
      return;
    }
    // Update delivery info in store
    dispatch({
      type: 'UPDATE_DELIVERY_INFO',
      payload: {
        recipientName,
        recipientPhone,
        recipientEmail,
        address,
        district,
        city,
        deliveryDate,
        deliveryTimeSlot,
        cardMessage,
      },
    });
    setActiveTab('payment');
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    setProcessingStatus('Đang khởi tạo đơn hàng bảo mật...');

    const orderId = `ROSE-${Date.now().toString().slice(-6)}`;
    const effectiveDiscount = Math.max(voucherValidation.discountAmount, bulkDiscountInfo.bulkDiscount);

    const newOrder: Order = {
      id: orderId,
      items: state.cart,
      deliveryInfo: {
        recipientName,
        recipientPhone,
        recipientEmail,
        address,
        district,
        city,
        branchId: currentBranch.id,
        distanceKm: state.deliveryInfo.distanceKm,
        deliveryDate,
        deliveryTimeSlot,
        cardMessage,
        senderName: state.user?.name || 'Khách hàng',
      },
      subtotal,
      discountAmount: voucherValidation.discountAmount,
      bulkDiscountAmount: bulkDiscountInfo.bulkDiscount,
      shippingFee,
      totalAmount: finalTotal,
      voucherCode: state.activeVoucher?.code,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PAID',
      orderStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // Simulate verification
    const verification = await simulatePaymentVerification(orderId, paymentMethod, (step) => {
      setProcessingStatus(step);
    });

    newOrder.transactionCode = verification.transactionCode;

    // Create Order in Store
    dispatch({ type: 'CREATE_ORDER', payload: newOrder });

    // Send push notification
    dispatch({
      type: 'ADD_PUSH_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        title: `Đơn hàng #${orderId} đã được tiếp nhận!`,
        message: `Cảm ơn bạn! Tiệm hoa sáp Rose (294 Phạm Văn Bạch) đang chuẩn bị đơn giao cho ${address}.`,
        timestamp: 'Vừa xong',
        type: 'order',
        read: false,
        orderId,
      },
    });

    // Send official simulated Gmail email
    dispatch({
      type: 'ADD_GMAIL_EMAIL',
      payload: {
        id: `mail-${Date.now()}`,
        to: recipientEmail || 'nguyenthiendoan2@gmail.com',
        subject: `[Rose] Xác nhận đặt hoa sáp thành công - Mã đơn #${orderId}`,
        date: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        orderId,
        totalAmount: finalTotal,
        recipientName,
        deliveryAddress: `${address}, ${district}, ${city}`,
        deliveryTime: `${deliveryTimeSlot} · Ngày ${deliveryDate}`,
        greetingMessage: cardMessage,
        paymentMethod,
        itemsSummary: state.cart.map((item) => ({
          name: item.flower.name,
          variant: item.sizeVariant === 'standard' ? 'Tiêu chuẩn' : item.sizeVariant === 'deluxe' ? 'Thịnh soạn' : 'Vương giả',
          quantity: item.quantity,
          price: item.unitPrice * item.quantity,
        })),
      },
    });

    setIsProcessing(false);
  };

  const cleanOrderSample: Order = {
    id: `ROSE-${Date.now().toString().slice(-6)}`,
    items: state.cart,
    deliveryInfo: state.deliveryInfo,
    subtotal,
    discountAmount: voucherValidation.discountAmount,
    bulkDiscountAmount: bulkDiscountInfo.bulkDiscount,
    shippingFee,
    totalAmount: finalTotal,
    paymentMethod,
    paymentStatus: 'PAID',
    orderStatus: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  const vietQRConfig = generateVietQRPayload(cleanOrderSample);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700" />
            <h3 className="font-display font-medium text-lg text-stone-900">
              Đặt Hoa & Thanh Toán Bảo Mật SSL 256-bit
            </h3>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCheckoutOpen', isOpen: false } })}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Progress */}
        <div className="grid grid-cols-2 border-b border-stone-200 text-xs font-semibold text-center">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'info'
                ? 'border-b-2 border-stone-900 text-stone-900 bg-white'
                : 'text-stone-500 bg-stone-50 hover:bg-stone-100'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center">1</span>
            <span>Thông tin người nhận & Địa chỉ</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (recipientName && recipientPhone && address) setActiveTab('payment');
            }}
            className={`py-3 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'payment'
                ? 'border-b-2 border-stone-900 text-stone-900 bg-white'
                : 'text-stone-500 bg-stone-50 hover:bg-stone-100'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center">2</span>
            <span>Phương thức thanh toán Việt Nam</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {activeTab === 'info' ? (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              
              {/* Recipient Details */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
                  1. Thông tin người nhận hoa
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-stone-600 mb-1 font-medium">Họ và tên người nhận *</label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nguyễn Thị Mai"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-600 mb-1 font-medium">Số điện thoại liên hệ *</label>
                    <input
                      type="tel"
                      required
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-stone-600 mb-1 font-medium">
                      Email nhận biên lai & thông báo (Tự động gửi thư xác nhận):
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="nguyenthiendoan2@gmail.com"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address & Distance */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
                  2. Địa chỉ & Thời gian giao hoa
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="sm:col-span-3">
                    <label className="block text-xs text-stone-600 mb-1 font-medium">Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà) *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="18 Tràng Tiền, Phường Tràng Tiền"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-600 mb-1 font-medium">Quận / Huyện</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-600 mb-1 font-medium">Tỉnh / Thành phố</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    >
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-600 mb-1 font-medium">Chi nhánh điều phối</label>
                    <select
                      value={state.selectedBranch.id}
                      onChange={(e) => {
                        const b = BRANCHES.find((br) => br.id === e.target.value);
                        if (b) dispatch({ type: 'SET_BRANCH', payload: b });
                      }}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-600 mb-1 font-medium">Ngày giao hoa</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-stone-600 mb-1 font-medium">Khung giờ giao hàng</label>
                    <select
                      value={deliveryTimeSlot}
                      onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                    >
                      <option value="Giao hỏa tốc 60-90 phút">Giao hỏa tốc 60 - 90 phút (Ưu tiên)</option>
                      <option value="Sáng: 08:00 - 11:30">Sáng: 08:00 - 11:30</option>
                      <option value="Chiều: 13:30 - 17:00">Chiều: 13:30 - 17:00</option>
                      <option value="Tối lãng mạn: 18:30 - 21:00">Tối lãng mạn: 18:30 - 21:00</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Handwritten Card Message */}
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                  3. Lời chúc trên thiệp thủ công (Miễn phí)
                </h4>
                <textarea
                  rows={2}
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  placeholder="Gửi lời chúc ấm áp đến người thương..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-200">
                <button
                  type="submit"
                  className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Tiếp tục chọn phương thức thanh toán</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          ) : (
            /* Step 2: Payment Gateways */
            <div className="space-y-6">
              
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
                  Chọn phương thức thanh toán trực tuyến tại Việt Nam:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  
                  {/* VietQR */}
                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'VIETQR'
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="VIETQR"
                      checked={paymentMethod === 'VIETQR'}
                      onChange={() => setPaymentMethod('VIETQR')}
                      className="mt-1 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-blue-700" />
                        <span className="text-xs font-bold text-stone-900">VietQR (Napas 24/7)</span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">Khuyên dùng</span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1">
                        Quét mã QR tự động điền STK MBBank và đúng số tiền {formatVND(finalTotal)}. Xác nhận trong 5 giây.
                      </p>
                    </div>
                  </label>

                  {/* MoMo */}
                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'MOMO'
                        ? 'border-pink-600 bg-pink-50/40 ring-1 ring-pink-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="MOMO"
                      checked={paymentMethod === 'MOMO'}
                      onChange={() => setPaymentMethod('MOMO')}
                      className="mt-1 text-pink-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-pink-700" />
                        <span className="text-xs font-bold text-stone-900">Ví MoMo</span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1">
                        Thanh toán qua mã QR MoMo hoặc ứng dụng MoMo trên điện thoại.
                      </p>
                    </div>
                  </label>

                  {/* VNPay */}
                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'VNPAY'
                        ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="VNPAY"
                      checked={paymentMethod === 'VNPAY'}
                      onChange={() => setPaymentMethod('VNPAY')}
                      className="mt-1 text-red-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-red-700" />
                        <span className="text-xs font-bold text-stone-900">Cổng VNPay</span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1">
                        Quét VNPay-QR hoặc thanh toán bằng thẻ ATM nội địa 40+ ngân hàng.
                      </p>
                    </div>
                  </label>

                  {/* ZaloPay */}
                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'ZALOPAY'
                        ? 'border-cyan-600 bg-cyan-50/40 ring-1 ring-cyan-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ZALOPAY"
                      checked={paymentMethod === 'ZALOPAY'}
                      onChange={() => setPaymentMethod('ZALOPAY')}
                      className="mt-1 text-cyan-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-cyan-700" />
                        <span className="text-xs font-bold text-stone-900">Ví ZaloPay</span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1">
                        Thanh toán bảo mật trong ứng dụng Zalo hoặc ZaloPay.
                      </p>
                    </div>
                  </label>

                  {/* COD */}
                  <label
                    className={`sm:col-span-2 p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentMethod === 'COD'
                        ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mt-1 text-stone-900"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-stone-800" />
                        <span className="text-xs font-bold text-stone-900">Thanh toán khi nhận hoa (COD)</span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-1">
                        Kiểm tra độ tươi của hoa trực tiếp với nhân viên giao hàng trước khi thanh toán tiền mặt.
                      </p>
                    </div>
                  </label>

                </div>

                {/* VietQR Live Dynamic Preview */}
                {paymentMethod === 'VIETQR' && (
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-36 h-36 bg-white p-2 rounded-lg border border-blue-200 shadow-xs flex items-center justify-center shrink-0">
                      <img
                        src={vietQRConfig.qrImageUrl}
                        alt="Mã VietQR"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1.5 text-xs text-stone-700 flex-1">
                      <p className="font-semibold text-blue-900 text-sm">Chuyển khoản nhanh Napas 24/7</p>
                      <div>
                        Ngân hàng: <strong>{vietQRConfig.bankName}</strong>
                      </div>
                      <div>
                        Số tài khoản: <strong className="font-mono">{vietQRConfig.accountNumber}</strong>
                      </div>
                      <div>
                        Chủ tài khoản: <strong>{vietQRConfig.accountHolder}</strong>
                      </div>
                      <div>
                        Số tiền: <strong className="font-mono text-blue-800 text-sm">{formatVND(vietQRConfig.amount)}</strong>
                      </div>
                      <div>
                        Nội dung: <strong className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-900">{vietQRConfig.description}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Breakdown Recap */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200 space-y-1.5 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span>Tổng tiền hoa ({totalQuantity} bó):</span>
                  <span className="font-mono font-medium">{formatVND(subtotal)}</span>
                </div>
                {bulkDiscountInfo.isEligible && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Chiết khấu số lượng ({bulkDiscountInfo.bulkRate}%):</span>
                    <span className="font-mono">-{formatVND(bulkDiscountInfo.bulkDiscount)}</span>
                  </div>
                )}
                {voucherValidation.isValid && voucherValidation.discountAmount > 0 && !bulkDiscountInfo.isEligible && (
                  <div className="flex justify-between text-rose-700 font-medium">
                    <span>Voucher ({state.activeVoucher?.code}):</span>
                    <span className="font-mono">-{formatVND(voucherValidation.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí giao hàng ({state.deliveryInfo.distanceKm} km):</span>
                  <span className="font-mono">
                    {shippingFee === 0 ? 'Miễn phí (Freeship)' : formatVND(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-300">
                  <span>Số tiền cần thanh toán:</span>
                  <span className="text-base font-mono text-rose-800">{formatVND(finalTotal)}</span>
                </div>
              </div>

              {/* Process Confirmation Button */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className="text-xs text-stone-600 hover:text-stone-900 underline cursor-pointer text-center py-2 sm:py-0"
                >
                  ← Sửa lại thông tin người nhận
                </button>

                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  disabled={isProcessing}
                  className="w-full sm:w-auto justify-center px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{processingStatus}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Xác nhận & Hoàn tất đặt hàng ({formatVND(finalTotal)})</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

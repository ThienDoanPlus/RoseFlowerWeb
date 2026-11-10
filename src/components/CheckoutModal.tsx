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
  Copy,
  AlertCircle,
  Clock,
  Sparkles,
  Check,
  Maximize2,
  Download,
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

  // VietQR interactive states
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isZoomQrOpen, setIsZoomQrOpen] = useState(false);

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'payment'>('info');

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: `Đã sao chép: ${text}`, type: 'success' },
    });
    setTimeout(() => setCopiedField(null), 2500);
  };

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
      paymentMethod: 'VIETQR',
      paymentStatus: 'UNPAID',
      orderStatus: 'PENDING',
      floristNotes: 'Đang chờ Admin kiểm tra tài khoản Vietcombank (1027210627) và phê duyệt thanh toán.',
      createdAt: new Date().toISOString(),
    };

    // Simulate verification
    const verification = await simulatePaymentVerification(orderId, 'VIETQR', (step) => {
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
        title: `Đơn hàng #${orderId} đang chờ Admin duyệt chuyển khoản`,
        message: `Hệ thống đã tiếp nhận đơn hoa của bạn. Ngay sau khi Admin kiểm tra và xác nhận chuyển khoản vào Vietcombank (1027210627 - NGUYEN THIEN DOAN), xưởng sẽ tiến hành cắm hoa ngay!`,
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
        to: recipientEmail || state.user?.email || 'customer@example.com',
        subject: `[Rose] Tiếp nhận đơn #${orderId} - Chờ Admin phê duyệt chuyển khoản VietQR`,
        date: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        orderId,
        totalAmount: finalTotal,
        recipientName,
        deliveryAddress: `${address}, ${district}, ${city}`,
        deliveryTime: `${deliveryTimeSlot} · Ngày ${deliveryDate}`,
        greetingMessage: cardMessage,
        paymentMethod: 'VIETQR',
        itemsSummary: state.cart.map((item) => ({
          name: item.flower.name,
          variant: item.sizeVariant === 'standard' ? 'Tiêu chuẩn' : item.sizeVariant === 'deluxe' ? 'Thịnh soạn' : 'Vương giả',
          quantity: item.quantity,
          price: item.unitPrice * item.quantity,
        })),
      },
    });

    dispatch({
      type: 'SHOW_TOAST',
      payload: {
        message: `Đơn hàng #${orderId} đã được tạo! Đang chờ Admin xác nhận đã nhận chuyển khoản để lên đơn cắm hoa.`,
        type: 'info',
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
    paymentMethod: 'VIETQR',
    paymentStatus: 'UNPAID',
    orderStatus: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  const vietQRConfig = generateVietQRPayload(cleanOrderSample);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
            <h3 className="font-display font-medium text-base sm:text-lg text-stone-900 truncate">
              <span className="sm:hidden">Đặt Hoa & Thanh Toán</span>
              <span className="hidden sm:inline">Đặt Hoa & Thanh Toán Bảo Mật SSL 256-bit</span>
            </h3>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCheckoutOpen', isOpen: false } })}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Progress */}
        <div className="grid grid-cols-2 border-b border-stone-200 text-xs font-semibold text-center">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-2.5 sm:py-3 px-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'info'
                ? 'border-b-2 border-stone-900 text-stone-900 bg-white font-bold'
                : 'text-stone-500 bg-stone-50 hover:bg-stone-100'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center shrink-0">1</span>
            <span className="truncate sm:overflow-visible">
              <span className="sm:hidden">Người nhận & Địa chỉ</span>
              <span className="hidden sm:inline">Thông tin người nhận & Địa chỉ</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (recipientName && recipientPhone && address) setActiveTab('payment');
            }}
            className={`py-2.5 sm:py-3 px-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'payment'
                ? 'border-b-2 border-stone-900 text-stone-900 bg-white font-bold'
                : 'text-stone-500 bg-stone-50 hover:bg-stone-100'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] flex items-center justify-center shrink-0">2</span>
            <span className="truncate sm:overflow-visible">
              <span className="sm:hidden">Thanh toán VietQR</span>
              <span className="hidden sm:inline">Phương thức thanh toán Việt Nam</span>
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 sm:p-8">
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
                      placeholder="name@example.com"
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
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Phương Thức Thanh Toán Duy Nhất:
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Chuyển Khoản VietQR (Napas 24/7)
                  </span>
                </div>

                <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Quy trình xử lý đơn:</strong> Quý khách quét mã QR để chuyển khoản. Chúng tôi sẽ <strong>phê duyệt</strong> đơn hàng khi nhận được thanh toán từ quý khách , hệ thống sẽ gửi thông báo và xưởng bắt đầu lên đơn giao đến bạn sớm nhất.
                  </div>
                </div>

                {/* VietQR Live Dynamic Preview */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/70 via-blue-50/40 to-white rounded-2xl border border-emerald-200/90 shadow-xs space-y-4">
                    {/* Header with Vietcombank & Napas 24/7 branding */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          VCB
                        </div>
                        <div>
                          <h5 className="font-semibold text-emerald-950 text-sm flex items-center gap-1.5">
                            <span>Thanh Toán VietQR (Napas 24/7)</span>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                              Xác nhận tức thì
                            </span>
                          </h5>
                          <p className="text-[11px] text-stone-600">
                            {vietQRConfig.bankName} · <strong>{vietQRConfig.branch}</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                      {/* QR Display Card */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="relative group p-2 bg-white rounded-xl border-2 border-emerald-300 shadow-sm overflow-hidden max-w-[215px] sm:max-w-[230px]">
                          <img
                            src={vietQRConfig.staticQrUrl}
                            alt="Thẻ VietQR NGUYEN THIEN DOAN"
                            className="w-48 sm:w-52 h-auto object-contain rounded-lg transition-transform group-hover:scale-102"
                          />

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsZoomQrOpen(true)}
                              className="px-3 py-1.5 bg-white text-stone-900 rounded-lg shadow-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-stone-50"
                              title="Phóng to mã QR"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Phóng to</span>
                            </button>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsZoomQrOpen(true)}
                            className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Xem phóng to</span>
                          </button>
                          <span className="text-stone-300">·</span>
                          <a
                            href={vietQRConfig.staticQrUrl}
                            download="vietqr-rose-flowers.png"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            <span>Tải ảnh QR</span>
                          </a>
                        </div>
                      </div>

                      {/* Bank Details Table with 1-click Copy */}
                      <div className="flex-1 w-full space-y-2.5 text-xs text-stone-700">
                        <div className="p-3.5 bg-white/95 rounded-xl border border-stone-200/80 space-y-2.5 shadow-2xs">
                          {/* Account Holder */}
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <div>
                              <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Chủ tài khoản</span>
                              <strong className="text-stone-900 text-sm font-semibold tracking-wide">
                                {vietQRConfig.accountHolder}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(vietQRConfig.accountHolder, 'holder')}
                              className="px-2 py-1 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-600 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                              title="Sao chép tên chủ tài khoản"
                            >
                              {copiedField === 'holder' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700 font-semibold">Đã chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Account Number */}
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <div>
                              <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Số tài khoản Vietcombank</span>
                              <strong className="text-emerald-800 text-base font-mono tracking-wider">
                                {vietQRConfig.accountNumber}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(vietQRConfig.accountNumber, 'acc')}
                              className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Sao chép số tài khoản"
                            >
                              {copiedField === 'acc' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Đã sao chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Chép STK</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Bank & Branch */}
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-[11px]">
                            <span className="text-stone-500">Ngân hàng & Chi nhánh:</span>
                            <span className="font-medium text-stone-900 text-right">
                              Vietcombank · {vietQRConfig.branch}
                            </span>
                          </div>

                          {/* Amount */}
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <div>
                              <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Số tiền cần thanh toán</span>
                              <strong className="text-rose-800 text-base font-mono font-bold">
                                {formatVND(vietQRConfig.amount)}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(vietQRConfig.amount.toString(), 'amount')}
                              className="px-2 py-1 bg-stone-100 hover:bg-rose-50 hover:text-rose-800 text-stone-600 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                              title="Sao chép số tiền"
                            >
                              {copiedField === 'amount' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700 font-semibold">Đã chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Chép số tiền</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Transfer Memo */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Nội dung chuyển khoản (bắt buộc)</span>
                              <strong className="text-blue-900 text-xs font-mono bg-blue-100 px-2 py-0.5 rounded inline-block mt-0.5">
                                {vietQRConfig.description}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(vietQRConfig.description, 'memo')}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                              title="Sao chép nội dung chuyển khoản"
                            >
                              {copiedField === 'memo' ? (
                                <>
                                  <Check className="w-3 h-3 text-blue-700" />
                                  <span className="text-blue-900 font-semibold">Đã chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Chép nội dung</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="p-2.5 bg-emerald-100/60 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 leading-relaxed flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span>
                            Mở ứng dụng ngân hàng bất kỳ (Vietcombank, MB, Techcombank, Agribank, BIDV...) quét mã QR để chuyển khoản. Khi chuyển xong, bấm nút bên dưới để gửi đơn cho Admin duyệt!
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      <span>Tôi đã chuyển khoản xong - Gửi đơn ({formatVND(finalTotal)})</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* High-Resolution QR Zoom Modal */}
      {isZoomQrOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsZoomQrOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomQrOpen(false)}
              className="absolute top-3 right-3 p-1.5 text-stone-400 hover:text-stone-900 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-2">
              <h4 className="font-bold text-stone-900 text-base">Mã VietQR Thanh Toán</h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Quét bằng ứng dụng ngân hàng hoặc MoMo
              </p>
            </div>

            <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 inline-block shadow-inner">
              <img
                src={vietQRConfig.staticQrUrl}
                alt="VietQR Full Size"
                className="w-64 h-auto object-contain rounded-lg mx-auto"
              />
            </div>

            <div className="text-xs text-stone-700 space-y-1">
              <div>
                Chủ TK: <strong>{vietQRConfig.accountHolder}</strong>
              </div>
              <div>
                STK: <strong className="font-mono text-emerald-800 text-sm">{vietQRConfig.accountNumber}</strong> (Vietcombank)
              </div>
              <div>
                Số tiền: <strong className="font-mono text-rose-800 text-sm">{formatVND(vietQRConfig.amount)}</strong>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsZoomQrOpen(false)}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

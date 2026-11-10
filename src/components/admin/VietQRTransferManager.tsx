/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  CreditCard,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Eye,
  Check,
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useStore } from '../../store';
import { Order } from '../../types';
import { formatVND } from '../../utils/calculations';

export const VietQRTransferManager: React.FC = () => {
  const { state, dispatch } = useStore();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNPAID' | 'PAID' | 'DELIVERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Chưa thấy tiền vào tài khoản Vietcombank sau 15 phút');

  // Filtered orders
  const filteredOrders = state.orders.filter((order) => {
    // Status filter
    if (filterStatus === 'UNPAID' && order.paymentStatus !== 'UNPAID') return false;
    if (filterStatus === 'PAID' && order.paymentStatus !== 'PAID') return false;
    if (filterStatus === 'DELIVERED' && order.orderStatus !== 'DELIVERED') return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.deliveryInfo.recipientName.toLowerCase().includes(q) ||
      order.deliveryInfo.recipientPhone.includes(q) ||
      (order.transactionCode && order.transactionCode.toLowerCase().includes(q)) ||
      order.deliveryInfo.address.toLowerCase().includes(q)
    );
  });

  const totalCollected = state.orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingApprovalOrders = state.orders.filter(
    (o) => o.paymentStatus === 'UNPAID' || o.orderStatus === 'PENDING'
  );

  const pendingAmount = pendingApprovalOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleApprove = (orderId: string) => {
    dispatch({
      type: 'APPROVE_ORDER_PAYMENT',
      payload: { orderId, adminName: state.user?.name || 'Nguyễn Thiện Đoàn (Admin)' },
    });
    dispatch({
      type: 'SHOW_TOAST',
      payload: {
        message: `Đã phê duyệt nhận tiền thành công đơn #${orderId}! Đơn hàng đã chuyển cho xưởng cắm hoa.`,
        type: 'success',
      },
    });
  };

  const handleRejectOrNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalOrder) return;

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const note = `[Admin Cảnh Báo ${timeStr}: ${rejectReason.trim()}]`;

    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: {
        orderId: rejectModalOrder.id,
        status: rejectModalOrder.orderStatus,
        floristNotes: rejectModalOrder.floristNotes ? `${rejectModalOrder.floristNotes} | ${note}` : note,
      },
    });

    dispatch({
      type: 'SHOW_TOAST',
      payload: {
        message: `Đã ghi nhận lưu ý đối soát cho đơn #${rejectModalOrder.id}: ${rejectReason}`,
        type: 'warning',
      },
    });

    setRejectModalOrder(null);
    setRejectReason('Chưa thấy tiền vào tài khoản Vietcombank sau 15 phút');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-stone-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-emerald-200 border border-white/20 mb-2">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              Trung Tâm Đối Soát & Phê Duyệt Chuyển Khoản Ngân Hàng (Vietcombank 1027210627)
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-medium text-white">
              Quản Lý Thông Tin Phê Duyệt Chuyển Khoản VietQR
            </h3>
            <p className="text-xs text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
              Kiểm tra số dư thực nhận vào tài khoản Vietcombank của chủ tiệm. Admin bấm phê duyệt để hệ thống tự động thông báo cho khách và phân bổ cho nhân viên Florist bắt đầu cắm hoa giao đúng hẹn.
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-xl border border-white/20 text-right shrink-0">
            <span className="text-[11px] text-emerald-300 block">Tài khoản thụ hưởng chính thức:</span>
            <span className="text-sm font-mono font-bold text-white block">
              VCB: 1027210627 · Sông Vệ
            </span>
            <span className="text-[10px] text-emerald-200">Chủ TK: NGUYEN THIEN DOAN</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Tổng Tiền Đã Nhận (Vietcombank)</span>
          <div className="font-mono text-2xl font-bold text-emerald-900">
            {formatVND(totalCollected)}
          </div>
          <span className="text-[11px] text-stone-400 block">Đã vào tài khoản và hoàn tất đối soát</span>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-900 uppercase tracking-wider font-semibold">Đang Chờ Duyệt Nhận Tiền</span>
            {pendingApprovalOrders.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="font-mono text-2xl font-bold text-amber-950">
            {formatVND(pendingAmount)}
          </div>
          <span className="text-[11px] text-amber-800 block">
            {pendingApprovalOrders.length} đơn hàng đang chờ kiểm tra số dư
          </span>
        </div>

        <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-rose-900 uppercase tracking-wider font-semibold">Tỷ Lệ Duyệt Thành Công</span>
          <div className="font-mono text-2xl font-bold text-rose-950">
            {state.orders.length > 0
              ? `${Math.round(((state.orders.length - pendingApprovalOrders.length) / state.orders.length) * 100)}%`
              : '100%'}
          </div>
          <span className="text-[11px] text-rose-800 block">
            Khách hàng chuyển khoản chính xác 100%
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            Tất Cả ({state.orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('UNPAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'UNPAID'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Chờ Duyệt Tiền ({pendingApprovalOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('PAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'PAID'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            Đã Duyệt Tiền ({state.orders.filter((o) => o.paymentStatus === 'PAID').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('DELIVERED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'DELIVERED'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
            }`}
          >
            Đã Giao Xong ({state.orders.filter((o) => o.orderStatus === 'DELIVERED').length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã đơn, tên, SĐT..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500">
          <QrCode className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="font-semibold text-sm">Không tìm thấy đơn chuyển khoản nào</p>
          <p className="text-xs text-stone-400 mt-0.5">Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const isUnpaid = order.paymentStatus === 'UNPAID';
            return (
              <div
                key={order.id}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all bg-white shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isUnpaid
                    ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Left: Order Info & Customer Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-rose-950 text-sm">#{order.id}</span>
                    
                    {isUnpaid ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        Chờ Admin xác nhận Vietcombank
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã xác nhận tiền vào VCB
                      </span>
                    )}

                    <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Customer & Recipient Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-700">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Khách nhận: <strong>{order.deliveryInfo.recipientName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="font-mono">{order.deliveryInfo.recipientPhone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{order.deliveryInfo.address}, {order.deliveryInfo.district}</span>
                    </div>
                  </div>

                  {/* Purchased Flowers Summary */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-[11px] bg-stone-100 px-2 py-0.5 rounded-md text-stone-800 border border-stone-200"
                      >
                        <span className="font-semibold">{item.flower.name}</span>
                        <span className="text-stone-500">x{item.quantity}</span>
                      </span>
                    ))}
                  </div>

                  {/* Notes if any */}
                  {order.floristNotes && (
                    <div className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-200/80 italic">
                      {order.floristNotes}
                    </div>
                  )}
                </div>

                {/* Right: Bank Reconciliation & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-200 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                      Số tiền đối soát Vietcombank:
                    </span>
                    <span className="font-mono text-lg font-bold text-rose-900 block">
                      {formatVND(order.totalAmount)}
                    </span>
                    <span className="text-[11px] text-emerald-800 font-mono block">
                      Cú pháp: <strong>{order.transactionCode || order.id}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedDetailOrder(order)}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      title="Xem nội dung thiệp và chi tiết đơn"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem Thiệp</span>
                    </button>

                    {isUnpaid ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setRejectModalOrder(order)}
                          className="px-3 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-300 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                          title="Ghi chú chưa nhận được tiền"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Báo Lệch Tiền</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(order.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Duyệt Đã Nhận Tiền</span>
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã Hoàn Tất Duyệt</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Xem Chi Tiết Đơn & Thiệp Viết Tay */}
      {selectedDetailOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedDetailOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono font-bold text-rose-950 text-base">#{selectedDetailOrder.id}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
                {selectedDetailOrder.orderStatus}
              </span>
            </div>

            <div className="space-y-3.5 text-xs text-stone-700">
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
                <span className="text-[11px] font-bold text-rose-950 block mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-rose-700" />
                  <span>Nội Dung Thiệp Viết Tay Gửi Kèm:</span>
                </span>
                <p className="italic text-stone-800 leading-relaxed font-serif text-sm">
                  "{selectedDetailOrder.greetingCardMessage || 'Không yêu cầu thiệp viết tay'}"
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <span className="text-[11px] font-bold text-stone-900 block mb-1">Thời Gian Hẹn Giao Hoa:</span>
                <p>Ngày: <strong>{selectedDetailOrder.deliveryInfo.deliveryDate || 'Hôm nay'}</strong></p>
                <p>Khung giờ: <strong>{selectedDetailOrder.deliveryInfo.deliveryTimeSlot || 'Giao hỏa tốc 45 phút'}</strong></p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-stone-900 block mb-1.5">Chi Tiết Sản Phẩm Đặt Mua:</span>
                <div className="space-y-2">
                  {selectedDetailOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200">
                      <div className="flex items-center gap-2">
                        <img src={item.flower.imageUrl} alt={item.flower.name} className="w-8 h-8 rounded object-cover" />
                        <div>
                          <span className="font-semibold block">{item.flower.name}</span>
                          <span className="text-[10px] text-stone-500">Cỡ: {item.sizeVariant} · SL: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold">{formatVND(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <span className="font-semibold text-stone-900">Tổng thanh toán:</span>
                <span className="font-mono text-base font-bold text-rose-900">{formatVND(selectedDetailOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setSelectedDetailOrder(null)}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ghi chú Báo Lệch Tiền / Chưa Nhận Được */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setRejectModalOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="font-display font-medium text-base text-stone-900 mb-1">
              Ghi Chú Đối Soát Ngân Hàng #{rejectModalOrder.id}
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              Lưu lý do chưa thể xác nhận thanh toán vào lịch sử đơn hàng
            </p>

            <form onSubmit={handleRejectOrNote} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Lý Do Cần Kiểm Tra Lại:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 cursor-pointer"
                >
                  <option value="Chưa thấy tiền vào tài khoản Vietcombank sau 15 phút">Chưa thấy tiền vào tài khoản Vietcombank sau 15 phút</option>
                  <option value="Số tiền chuyển khoản bị thiếu so với tổng đơn">Số tiền chuyển khoản bị thiếu so với tổng đơn</option>
                  <option value="Khách chuyển sai cú pháp nội dung chuyển khoản">Khách chuyển sai cú pháp nội dung chuyển khoản</option>
                  <option value="Ngân hàng khách đang bảo trì Napas, hẹn chuyển lại">Ngân hàng khách đang bảo trì Napas, hẹn chuyển lại</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOrder(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Lưu Ghi Chú Đối Soát
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

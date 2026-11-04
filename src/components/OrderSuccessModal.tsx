/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle, Mail, Navigation, X, QrCode, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../store';
import { formatVND } from '../utils/calculations';

export const OrderSuccessModal: React.FC = () => {
  const { state, dispatch } = useStore();
  const order = state.currentOrder;

  useEffect(() => {
    if (state.isOrderSuccessOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E11D48', '#FDA4AF', '#F59E0B', '#10B981'],
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
    }
  }, [state.isOrderSuccessOpen]);

  if (!state.isOrderSuccessOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 text-center animate-in zoom-in-95 duration-200">
        
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isOrderSuccessOpen', isOpen: false } })}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${
            order.paymentStatus === 'PAID'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}
        >
          {order.paymentStatus === 'PAID' ? (
            <CheckCircle className="w-8 h-8" />
          ) : (
            <Clock className="w-8 h-8" />
          )}
        </div>

        <span
          className={`text-xs uppercase tracking-widest font-semibold block mb-1 ${
            order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
          }`}
        >
          {order.paymentStatus === 'PAID' ? 'Đã Phê Duyệt Thanh Toán' : 'Đã Tiếp Nhận Đơn · Chờ Admin Phê Duyệt'}
        </span>

        <h3 className="text-2xl font-display font-medium text-rose-950 mb-2">
          {order.paymentStatus === 'PAID' ? 'Cảm Ơn Bạn Đã Chọn Rose!' : 'Đơn Hoa Đang Chờ Admin Phê Duyệt'}
        </h3>

        <p className="text-xs text-stone-600 mb-6 leading-relaxed">
          {order.paymentStatus === 'PAID' ? (
            <>
              Đơn hàng mã <strong className="font-mono text-stone-900">{order.id}</strong> đã được phê duyệt thanh toán. Thợ cắm hoa tại tiệm <strong>Rose (294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM)</strong> đang bắt đầu lên đơn và chuẩn bị giao cho bạn.
            </>
          ) : (
            <>
              Đơn hàng mã <strong className="font-mono text-stone-900">{order.id}</strong> đã được ghi nhận. Chủ tiệm (Admin) sẽ đối soát giao dịch chuyển khoản Vietcombank (<strong>1027210627 - NGUYEN THIEN DOAN</strong>) và bấm <strong>phê duyệt</strong> để tiến hành lên đơn cắm hoa ngay!
            </>
          )}
        </p>

        {/* Admin Quick Action Button inside modal */}
        {state.currentRole === 'ADMIN' && order.paymentStatus === 'UNPAID' && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-left space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Bạn đang đăng nhập quyền Admin
              </span>
            </div>
            <p className="text-[11px] text-amber-900">
              Bạn có thể phê duyệt đã nhận tiền chuyển khoản ngay tại đây để hệ thống tự động thông báo cho khách và kích hoạt trạng thái cắm hoa:
            </p>
            <button
              onClick={() =>
                dispatch({
                  type: 'APPROVE_ORDER_PAYMENT',
                  payload: { orderId: order.id, adminName: state.user?.name || 'Admin' },
                })
              }
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Phê Duyệt Đã Nhận Tiền & Lên Đơn Ngay</span>
            </button>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-[#FAF8F5] rounded-xl p-4 border border-stone-200 text-left text-xs space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-stone-500">Người nhận:</span>
            <span className="font-medium text-stone-900">{order.deliveryInfo.recipientName} ({order.deliveryInfo.recipientPhone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Địa chỉ giao:</span>
            <span className="font-medium text-stone-900 text-right max-w-[200px] truncate">{order.deliveryInfo.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Khung giờ:</span>
            <span className="font-medium text-stone-900">{order.deliveryInfo.deliveryTimeSlot}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Phương thức:</span>
            <span className="font-medium text-stone-900">
              VietQR Napas 24/7 (Vietcombank 1027210627)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Trạng thái thanh toán:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                order.paymentStatus === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {order.paymentStatus === 'PAID' ? 'Đã nhận chuyển khoản' : 'Chờ Admin duyệt chuyển khoản'}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-semibold">
            <span>Tổng thanh toán:</span>
            <span className="font-mono text-rose-800">{formatVND(order.totalAmount)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              dispatch({ type: 'SET_MODAL', payload: { modal: 'isOrderSuccessOpen', isOpen: false } });
              dispatch({ type: 'SET_MODAL', payload: { modal: 'isGmailOpen', isOpen: true } });
            }}
            className="w-full py-3 px-4 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Xem email xác nhận gửi về Gmail ({order.deliveryInfo.recipientEmail})</span>
          </button>

          {(state.currentRole === 'STAFF' || state.currentRole === 'ADMIN') ? (
            <button
              onClick={() => {
                dispatch({ type: 'SET_MODAL', payload: { modal: 'isOrderSuccessOpen', isOpen: false } });
                dispatch({ type: 'SET_TRACKING_ORDER_ID', payload: order.id });
              }}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Theo dõi tiến độ điều phối đơn (STAFF)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                dispatch({ type: 'SET_MODAL', payload: { modal: 'isOrderSuccessOpen', isOpen: false } });
              }}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục dạo xem hoa tươi</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

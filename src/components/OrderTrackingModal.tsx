/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, Clock, Truck, Flower2, HeartHandshake, MessageCircle, MapPin, User, Calendar } from 'lucide-react';
import { useStore } from '../store';
import { OrderStatus } from '../types';
import { formatVND } from '../utils/calculations';

export const OrderTrackingModal: React.FC = () => {
  const { state, dispatch } = useStore();
  const orderId = state.trackingOrderId;
  const order = state.orders.find((o) => o.id === orderId) || state.currentOrder;

  if (!state.isTrackingOpen || !order) return null;

  const isStaffOrAdmin = state.currentRole === 'STAFF' || state.currentRole === 'ADMIN';

  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'PENDING',
      label: 'Đã Tiếp Nhận Đơn',
      desc: 'Hệ thống đã nhận thông tin và chuyển đến xưởng hoa gần nhất',
      icon: <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
    },
    {
      key: 'ARRANGING',
      label: 'Nghệ Nhân Đang Cắm Hoa',
      desc: 'Tuyển chọn từng bông hoa tươi mới, phối lá phụ và nắn nót viết thiệp',
      icon: <Flower2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
    },
    {
      key: 'SHIPPING',
      label: 'Đang Giao Hoa Hỏa Tốc',
      desc: 'Tài xế chuyên dụng đang bảo quản hoa cẩn thận trong quá trình vận chuyển',
      icon: <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
    },
    {
      key: 'DELIVERED',
      label: 'Giao Hoa Thành Công',
      desc: 'Hoa tươi đã được trao tận tay người nhận kèm nụ cười rạng rỡ',
      icon: <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
    },
  ];

  const currentStatusIndex = steps.findIndex((s) => s.key === order.orderStatus);

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { orderId: order.id, status: newStatus },
    });

    const stepInfo = steps.find((s) => s.key === newStatus);

    dispatch({
      type: 'ADD_PUSH_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        title: `Đơn hàng #${order.id}: ${stepInfo?.label}`,
        message: stepInfo?.desc || '',
        timestamp: 'Vừa xong',
        type: 'order',
        read: false,
        orderId: order.id,
      },
    });

    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: `Trạng thái đơn hàng: ${stepInfo?.label}`, type: 'info' },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 md:p-7 shadow-2xl border border-stone-200 max-h-[92vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-stone-200 mb-4 sm:mb-5 shrink-0">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-rose-800 font-bold block mb-0.5">
              Live Order Tracker · Giám Sát Thời Gian Thực
            </span>
            <h3 className="font-display font-bold text-lg sm:text-xl text-stone-900 flex items-center gap-2">
              <span>Đơn Hàng #{order.id}</span>
              {order.paymentStatus === 'PAID' ? (
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Đã thanh toán
                </span>
              ) : (
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Chờ duyệt
                </span>
              )}
            </h3>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isTrackingOpen', isOpen: false } })}
            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer -mr-1 -mt-1"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 space-y-4 sm:space-y-5 flex-1">

          {/* Payment Approval Notice if UNPAID */}
          {order.paymentStatus === 'UNPAID' && (
            <div className="p-3 sm:p-4 rounded-xl bg-amber-50/90 border border-amber-300/80 text-xs text-amber-900 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="font-bold flex items-center gap-1.5 text-xs sm:text-sm text-amber-950">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Đang Chờ Admin Phê Duyệt VietQR</span>
                </span>
                <span className="font-mono font-bold text-sm sm:text-base text-rose-800 sm:text-right">
                  {formatVND(order.totalAmount)}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed">
                Tài khoản nhận: Vietcombank <strong>1027210627 (NGUYEN THIEN DOAN)</strong>. Xưởng sẽ tiến hành cắm hoa ngay sau khi nhận được chuyển khoản.
              </p>
              {state.currentRole === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'APPROVE_ORDER_PAYMENT',
                      payload: { orderId: order.id, adminName: state.user?.name || 'Admin' },
                    })
                  }
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-1 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Admin Phê Duyệt Đã Nhận Tiền</span>
                </button>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-4 sm:space-y-5 px-1 py-1">
            {steps.map((step, idx) => {
              const isDone = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;

              return (
                <div key={step.key} className="flex items-start gap-3 sm:gap-4 relative">
                  {/* Continuous Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-3.5 sm:left-4 top-7 sm:top-8 bottom-0 w-0.5 -ml-px transition-colors ${
                        idx < currentStatusIndex ? 'bg-emerald-600' : 'bg-stone-200'
                      }`}
                    />
                  )}

                  {/* Step Icon Badge */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs ring-4 ring-emerald-50'
                        : 'bg-stone-100 text-stone-400 border border-stone-300'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : step.icon}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 pt-0.5 pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4
                        className={`text-xs sm:text-sm font-semibold ${
                          isCurrent ? 'text-stone-900 font-bold' : isDone ? 'text-stone-800' : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full animate-pulse shrink-0">
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recipient & Order Details */}
          <div className="bg-[#FAF8F5] rounded-xl p-3.5 sm:p-4 border border-stone-200 text-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
              <span className="text-stone-500 flex items-center gap-1.5 text-[11px] sm:text-xs">
                <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Người nhận hoa:</span>
              </span>
              <span className="font-semibold text-stone-900 text-xs sm:text-right">
                {order.deliveryInfo.recipientName} ({order.deliveryInfo.recipientPhone})
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-2 pt-1 border-t border-stone-200/60">
              <span className="text-stone-500 flex items-center gap-1.5 text-[11px] sm:text-xs shrink-0">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Địa chỉ giao:</span>
              </span>
              <span className="text-stone-800 text-xs sm:text-right leading-relaxed">
                {order.deliveryInfo.address}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2 pt-1 border-t border-stone-200/60">
              <span className="text-stone-500 flex items-center gap-1.5 text-[11px] sm:text-xs">
                <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Khung giờ giao:</span>
              </span>
              <span className="font-medium text-stone-800 text-xs sm:text-right">
                {order.deliveryInfo.deliveryTimeSlot}
              </span>
            </div>

            {order.deliveryInfo.cardMessage && (
              <div className="pt-2 border-t border-stone-200/80">
                <span className="text-stone-500 block mb-1 text-[11px]">Lời chúc trên thiệp:</span>
                <p className="italic text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200/80 text-[11px] sm:text-xs leading-relaxed">
                  "{order.deliveryInfo.cardMessage}"
                </p>
              </div>
            )}
          </div>

          {/* Action / Control Footer */}
          {isStaffOrAdmin ? (
            <div className="p-3 sm:p-3.5 bg-stone-100 rounded-xl border border-stone-200">
              <p className="text-[10px] sm:text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2">
                Điều phối hành trình đơn hàng (STAFF / ADMIN):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {steps.map((step) => (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => handleUpdateStatus(step.key)}
                    className={`py-2 px-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center truncate ${
                      order.orderStatus === step.key
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                    }`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-3.5 bg-rose-50/80 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900">
              <div className="flex items-center gap-2">
                <Flower2 className="w-4 h-4 text-rose-700 shrink-0" />
                <span className="text-[11px] sm:text-xs leading-relaxed">
                  Tiệm hoa sáp Rose luôn cập nhật tiến độ theo thời gian thực đến bạn.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'SET_MODAL', payload: { modal: 'isTrackingOpen', isOpen: false } });
                  dispatch({ type: 'SET_MODAL', payload: { modal: 'isZaloOpen', isOpen: true } });
                }}
                className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 bg-rose-900 hover:bg-rose-800 active:scale-98 text-white text-xs font-semibold rounded-lg shadow-xs whitespace-nowrap transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Cần hỗ trợ về đơn hàng</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

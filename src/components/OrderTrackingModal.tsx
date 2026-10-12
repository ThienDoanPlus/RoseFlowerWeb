/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, Clock, Truck, Flower2, HeartHandshake, Phone, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { OrderStatus } from '../types';
import { formatVND } from '../utils/calculations';

export const OrderTrackingModal: React.FC = () => {
  const { state, dispatch } = useStore();
  const orderId = state.trackingOrderId;
  const order = state.orders.find((o) => o.id === orderId) || state.currentOrder;

  if (!state.isTrackingOpen || !order) return null;

  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'PENDING',
      label: 'Đã Tiếp Nhận Đơn',
      desc: 'Hệ thống đã nhận thanh toán và chuyển đơn đến xưởng hoa gần nhất',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      key: 'ARRANGING',
      label: 'Nghệ Nhân Đang Cắm Hoa',
      desc: 'Tuyển chọn từng bông hoa tươi mới, phối lá phụ và nắn nót viết thiệp',
      icon: <Flower2 className="w-4 h-4" />,
    },
    {
      key: 'SHIPPING',
      label: 'Đang Giao Hoa Hỏa Tốc',
      desc: 'Tài xế chuyên dụng đang di chuyển bảo quản hoa trong thùng giữ ẩm',
      icon: <Truck className="w-4 h-4" />,
    },
    {
      key: 'DELIVERED',
      label: 'Giao Hoa Thành Công',
      desc: 'Hoa tươi đã được trao tận tay người nhận kèm nụ cười rạng rỡ',
      icon: <HeartHandshake className="w-4 h-4" />,
    },
  ];

  const currentStatusIndex = steps.findIndex((s) => s.key === order.orderStatus);

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { orderId: order.id, status: newStatus },
    });

    const stepInfo = steps.find((s) => s.key === newStatus);

    // Push notification to user
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-rose-700 font-semibold block">
              Live Order Tracker · Giám Sát Thời Gian Thực
            </span>
            <h3 className="font-display font-medium text-xl text-stone-900">
              Đơn Hàng #{order.id}
            </h3>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isTrackingOpen', isOpen: false } })}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-6 mb-8">
          {steps.map((step, idx) => {
            const isDone = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;

            return (
              <div key={step.key} className="flex items-start gap-4 relative">
                {/* Connecting line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-12 -ml-px transition-colors ${
                      idx < currentStatusIndex ? 'bg-emerald-600' : 'bg-stone-200'
                    }`}
                  />
                )}

                {/* Circle Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                      : 'bg-stone-100 text-stone-400 border border-stone-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs font-semibold ${
                        isCurrent ? 'text-stone-900 font-bold' : isDone ? 'text-stone-800' : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
                        Hiện tại
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recipient & Florist Details */}
        <div className="bg-[#FAF8F5] rounded-xl p-4 border border-stone-200 text-xs space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-stone-500">Người nhận hoa:</span>
            <span className="font-semibold text-stone-900">{order.deliveryInfo.recipientName} ({order.deliveryInfo.recipientPhone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Địa chỉ giao:</span>
            <span className="text-stone-800 max-w-[240px] truncate text-right">{order.deliveryInfo.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Khung giờ giao:</span>
            <span className="text-stone-800">{order.deliveryInfo.deliveryTimeSlot}</span>
          </div>
          {order.deliveryInfo.cardMessage && (
            <div className="pt-2 border-t border-stone-200/80">
              <span className="text-stone-500 block mb-1">Lời chúc trên thiệp:</span>
              <p className="italic text-stone-700 bg-white p-2 rounded border border-stone-200">
                "{order.deliveryInfo.cardMessage}"
              </p>
            </div>
          )}
        </div>

        {/* Simulation Control for testing */}
        <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
          <p className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2">
            Mô phỏng cập nhật hành trình đơn hàng:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {steps.map((step) => (
              <button
                key={step.key}
                onClick={() => handleUpdateStatus(step.key)}
                className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer truncate ${
                  order.orderStatus === step.key
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

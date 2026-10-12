/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Flower2, Truck, HeartHandshake, Ban, FileEdit, UserCheck } from 'lucide-react';
import { useStore } from '../../store';
import { OrderStatus } from '../../types';

export const OrderStatusUpdater: React.FC = () => {
  const { state, dispatch } = useStore();

  if (!state.isStatusUpdaterOpen || !state.selectedOrderForUpdate) return null;

  const order = state.selectedOrderForUpdate;
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.orderStatus);
  const [notes, setNotes] = useState(order.floristNotes || '');
  const [staffName, setStaffName] = useState(order.assignedStaffName || state.user?.name || 'Trần Thị Mai (Florist)');

  const statusOptions: { value: OrderStatus; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      value: 'PENDING',
      label: 'Chờ tiếp nhận',
      desc: 'Đơn mới tạo, chưa bố trí thợ cắm',
      icon: <Clock className="w-4 h-4" />,
      color: 'border-amber-300 bg-amber-50 text-amber-800',
    },
    {
      value: 'ARRANGING',
      label: 'Đang cắm hoa & In thiệp',
      desc: 'Nghệ nhân đang tuyển chọn hoa, đóng gói & viết thiệp',
      icon: <Flower2 className="w-4 h-4" />,
      color: 'border-rose-300 bg-rose-50 text-rose-800',
    },
    {
      value: 'SHIPPING',
      label: 'Đã bàn giao shipper',
      desc: 'Tài xế đang giao hoa hỏa tốc đến địa chỉ nhận',
      icon: <Truck className="w-4 h-4" />,
      color: 'border-blue-300 bg-blue-50 text-blue-800',
    },
    {
      value: 'DELIVERED',
      label: 'Giao thành công',
      desc: 'Hoa đã trao tận tay khách hàng kèm thiệp chúc mừng',
      icon: <HeartHandshake className="w-4 h-4" />,
      color: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    },
    {
      value: 'CANCELLED',
      label: 'Hủy đơn',
      desc: 'Khách yêu cầu hủy hoặc đổi lịch',
      icon: <Ban className="w-4 h-4" />,
      color: 'border-stone-300 bg-stone-100 text-stone-700',
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: {
        orderId: order.id,
        status: selectedStatus,
        floristNotes: notes,
        assignedStaffName: staffName,
      },
    });

    // Add push notification for customer
    const statusObj = statusOptions.find((s) => s.value === selectedStatus);
    dispatch({
      type: 'ADD_PUSH_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        title: `Đơn hàng #${order.id}: ${statusObj?.label}`,
        message: notes ? `${notes} · Phụ trách: ${staffName}` : (statusObj?.desc || ''),
        timestamp: 'Vừa xong',
        type: 'order',
        read: false,
        orderId: order.id,
      },
    });

    dispatch({ type: 'SET_UPDATE_ORDER', payload: null });
  };

  const handleClose = () => {
    dispatch({ type: 'SET_UPDATE_ORDER', payload: null });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-100 text-rose-800 rounded-xl">
              <FileEdit className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-medium text-lg text-stone-900">
                Cập Nhật Tiến Độ & Trạng Thái Đơn Hàng
              </h3>
              <p className="text-xs text-stone-500">
                Đơn hàng #{order.id} · Người nhận: {order.deliveryInfo.recipientName} ({order.deliveryInfo.recipientPhone})
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Chuyển Trạng Thái Đơn
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {statusOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    selectedStatus === opt.value
                      ? `${opt.color} ring-2 ring-rose-600 shadow-xs font-semibold`
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span className="mt-0.5">{opt.icon}</span>
                  <div>
                    <span className="text-xs font-medium block">{opt.label}</span>
                    <span className="text-[11px] opacity-75 line-clamp-1">{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Florist */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-stone-500" />
              <span>Florist / Nhân Viên Phụ Trách</span>
            </label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="VD: Trần Thị Mai (Florist Trưởng)"
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800"
            />
          </div>

          {/* Florist Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Ghi Chú Tiến Độ Cắm Hoa & Bàn Giao
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Đã hoàn tất bó hoa sáp theo hình thực tế, thắt nơ ruy băng lụa cao cấp, đã gửi hình cho khách xem duyệt và bàn giao shipper..."
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800"
            />
          </div>

          {/* Quick Summary of Order Items */}
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 text-xs">
            <span className="font-semibold text-stone-800 block mb-1">Mục hoa cần hoàn thiện:</span>
            <ul className="space-y-1 text-stone-600">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>
                    • {i.flower.name} ({i.sizeVariant.toUpperCase()})
                  </span>
                  <span className="font-mono font-medium">x{i.quantity}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-900 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lưu Cập Nhật</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

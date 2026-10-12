/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Clock,
  Flower2,
  Truck,
  HeartHandshake,
  Printer,
  FileEdit,
  Search,
  MessageSquare,
  AlertCircle,
  Package,
  Calendar,
  MapPin,
  Phone,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useStore } from '../../store';
import { Order, OrderStatus } from '../../types';
import { formatVND } from '../../utils/calculations';

export const StaffOrderBoard: React.FC = () => {
  const { state, dispatch } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<OrderStatus | 'ALL'>('ALL');

  const columns: { status: OrderStatus; title: string; color: string; badgeColor: string; icon: React.ReactNode }[] = [
    {
      status: 'PENDING',
      title: 'Chờ Tiếp Nhận',
      color: 'border-t-4 border-amber-500 bg-amber-50/40',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
    },
    {
      status: 'ARRANGING',
      title: 'Đang Cắm Hoa & In Thiệp',
      color: 'border-t-4 border-rose-500 bg-rose-50/40',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: <Flower2 className="w-4 h-4 text-rose-600" />,
    },
    {
      status: 'SHIPPING',
      title: 'Đang Giao Hoa Hỏa Tốc',
      color: 'border-t-4 border-blue-500 bg-blue-50/40',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <Truck className="w-4 h-4 text-blue-600" />,
    },
    {
      status: 'DELIVERED',
      title: 'Giao Thành Công',
      color: 'border-t-4 border-emerald-500 bg-emerald-50/40',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <HeartHandshake className="w-4 h-4 text-emerald-600" />,
    },
  ];

  // Filter orders
  const filteredOrders = state.orders.filter((order) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchId = order.id.toLowerCase().includes(q);
      const matchCustomer = order.deliveryInfo.recipientName.toLowerCase().includes(q);
      const matchPhone = order.deliveryInfo.recipientPhone.includes(q);
      if (!matchId && !matchCustomer && !matchPhone) return false;
    }
    if (selectedStatusTab !== 'ALL' && order.orderStatus !== selectedStatusTab) {
      return false;
    }
    return true;
  });

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === 'PENDING') return 'ARRANGING';
    if (current === 'ARRANGING') return 'SHIPPING';
    if (current === 'SHIPPING') return 'DELIVERED';
    return null;
  };

  const handleQuickAdvance = (order: Order) => {
    const next = getNextStatus(order.orderStatus);
    if (next) {
      dispatch({
        type: 'UPDATE_ORDER_STATUS',
        payload: {
          orderId: order.id,
          status: next,
          assignedStaffName: state.user?.name || 'Trần Thị Mai (Florist)',
        },
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-200">
                <Sparkles className="w-3.5 h-3.5 text-rose-700" />
                Staff Florist Workspace · Nhân Viên Tư Vấn & Cắm Hoa
              </span>
              <span className="text-xs text-stone-500 font-medium">Chi nhánh 294 Phạm Văn Bạch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-medium text-stone-900">
              Bảng Điều Phối & Kanban Đơn Hàng Hoa Tươi
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Theo dõi tiến độ cắm hoa thời gian thực, in thiệp chúc mừng, kiểm tra tồn kho và điều phối shipper hỏa tốc.
            </p>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCustomerChatOpen', isOpen: true } })}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Tư Vấn Khách Hàng (Chat)</span>
            </button>
          </div>
        </div>

        {/* Operational KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-stone-100">
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200/60">
            <span className="text-stone-500 text-xs block">Tổng đơn hôm nay</span>
            <span className="font-mono text-xl font-bold text-stone-900 mt-1 block">
              {state.orders.length} đơn
            </span>
          </div>
          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60">
            <span className="text-amber-800 text-xs block">Chờ tiếp nhận</span>
            <span className="font-mono text-xl font-bold text-amber-900 mt-1 block">
              {state.orders.filter((o) => o.orderStatus === 'PENDING').length} đơn
            </span>
          </div>
          <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200/60">
            <span className="text-rose-800 text-xs block">Đang cắm & in thiệp</span>
            <span className="font-mono text-xl font-bold text-rose-900 mt-1 block">
              {state.orders.filter((o) => o.orderStatus === 'ARRANGING').length} đơn
            </span>
          </div>
          <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/60">
            <span className="text-emerald-800 text-xs block">Đã giao thành công</span>
            <span className="font-mono text-xl font-bold text-emerald-900 mt-1 block">
              {state.orders.filter((o) => o.orderStatus === 'DELIVERED').length} đơn
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-stone-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn, tên hoặc số điện thoại..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800"
            />
          </div>

          {/* Tab filter for mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            <button
              onClick={() => setSelectedStatusTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                selectedStatusTab === 'ALL'
                  ? 'bg-rose-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Tất cả ({state.orders.length})
            </button>
            {columns.map((c) => (
              <button
                key={c.status}
                onClick={() => setSelectedStatusTab(c.status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  selectedStatusTab === c.status
                    ? 'bg-rose-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {c.title} ({state.orders.filter((o) => o.orderStatus === c.status).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns
          .filter((col) => selectedStatusTab === 'ALL' || selectedStatusTab === col.status)
          .map((col) => {
            const columnOrders = filteredOrders.filter((o) => o.orderStatus === col.status);

            return (
              <div
                key={col.status}
                className={`bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col min-h-[500px] ${col.color}`}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white/80 backdrop-blur-xs">
                  <div className="flex items-center gap-2">
                    {col.icon}
                    <h3 className="font-semibold text-stone-900 text-xs sm:text-sm">
                      {col.title}
                    </h3>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${col.badgeColor}`}>
                    {columnOrders.length}
                  </span>
                </div>

                {/* Column Body Cards */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[750px]">
                  {columnOrders.length === 0 ? (
                    <div className="py-12 text-center text-stone-400 text-xs italic">
                      Không có đơn hàng nào
                    </div>
                  ) : (
                    columnOrders.map((order) => {
                      const delivery = order.deliveryInfo;
                      const nextStatus = getNextStatus(order.orderStatus);

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-xl p-4 border border-stone-200 hover:border-rose-300 shadow-2xs hover:shadow-sm transition-all text-xs space-y-3"
                        >
                          {/* Order Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <span className="font-mono font-bold text-rose-950 text-sm">
                              #{order.id}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Flower Items List */}
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <img
                                  src={item.flower.imageUrl}
                                  alt={item.flower.name}
                                  className="w-9 h-9 rounded-md object-cover border border-stone-200 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-stone-900 truncate">{item.flower.name}</p>
                                  <p className="text-[11px] text-stone-500">
                                    Size {item.sizeVariant.toUpperCase()} · SL: <strong>{item.quantity}</strong>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Recipient & Slot */}
                          <div className="bg-[#FAF8F5] p-2.5 rounded-lg space-y-1 text-[11px]">
                            <div className="flex items-center gap-1.5 text-stone-700">
                              <MapPin className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                              <span className="truncate">{delivery.address}, {delivery.district}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-600">
                              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{delivery.recipientName} ({delivery.recipientPhone})</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-500">
                              <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{delivery.deliveryDate} · {delivery.deliveryTimeSlot}</span>
                            </div>
                          </div>

                          {/* Card Message Snippet */}
                          {delivery.cardMessage && (
                            <div className="bg-rose-50/70 p-2 rounded-lg border border-rose-200/50 text-[11px]">
                              <span className="text-[10px] uppercase font-semibold text-rose-900 block mb-0.5">
                                Lời chúc thiệp:
                              </span>
                              <p className="italic text-rose-950 line-clamp-2">
                                "{delivery.cardMessage}"
                              </p>
                              <span className="text-[10px] text-stone-500 block text-right mt-1">
                                Ký tên: {delivery.senderName || 'Ẩn danh'}
                              </span>
                            </div>
                          )}

                          {/* Florist internal notes */}
                          {order.floristNotes && (
                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/60 text-[11px] text-amber-900">
                              <span className="font-semibold block mb-0.5">Ghi chú cắm hoa:</span>
                              <p>{order.floristNotes}</p>
                              {order.assignedStaffName && (
                                <span className="text-[10px] text-amber-700 block mt-0.5">
                                  Phụ trách: {order.assignedStaffName}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Total amount & Payment */}
                          <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                            <span className="text-stone-500">
                              {order.paymentMethod} · {order.paymentStatus}
                            </span>
                            <span className="font-mono font-bold text-stone-900">
                              {formatVND(order.totalAmount)}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                            {/* Print Card Button */}
                            <button
                              onClick={() => dispatch({ type: 'SET_PRINT_ORDER', payload: order })}
                              className="px-2.5 py-1.5 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="In thiệp chúc mừng cho bó hoa"
                            >
                              <Printer className="w-3.5 h-3.5 text-rose-700" />
                              <span>In Thiệp</span>
                            </button>

                            {/* Status Updater Button */}
                            <button
                              onClick={() => dispatch({ type: 'SET_UPDATE_ORDER', payload: order })}
                              className="px-2.5 py-1.5 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="Cập nhật tiến độ cắm hoa"
                            >
                              <FileEdit className="w-3.5 h-3.5 text-stone-600" />
                              <span>Ghi Chú</span>
                            </button>
                          </div>

                          {/* Quick Advance Button */}
                          {nextStatus && (
                            <button
                              onClick={() => handleQuickAdvance(order)}
                              className="w-full py-1.5 text-[11px] font-semibold text-rose-900 hover:text-white bg-rose-50 hover:bg-rose-900 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                            >
                              <span>
                                {nextStatus === 'ARRANGING' && 'Bắt đầu cắm hoa'}
                                {nextStatus === 'SHIPPING' && 'Bàn giao shipper'}
                                {nextStatus === 'DELIVERED' && 'Xác nhận giao xong'}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
      </div>

    </div>
  );
};

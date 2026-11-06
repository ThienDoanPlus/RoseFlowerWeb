/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingUp,
  Package,
  CreditCard,
  Users,
  Sparkles,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  Star,
  MapPin,
  Clock,
  Flower2,
  CheckCircle2,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { useStore } from '../../store';
import { AdminTab } from '../../types';
import { formatVND } from '../../utils/calculations';
import { FlowerManager } from './FlowerManager';
import { VoucherManager } from './VoucherManager';
import { UserRoleManager } from './UserRoleManager';
import { ReviewModerator } from './ReviewModerator';

export const AdminDashboard: React.FC = () => {
  const { state, dispatch } = useStore();

  const activeTab = state.adminActiveTab;

  const setActiveTab = (tab: AdminTab) => {
    dispatch({ type: 'SET_ADMIN_TAB', payload: tab });
  };

  // Calculate real financial KPIs from orders
  const totalRevenue = state.orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.totalAmount : 0), 0);
  const totalOrdersCount = state.orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const totalUsersCount = state.usersList.length;

  // Payment Breakdown
  const paymentMethodCounts = state.orders.reduce(
    (acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.totalAmount;
      return acc;
    },
    {} as Record<string, number>
  );

  // Pending VietQR Payment Approvals
  const pendingApprovalOrders = state.orders.filter(
    (o) => o.paymentStatus === 'UNPAID' || o.orderStatus === 'PENDING'
  );

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Tổng Quan Tài Chính & KPIs', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'flowers', label: 'Quản Lý Sản Phẩm Hoa', icon: <Flower2 className="w-4 h-4" /> },
    { key: 'vouchers', label: 'Quản Lý Voucher & Lễ', icon: <Tag className="w-4 h-4" /> },
    { key: 'users', label: 'Phân Quyền & Nhân Sự', icon: <Users className="w-4 h-4" /> },
    { key: 'reviews', label: 'Kiểm Duyệt Đánh Giá', icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 sm:p-8 shadow-sm border border-stone-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                Admin Portal · Quản Trị Hệ Thống Toàn Quyền
              </span>
              <span className="text-xs text-stone-500 font-medium">Rose Flowers</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-medium text-stone-900">
              Bảng Điều Hành Doanh Thu & Quản Trị Tiệm Hoa
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Thống kê tài chính đa kênh, quản lý danh mục hoa sáp, cấu hình mã voucher ngày lễ và phân quyền nhân sự.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 text-right">
              <span className="text-[11px] text-stone-400 block">Doanh Thu Tích Lũy</span>
              <span className="font-mono text-base sm:text-lg font-bold text-rose-950">
                {formatVND(totalRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto mt-6 pt-6 border-t border-stone-100 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* KPI 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs">
                <span>Tổng Doanh Thu</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-2xl font-bold text-stone-900">
                {formatVND(totalRevenue)}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+18.4% so với tuần trước</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs">
                <span>Tổng Đơn Hàng</span>
                <span className="p-2 rounded-lg bg-rose-50 text-rose-700">
                  <ShoppingBag className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-2xl font-bold text-stone-900">
                {totalOrdersCount} đơn
              </div>
              <div className="text-[11px] text-stone-500">
                {state.orders.filter((o) => o.orderStatus === 'DELIVERED').length} đơn đã giao thành công
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs">
                <span>Giá Trị Trung Bình (AOV)</span>
                <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-2xl font-bold text-stone-900">
                {formatVND(avgOrderValue)}
              </div>
              <div className="text-[11px] text-stone-500">
                Tỷ lệ đơn quà tặng cao cấp: <strong>85%</strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs">
                <span>Khách Hàng & Thành Viên</span>
                <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="font-mono text-2xl font-bold text-stone-900">
                {totalUsersCount} tài khoản
              </div>
              <div className="text-[11px] text-emerald-700">
                100% khách xác thực Google/Gmail
              </div>
            </div>
          </div>

          {/* Pending VietQR Payment Approvals Section */}
          <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-base text-stone-900 flex items-center gap-2">
                    <span>Phê Duyệt Chuyển Khoản VietQR (Quyền Admin)</span>
                    {pendingApprovalOrders.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        {pendingApprovalOrders.length} đơn chờ duyệt
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Đối soát số dư STK Vietcombank <strong>1027210627 (NGUYEN THIEN DOAN)</strong>. Admin bấm phê duyệt để hệ thống báo khách và xưởng bắt đầu cắm hoa.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-stone-400 block">Tài khoản nhận tiền Vietcombank</span>
                <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  STK: 1027210627 · Sông Vệ
                </span>
              </div>
            </div>

            {pendingApprovalOrders.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-900">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-xs">Tất cả đơn chuyển khoản đã được phê duyệt!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Không còn đơn hàng nào đang chờ xác nhận nhận tiền vào Vietcombank.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovalOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/30 hover:bg-amber-50/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-rose-950 text-sm">#{order.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          {order.paymentStatus === 'UNPAID' ? 'Chưa duyệt nhận tiền' : 'Chờ lên đơn'}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div className="text-xs text-stone-700 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Khách hàng: <strong>{order.deliveryInfo.recipientName}</strong> ({order.deliveryInfo.recipientPhone})</span>
                        <span>Địa chỉ: <strong>{order.deliveryInfo.address}, {order.deliveryInfo.district}</strong></span>
                        <span>Mã đối soát: <strong className="font-mono text-emerald-800">{order.transactionCode || order.id}</strong></span>
                      </div>

                      {order.floristNotes && (
                        <p className="text-[11px] text-stone-500 italic">
                          Ghi chú: {order.floristNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-amber-200">
                      <div className="text-right">
                        <span className="text-[10px] text-stone-500 block uppercase">Số tiền cần nhận</span>
                        <span className="font-mono text-base font-bold text-rose-800">
                          {formatVND(order.totalAmount)}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          dispatch({
                            type: 'APPROVE_ORDER_PAYMENT',
                            payload: { orderId: order.id, adminName: state.user?.name || 'Admin' },
                          })
                        }
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Phê Duyệt Đã Nhận Tiền & Lên Đơn</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method Distribution & Branch Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Payment Method Share */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-display font-medium text-base text-stone-900">
                    Cơ Cấu Phương Thức Thanh Toán
                  </h3>
                  <p className="text-xs text-stone-500">
                    Kênh duy nhất: Chuyển khoản VietQR (Vietcombank 1027210627)
                  </p>
                </div>
                <CreditCard className="w-5 h-5 text-rose-800" />
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { key: 'VIETQR', label: 'VietQR Napas 24/7 (Vietcombank 1027210627)', color: 'bg-emerald-500' },
                ].map((item) => {
                  const amount = totalRevenue;
                  const percentage = 100;

                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-stone-700">{item.label}</span>
                        <span className="font-mono text-stone-900 font-semibold">
                          {formatVND(amount)} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Branch Performance */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-display font-medium text-base text-stone-900">
                    Hiệu Suất Theo Hệ Thống Cửa Hàng
                  </h3>
                  <p className="text-xs text-stone-500">
                    Phân bổ đơn hoa sáp theo các điểm chi nhánh TP.HCM
                  </p>
                </div>
                <MapPin className="w-5 h-5 text-rose-800" />
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900 text-xs block">
                      Flagship Store: 294 Phạm Văn Bạch, Phường Tân Sơn
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Bán kính freeship &lt;3km, thời gian giao trung bình 40 phút
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs text-rose-900 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    Chiếm 82% đơn
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900 text-xs block">
                      Kho Sỉ & Xưởng Gia Công: Quang Trung, Gò Vấp
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Đơn sỉ số lượng lớn và kệ hoa khai trương sự kiện
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs text-stone-700 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                    Chiếm 18% đơn
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-display font-medium text-base text-stone-900">
              Top Sản Phẩm Hoa Bán Chạy Nhất (Boutique Bestsellers)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {state.flowers.slice(0, 3).map((f, idx) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] flex items-center gap-3"
                >
                  <img
                    src={f.imageUrl}
                    alt={f.name}
                    className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-rose-700 uppercase">
                      Top #{idx + 1} Best Seller
                    </span>
                    <p className="font-semibold text-stone-900 text-xs truncate mt-0.5">{f.name}</p>
                    <p className="font-mono font-bold text-rose-950 text-xs mt-1">
                      {formatVND(f.salePrice || f.basePrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'flowers' && <FlowerManager />}

      {activeTab === 'vouchers' && <VoucherManager />}

      {activeTab === 'users' && <UserRoleManager />}

      {activeTab === 'reviews' && <ReviewModerator />}

    </div>
  );
};

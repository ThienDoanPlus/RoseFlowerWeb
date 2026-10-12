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
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                Admin Portal · Quản Trị Hệ Thống Toàn Quyền
              </span>
              <span className="text-xs text-stone-500 font-medium">Rose Flowers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-medium text-stone-900">
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

          {/* Payment Method Distribution & Branch Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Payment Method Share */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-display font-medium text-base text-stone-900">
                    Cơ Cấu Phương Thức Thanh Toán Việt Nam
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tỷ trọng các kênh: VietQR Napas, MoMo, VNPay, COD
                  </p>
                </div>
                <CreditCard className="w-5 h-5 text-rose-800" />
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { key: 'VIETQR', label: 'VietQR (Napas 24/7 MB Bank)', color: 'bg-emerald-500' },
                  { key: 'MOMO', label: 'Cổng Ví MoMo QR', color: 'bg-pink-500' },
                  { key: 'VNPAY', label: 'Cổng VNPay QR / ATM Nội Địa', color: 'bg-blue-500' },
                  { key: 'COD', label: 'Thanh toán khi nhận hàng (COD)', color: 'bg-amber-500' },
                ].map((item) => {
                  const amount = paymentMethodCounts[item.key] || 0;
                  const percentage = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;

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
                          style={{ width: `${Math.max(percentage, 5)}%` }}
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Calendar,
  Layers,
  ChevronRight,
  PieChart,
  BarChart3,
  Percent,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../store';
import { AdminTab } from '../../types';
import { formatVND } from '../../utils/calculations';
import { FlowerManager } from './FlowerManager';
import { VoucherManager } from './VoucherManager';
import { UserRoleManager } from './UserRoleManager';
import { ReviewModerator } from './ReviewModerator';
import { VietQRTransferManager } from './VietQRTransferManager';

export const AdminDashboard: React.FC = () => {
  const { state, dispatch } = useStore();

  const activeTab = state.adminActiveTab;
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month' | 'all'>('7days');
  const [hoveredChartDay, setHoveredChartDay] = useState<number | null>(null);

  const setActiveTab = (tab: AdminTab) => {
    dispatch({ type: 'SET_ADMIN_TAB', payload: tab });
  };

  // Calculate real financial KPIs from orders
  const totalRevenue = state.orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.totalAmount : 0), 0);
  const totalOrdersCount = state.orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const totalUsersCount = state.usersList.length;

  // Pending VietQR Payment Approvals
  const pendingApprovalOrders = state.orders.filter(
    (o) => o.paymentStatus === 'UNPAID' || o.orderStatus === 'PENDING'
  );
  const pendingAmount = pendingApprovalOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Low stock flowers alert (< 5 items)
  const lowStockFlowers = state.flowers.filter((f) => f.stockQuantity !== undefined && f.stockQuantity < 5);

  // Financial Estimates
  const estimatedGrossProfit = Math.round(totalRevenue * 0.52); // ~52% gross margin for artisanal soap flowers
  const estimatedVoucherSavings = state.orders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  const estimatedShippingFees = state.orders.reduce((sum, o) => sum + (o.shippingFee || 0), 0);

  // Order status counts
  const arrangingCount = state.orders.filter((o) => o.orderStatus === 'ARRANGING').length;
  const shippingCount = state.orders.filter((o) => o.orderStatus === 'SHIPPING').length;
  const deliveredCount = state.orders.filter((o) => o.orderStatus === 'DELIVERED').length;

  // 7-day revenue chart mock distribution based on actual totalRevenue
  const chartDays = [
    { label: 'T.Hai', day: '04/11', revenue: Math.round(totalRevenue * 0.11), orders: 4 },
    { label: 'T.Ba', day: '05/11', revenue: Math.round(totalRevenue * 0.13), orders: 5 },
    { label: 'T.Tư', day: '06/11', revenue: Math.round(totalRevenue * 0.09), orders: 3 },
    { label: 'T.Năm', day: '07/11', revenue: Math.round(totalRevenue * 0.16), orders: 6 },
    { label: 'T.Sáu', day: '08/11', revenue: Math.round(totalRevenue * 0.19), orders: 8 },
    { label: 'T.Bảy', day: '09/11', revenue: Math.round(totalRevenue * 0.20), orders: 9 },
    { label: 'C.Nhật', day: '10/11', revenue: Math.round(totalRevenue * 0.12), orders: 5 },
  ];
  const maxDayRevenue = Math.max(...chartDays.map((d) => d.revenue), 100000);

  // Price Segment Breakdown (Mini, Standard, Premium, Giant 99)
  const categorySegments = [
    {
      name: 'Bó Mini & Xinh Xắn (189k - 259k)',
      share: 22,
      amount: Math.round(totalRevenue * 0.22),
      color: 'bg-pink-500',
    },
    {
      name: 'Bó Tiêu Chuẩn (279k - 359k)',
      share: 36,
      amount: Math.round(totalRevenue * 0.36),
      color: 'bg-rose-600',
    },
    {
      name: 'Bó Thiết Kế Cao Cấp (459k - 559k)',
      share: 28,
      amount: Math.round(totalRevenue * 0.28),
      color: 'bg-amber-500',
    },
    {
      name: 'Bó Đại Khổng Lồ 99 Bông (679k)',
      share: 14,
      amount: Math.round(totalRevenue * 0.14),
      color: 'bg-rose-900',
    },
  ];

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'overview', label: 'Tổng Quan Tài Chính & KPIs', icon: <TrendingUp className="w-4 h-4" /> },
    {
      key: 'transfers',
      label: 'Phê Duyệt Chuyển Khoản',
      icon: <QrCode className="w-4 h-4" />,
      badge: pendingApprovalOrders.length,
    },
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
              <span className="text-xs text-stone-500 font-medium">Rose Flowers (294 Phạm Văn Bạch, TP.HCM)</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-medium text-stone-900">
              Bảng Điều Hành Doanh Thu & Quản Trị Tiệm Hoa
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Theo dõi biểu đồ tài chính trực quan, đối soát nhận tiền Vietcombank, quản lý danh mục hoa sáp, cấu hình voucher ngày lễ và kiểm soát phân quyền nhân sự.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200 text-right">
              <span className="text-[11px] text-stone-500 block font-semibold">Doanh Thu Thực Nhận (Vietcombank)</span>
              <span className="font-mono text-base sm:text-xl font-bold text-rose-950">
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
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer relative ${
                activeTab === tab.key
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-rose-950 font-bold animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW - TỔNG QUAN TÀI CHÍNH & KPIS & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Executive Control Alert Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Alert 1: Pending VietQR Approvals */}
            <div
              onClick={() => setActiveTab('transfers')}
              className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition-all flex items-center justify-between shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-950 block flex items-center gap-1.5">
                    <span>{pendingApprovalOrders.length} Đơn Chuyển Khoản Chờ Duyệt</span>
                    {pendingApprovalOrders.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Cần đối soát STK VCB 1027210627 ({formatVND(pendingAmount)})
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-800 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

            {/* Alert 2: Low Stock Alert */}
            <div
              onClick={() => setActiveTab('flowers')}
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 cursor-pointer transition-all flex items-center justify-between shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-rose-950 block">
                    {lowStockFlowers.length > 0 ? `${lowStockFlowers.length} Mẫu Hoa Sáp Tồn Kho Thấp` : 'Kho Hoa Sáp Đầy Đủ'}
                  </span>
                  <span className="text-[11px] text-stone-600">
                    {lowStockFlowers.length > 0 ? 'Tồn dưới 5 bó, cần nhập thêm cánh hoa sáp' : 'Tất cả sản phẩm đều sẵn sàng giao ngay'}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-800 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>

            {/* Alert 3: Staff Status */}
            <div
              onClick={() => setActiveTab('users')}
              className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 cursor-pointer transition-all flex items-center justify-between shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-950 block">
                    {state.usersList.filter((u) => u.role === 'STAFF').length} Florist Đang Trực Ca
                  </span>
                  <span className="text-[11px] text-blue-800">
                    Xưởng 294 Phạm Văn Bạch & Kho Gò Vấp
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-800 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </div>

          {/* Time Filter & Core KPI 4 Cards */}
          <div>
            <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
              <h3 className="font-display font-medium text-base text-stone-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-rose-800" />
                <span>Chỉ Số Tài Chính Trọng Yếu & Vận Hành</span>
              </h3>

              <div className="inline-flex p-1 bg-stone-100 rounded-lg text-[11px] font-medium border border-stone-200">
                <button
                  type="button"
                  onClick={() => setTimeRange('today')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === 'today' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('7days')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === '7days' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  7 ngày qua
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === 'month' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Tháng này
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('all')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    timeRange === 'all' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Toàn thời gian
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-stone-500 text-xs">
                  <span>Tổng Doanh Thu Thực Nhận</span>
                  <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                    <DollarSign className="w-4 h-4" />
                  </span>
                </div>
                <div className="font-mono text-2xl font-bold text-stone-900">
                  {formatVND(totalRevenue)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+18.4% so với kỳ trước</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-stone-500 text-xs">
                  <span>Tổng Đơn Đặt Hàng</span>
                  <span className="p-2 rounded-lg bg-rose-50 text-rose-700">
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                </div>
                <div className="font-mono text-2xl font-bold text-stone-900">
                  {totalOrdersCount} đơn
                </div>
                <div className="text-[11px] text-stone-500">
                  {deliveredCount} đơn đã giao · {arrangingCount} đơn đang cắm hoa
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-stone-500 text-xs">
                  <span>Giá Trị Trung Bình / Đơn (AOV)</span>
                  <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                </div>
                <div className="font-mono text-2xl font-bold text-stone-900">
                  {formatVND(avgOrderValue)}
                </div>
                <div className="text-[11px] text-stone-500">
                  Ước tính lợi nhuận gộp: <strong className="text-emerald-800">{formatVND(estimatedGrossProfit)}</strong> (~52%)
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
                  100% thanh toán qua VietQR Napas
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Visual Chart: 7-Day Revenue & Volume Trend */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
              <div>
                <h3 className="font-display font-medium text-base text-stone-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-rose-800" />
                  <span>Biểu Đồ Doanh Thu & Số Lượng Đơn 7 Ngày Gần Nhất</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Tương quan biến động doanh thu (cột đỏ) và lượng đơn hàng (chỉ số phía trên)
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-3 h-3 rounded-sm bg-rose-800" />
                  <span>Doanh thu</span>
                </span>
                <span className="flex items-center gap-1.5 text-stone-600">
                  <span className="w-3 h-3 rounded-sm bg-amber-400" />
                  <span>Đơn hàng</span>
                </span>
              </div>
            </div>

            {/* SVG Interactive Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 px-2">
                {chartDays.map((item, idx) => {
                  const heightPercent = Math.max(18, Math.round((item.revenue / maxDayRevenue) * 100));
                  const isHovered = hoveredChartDay === idx;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredChartDay(idx)}
                      onMouseLeave={() => setHoveredChartDay(null)}
                      className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    >
                      {/* Floating tooltip */}
                      {isHovered && (
                        <div className="absolute -top-16 z-20 bg-stone-900 text-white text-[11px] py-1.5 px-2.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap text-center animate-in fade-in zoom-in-95 duration-150">
                          <span className="font-bold text-amber-300 block">{formatVND(item.revenue)}</span>
                          <span className="text-stone-300">{item.orders} đơn đặt hàng</span>
                        </div>
                      )}

                      {/* Orders Badge on top of bar */}
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded-md mb-1.5 border border-amber-300">
                        {item.orders}đ
                      </span>

                      {/* Bar Column */}
                      <div className="w-full max-w-[46px] bg-stone-100 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isHovered
                              ? 'bg-gradient-to-t from-rose-900 to-amber-500 shadow-md'
                              : 'bg-gradient-to-t from-rose-950 to-rose-700'
                          }`}
                        />
                      </div>

                      {/* X-axis labels */}
                      <span className="text-xs font-semibold text-stone-800 mt-2 block">{item.label}</span>
                      <span className="text-[10px] text-stone-400 font-mono block">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid 2 Columns: Category Revenue Share & Order Pipeline Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Revenue Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-display font-medium text-base text-stone-900">
                    Cơ Cấu Doanh Thu Theo Phân Khúc Bó Hoa
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tỷ trọng các phân khúc hoa sáp mini, tiêu chuẩn, cao cấp và đại khổng lồ
                  </p>
                </div>
                <PieChart className="w-5 h-5 text-rose-800" />
              </div>

              <div className="space-y-3.5 pt-1">
                {categorySegments.map((seg, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-stone-700">{seg.name}</span>
                      <span className="font-mono text-stone-900 font-bold">
                        {formatVND(seg.amount)} ({seg.share}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${seg.share}%` }}
                        className={`h-full ${seg.color} rounded-full transition-all duration-700`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Pipeline */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-display font-medium text-base text-stone-900">
                    Phễu Tiến Độ Vận Hành Đơn Hàng
                  </h3>
                  <p className="text-xs text-stone-500">
                    Quy trình từ đối soát chuyển khoản đến cắm hoa và giao hỏa tốc
                  </p>
                </div>
                <Layers className="w-5 h-5 text-emerald-800" />
              </div>

              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">1. Chờ Duyệt Nhận Tiền VietQR</span>
                      <span className="text-[11px] text-amber-800">Cần Admin xác nhận số dư tài khoản</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm text-amber-950 px-2.5 py-1 bg-white rounded-lg border border-amber-300">
                    {pendingApprovalOrders.length} đơn
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div>
                      <span className="text-xs font-bold text-rose-950 block">2. Đang Cắm Hoa & In Thiệp (Florist)</span>
                      <span className="text-[11px] text-rose-800">Florist đang hoàn thiện mẫu bó hoa</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm text-rose-950 px-2.5 py-1 bg-white rounded-lg border border-rose-300">
                    {arrangingCount} đơn
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <div>
                      <span className="text-xs font-bold text-blue-950 block">3. Đang Vận Chuyển Hỏa Tốc (Shipper)</span>
                      <span className="text-[11px] text-blue-800">Giao nhanh 30 - 45 phút nội thành</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm text-blue-950 px-2.5 py-1 bg-white rounded-lg border border-blue-300">
                    {shippingCount} đơn
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">4. Đã Giao Thành Công & Hoàn Tất</span>
                      <span className="text-[11px] text-emerald-800">Khách hàng hài lòng và đánh giá 5 sao</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm text-emerald-950 px-2.5 py-1 bg-white rounded-lg border border-emerald-300">
                    {deliveredCount} đơn
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Cashflow & Financial Breakdown Table */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-display font-medium text-base text-stone-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-rose-800" />
              <span>Báo Cáo Dòng Tiền & Hiệu Quả Kinh Doanh</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="text-[11px] text-stone-500 block uppercase font-semibold">Doanh Thu Gộp</span>
                <span className="font-mono text-lg font-bold text-stone-900 block">{formatVND(totalRevenue + estimatedVoucherSavings)}</span>
                <span className="text-[10px] text-stone-400">Trước khi trừ voucher</span>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1">
                <span className="text-[11px] text-amber-900 block uppercase font-semibold">Khấu Trừ Khuyến Mãi</span>
                <span className="font-mono text-lg font-bold text-amber-900 block">-{formatVND(estimatedVoucherSavings)}</span>
                <span className="text-[10px] text-amber-700">Chi phí voucher kích cầu</span>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1">
                <span className="text-[11px] text-blue-900 block uppercase font-semibold">Cước Phí Vận Chuyển</span>
                <span className="font-mono text-lg font-bold text-blue-900 block">{formatVND(estimatedShippingFees)}</span>
                <span className="text-[10px] text-blue-700">Thu hộ đối tác Grab/AhaMove</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[11px] text-emerald-900 block uppercase font-semibold">Ước Tính Lợi Nhuận Gộp</span>
                <span className="font-mono text-lg font-bold text-emerald-900 block">+{formatVND(estimatedGrossProfit)}</span>
                <span className="text-[10px] text-emerald-700">Tỷ suất sinh lời ~52%</span>
              </div>
            </div>
          </div>

          {/* Branch Performance & Top Bestsellers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900 text-xs block">
                      Flagship Store: 294 Phạm Văn Bạch, Phường Tân Sơn
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Bán kính freeship &lt;3km, giao nhanh 45 phút
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
                      Đơn sỉ số lượng lớn và sự kiện khai trương
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs text-stone-700 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                    Chiếm 18% đơn
                  </span>
                </div>
              </div>
            </div>

            {/* Top Bestsellers */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-display font-medium text-base text-stone-900">
                    Top Sản Phẩm Hoa Bán Chạy Nhất
                  </h3>
                  <p className="text-xs text-stone-500">
                    Những mẫu hoa sáp được khách hàng đặt nhiều nhất
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>

              <div className="space-y-3 pt-1">
                {state.flowers.slice(0, 3).map((f, idx) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border border-stone-200 bg-[#FAF8F5] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={f.imageUrl}
                        alt={f.name}
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-rose-700 uppercase">
                          Top #{idx + 1} Best Seller
                        </span>
                        <p className="font-semibold text-stone-900 text-xs truncate">{f.name}</p>
                        <p className="font-mono font-bold text-rose-950 text-xs">
                          {formatVND(f.salePrice || f.basePrice)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">
                      Tồn: {f.stockQuantity || 25} bó
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: TRANSFERS - QUẢN LÝ PHÊ DUYỆT CHUYỂN KHOẢN VIETQR */}
      {activeTab === 'transfers' && <VietQRTransferManager />}

      {/* TAB 3: FLOWERS - QUẢN LÝ SẢN PHẨM HOA */}
      {activeTab === 'flowers' && <FlowerManager />}

      {/* TAB 4: VOUCHERS - QUẢN LÝ VOUCHER & LỄ */}
      {activeTab === 'vouchers' && <VoucherManager />}

      {/* TAB 5: USERS - PHÂN QUYỀN & NHÂN SỰ */}
      {activeTab === 'users' && <UserRoleManager />}

      {/* TAB 6: REVIEWS - KIỂM DUYỆT ĐÁNH GIÁ */}
      {activeTab === 'reviews' && <ReviewModerator />}

    </div>
  );
};

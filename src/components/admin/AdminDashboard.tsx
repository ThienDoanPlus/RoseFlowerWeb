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
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);
  const [categoryChartView, setCategoryChartView] = useState<'donut' | 'bars'>('donut');
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);

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

  // Tính toán dữ liệu biểu đồ doanh thu động theo Ngày, Tuần, Tháng, Năm từ 100% dữ liệu đơn hàng thực tế (state.orders)
  const getChartData = () => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    if (chartPeriod === 'day') {
      // Theo Ngày: 6 khung giờ trong ngày hôm nay
      const todayKey = now.toISOString().split('T')[0];
      const todayOrders = state.orders.filter((o) => o.createdAt && o.createdAt.startsWith(todayKey));

      const timeSlots = [
        { label: '00h - 04h', subLabel: 'Sáng sớm', minHour: 0, maxHour: 4 },
        { label: '04h - 08h', subLabel: 'Bình minh', minHour: 4, maxHour: 8 },
        { label: '08h - 12h', subLabel: 'Buổi sáng', minHour: 8, maxHour: 12 },
        { label: '12h - 16h', subLabel: 'Trưa - Chiều', minHour: 12, maxHour: 16 },
        { label: '16h - 20h', subLabel: 'Chiều tối', minHour: 16, maxHour: 20 },
        { label: '20h - 24h', subLabel: 'Đêm muộn', minHour: 20, maxHour: 24 },
      ];

      return {
        title: 'Biểu Đồ Doanh Thu Theo Khung Giờ (Hôm Nay)',
        subtitle: `Dữ liệu 6 khung giờ ngày ${now.toLocaleDateString('vi-VN')}`,
        gridCols: 'grid-cols-6',
        items: timeSlots.map((slot) => {
          const slotOrders = todayOrders.filter((o) => {
            const h = new Date(o.createdAt).getHours();
            return h >= slot.minHour && h < slot.maxHour;
          });
          const slotRevenue = slotOrders
            .filter((o) => o.paymentStatus === 'PAID')
            .reduce((sum, o) => sum + o.totalAmount, 0);

          return {
            label: slot.label,
            subLabel: slot.subLabel,
            revenue: slotRevenue,
            orders: slotOrders.length,
          };
        }),
      };
    }

    if (chartPeriod === 'week') {
      // Theo Tuần: 7 ngày gần nhất
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayName = i === 6 ? 'Hôm nay' : `T.${d.getDay() === 0 ? 'CN' : d.getDay() + 1}`;
        const dayStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        const dateKey = d.toISOString().split('T')[0];

        const dayOrders = state.orders.filter((o) => o.createdAt && o.createdAt.startsWith(dateKey));
        const dayRevenue = dayOrders
          .filter((o) => o.paymentStatus === 'PAID')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        return {
          label: dayName,
          subLabel: dayStr,
          revenue: dayRevenue,
          orders: dayOrders.length,
        };
      });

      return {
        title: 'Biểu Đồ Doanh Thu & Số Lượng Đơn (7 Ngày Qua)',
        subtitle: 'Tương quan biến động doanh thu và đơn hàng 7 ngày gần nhất',
        gridCols: 'grid-cols-7',
        items: days,
      };
    }

    if (chartPeriod === 'month') {
      // Theo Tháng: 4 tuần trong tháng hiện tại
      const lastDayOfMonth = new Date(curYear, curMonth + 1, 0).getDate();
      const monthPrefix = `${curYear}-${String(curMonth + 1).padStart(2, '0')}`;

      const weeks = [
        { label: 'Tuần 1', subLabel: '01 - 07', startDay: 1, endDay: 7 },
        { label: 'Tuần 2', subLabel: '08 - 14', startDay: 8, endDay: 14 },
        { label: 'Tuần 3', subLabel: '15 - 21', startDay: 15, endDay: 21 },
        { label: 'Tuần 4', subLabel: `22 - ${lastDayOfMonth}`, startDay: 22, endDay: lastDayOfMonth },
      ];

      return {
        title: `Biểu Đồ Doanh Thu Theo Tuần (Tháng ${curMonth + 1}/${curYear})`,
        subtitle: `Phân bổ doanh thu qua 4 tuần của Tháng ${curMonth + 1}`,
        gridCols: 'grid-cols-4',
        items: weeks.map((w) => {
          const weekOrders = state.orders.filter((o) => {
            if (!o.createdAt || !o.createdAt.startsWith(monthPrefix)) return false;
            const d = new Date(o.createdAt);
            const dateNum = d.getDate();
            return dateNum >= w.startDay && dateNum <= w.endDay;
          });
          const weekRevenue = weekOrders
            .filter((o) => o.paymentStatus === 'PAID')
            .reduce((sum, o) => sum + o.totalAmount, 0);

          return {
            label: w.label,
            subLabel: w.subLabel,
            revenue: weekRevenue,
            orders: weekOrders.length,
          };
        }),
      };
    }

    // chartPeriod === 'year': 12 tháng của năm hiện tại
    const months = Array.from({ length: 12 }).map((_, mIdx) => {
      const monthNum = mIdx + 1;
      const monthPrefix = `${curYear}-${String(monthNum).padStart(2, '0')}`;
      const monthOrders = state.orders.filter((o) => o.createdAt && o.createdAt.startsWith(monthPrefix));
      const monthRevenue = monthOrders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        label: `T${monthNum}`,
        subLabel: `Thg ${monthNum}`,
        revenue: monthRevenue,
        orders: monthOrders.length,
      };
    });

    return {
      title: `Biểu Đồ Doanh Thu 12 Tháng Năm ${curYear}`,
      subtitle: `Biến động doanh thu lũy kế qua 12 tháng năm ${curYear}`,
      gridCols: 'grid-cols-12',
      items: months,
    };
  };

  const chartData = getChartData();
  const maxChartRevenue = Math.max(...chartData.items.map((d) => d.revenue), 100000);
  const chartPeriodTotalRevenue = chartData.items.reduce((sum, d) => sum + d.revenue, 0);
  const chartPeriodTotalOrders = chartData.items.reduce((sum, d) => sum + d.orders, 0);

  // Cơ cấu doanh thu theo 4 phân khúc bó hoa (Mini, Tiêu Chuẩn, Cao Cấp, Đại Khổng Lồ)
  const categorySegmentsRaw = [
    {
      id: 'mini',
      name: 'Bó Mini & Xinh Xắn',
      shortName: 'Bó Mini',
      priceRange: '189k - 259k',
      amount: state.orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.items.filter((it) => it.unitPrice <= 259000).reduce((s, it) => s + it.unitPrice * it.quantity, 0), 0),
      quantity: state.orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.items.filter((it) => it.unitPrice <= 259000).reduce((s, it) => s + it.quantity, 0), 0),
      color: 'bg-pink-500',
      hex: '#ec4899',
    },
    {
      id: 'standard',
      name: 'Bó Tiêu Chuẩn',
      shortName: 'Bó Tiêu Chuẩn',
      priceRange: '279k - 359k',
      amount: state.orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.items.filter((it) => it.unitPrice > 259000 && it.unitPrice <= 359000).reduce((s, it) => s + it.unitPrice * it.quantity, 0), 0),
      quantity: state.orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.items.filter((it) => it.unitPrice > 259000 && it.unitPrice <= 359000).reduce((s, it) => s + it.quantity, 0), 0),
      color: 'bg-rose-600',
      hex: '#e11d48',
    },
    {
      id: 'luxury',
      name: 'Bó Thiết Kế Cao Cấp',
      shortName: 'Bó Cao Cấp',
      priceRange: '459k - 559k',
      amount: state.orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.items.filter((it) => it.unitPrice > 359000 && it.unitPrice <= 559000).reduce((s, it) => s + it.unitPrice * it.quantity, 0), 0),
      quantity: state.orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.items.filter((it) => it.unitPrice > 359000 && it.unitPrice <= 559000).reduce((s, it) => s + it.quantity, 0), 0),
      color: 'bg-amber-500',
      hex: '#f59e0b',
    },
    {
      id: 'giant',
      name: 'Bó Đại Khổng Lồ 99 Bông',
      shortName: 'Bó 99 Bông',
      priceRange: '679k',
      amount: state.orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.items.filter((it) => it.unitPrice > 559000).reduce((s, it) => s + it.unitPrice * it.quantity, 0), 0),
      quantity: state.orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.items.filter((it) => it.unitPrice > 559000).reduce((s, it) => s + it.quantity, 0), 0),
      color: 'bg-rose-950',
      hex: '#4c0519',
    },
  ];

  const totalCategoryRevenue = categorySegmentsRaw.reduce((sum, seg) => sum + seg.amount, 0);
  const totalCategoryQuantity = categorySegmentsRaw.reduce((sum, seg) => sum + seg.quantity, 0);

  const categorySegments = categorySegmentsRaw.map((seg) => ({
    ...seg,
    share: totalCategoryRevenue > 0 ? Math.round((seg.amount / totalCategoryRevenue) * 100) : 0,
  }));

  // SVG Circular Donut Chart Metrics (r = 65, circumference ≈ 408.41)
  const donutRadius = 65;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let runningDonutOffset = 0;
  const donutSlices = categorySegments.map((seg) => {
    const fraction = totalCategoryRevenue > 0 ? seg.amount / totalCategoryRevenue : 0;
    const strokeDash = fraction * donutCircumference;
    const currentOffset = runningDonutOffset;
    runningDonutOffset += strokeDash;
    return {
      ...seg,
      fraction,
      strokeDash,
      currentOffset,
    };
  });
  const hoveredCategory = hoveredCategoryIndex !== null ? categorySegments[hoveredCategoryIndex] : null;

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

          {/* Interactive Visual Chart: Revenue & Volume Trend */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-stone-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-rose-800" />
                  <h3 className="font-display font-medium text-base sm:text-lg text-stone-900">
                    {chartData.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 flex-wrap">
                  <span>{chartData.subtitle}</span>
                  <span className="text-stone-300">·</span>
                  <span className="font-medium text-stone-700">
                    Doanh thu kỳ này: <strong className="text-rose-900 font-mono font-bold">{formatVND(chartPeriodTotalRevenue)}</strong>
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="font-medium text-stone-700">
                    Tổng đơn: <strong className="text-amber-800 font-bold">{chartPeriodTotalOrders} đơn</strong>
                  </span>
                </div>
              </div>

              {/* View Mode Selector: Ngày | Tuần | Tháng | Năm */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex p-1 bg-stone-100 rounded-xl text-xs font-semibold border border-stone-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      setChartPeriod('day');
                      setHoveredChartIndex(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      chartPeriod === 'day'
                        ? 'bg-rose-900 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Theo Ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChartPeriod('week');
                      setHoveredChartIndex(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      chartPeriod === 'week'
                        ? 'bg-rose-900 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Theo Tuần
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChartPeriod('month');
                      setHoveredChartIndex(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      chartPeriod === 'month'
                        ? 'bg-rose-900 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Theo Tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChartPeriod('year');
                      setHoveredChartIndex(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      chartPeriod === 'year'
                        ? 'bg-rose-900 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Theo Năm
                  </button>
                </div>

                {/* Legend indicator */}
                <div className="hidden sm:flex items-center gap-3 text-xs pl-2 border-l border-stone-200">
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
            </div>

            {/* SVG Interactive Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="overflow-x-auto pb-2 scrollbar-none">
                <div className={`grid ${chartData.gridCols} gap-2 sm:gap-3 items-end h-60 px-2 min-w-[500px] sm:min-w-full`}>
                  {chartData.items.map((item, idx) => {
                    const heightPercent =
                      item.revenue > 0
                        ? Math.max(16, Math.round((item.revenue / maxChartRevenue) * 100))
                        : 5;
                    const isHovered = hoveredChartIndex === idx;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredChartIndex(idx)}
                        onMouseLeave={() => setHoveredChartIndex(null)}
                        className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                      >
                        {/* Floating tooltip */}
                        {isHovered && (
                          <div className="absolute -top-16 z-20 bg-stone-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl pointer-events-none whitespace-nowrap text-center animate-in fade-in zoom-in-95 duration-150">
                            <span className="font-bold text-amber-300 block">{formatVND(item.revenue)}</span>
                            <span className="text-stone-300">{item.orders} đơn đặt hàng</span>
                            <span className="text-[10px] text-stone-400 block">{item.subLabel}</span>
                          </div>
                        )}

                        {/* Orders Badge on top of bar */}
                        {item.orders > 0 ? (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded-md mb-1.5 border border-amber-300">
                            {item.orders}đ
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 mb-1.5 opacity-60">0đ</span>
                        )}

                        {/* Bar Column */}
                        <div className="w-full max-w-[42px] bg-stone-100 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                              item.revenue > 0
                                ? isHovered
                                  ? 'bg-gradient-to-t from-rose-900 to-amber-500 shadow-md'
                                  : 'bg-gradient-to-t from-rose-950 to-rose-700'
                                : 'bg-stone-200 group-hover:bg-rose-300'
                            }`}
                          />
                        </div>

                        {/* X-axis labels */}
                        <span className="text-xs font-semibold text-stone-800 mt-2 block truncate max-w-full text-center">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono block truncate max-w-full text-center">
                          {item.subLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Grid 2 Columns: Category Revenue Share & Order Pipeline Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Revenue Breakdown - Interactive Circular (Donut) & Bar Chart */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
                <div>
                  <h3 className="font-display font-medium text-base text-stone-900 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-rose-800" />
                    <span>Cơ Cấu Doanh Thu Theo Phân Khúc Bó Hoa</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tỷ trọng doanh thu & sản lượng 4 phân khúc hoa sáp
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setCategoryChartView('donut')}
                    title="Biểu đồ hình tròn (Donut)"
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-medium ${
                      categoryChartView === 'donut'
                        ? 'bg-white text-stone-900 font-bold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <PieChart className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Hình Tròn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryChartView('bars')}
                    title="Biểu đồ thanh ngang"
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-medium ${
                      categoryChartView === 'bars'
                        ? 'bg-white text-stone-900 font-bold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Thanh Ngang</span>
                  </button>
                </div>
              </div>

              {/* View 1: Interactive SVG Donut (Hình Tròn) */}
              {categoryChartView === 'donut' && (
                <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                  {/* Left: SVG Circular Donut Chart */}
                  <div className="relative w-44 h-44 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-full h-full transform -rotate-90"
                    >
                      {/* Background circle track */}
                      <circle
                        cx="100"
                        cy="100"
                        r={donutRadius}
                        fill="transparent"
                        stroke="#f5f5f4"
                        strokeWidth="22"
                      />

                      {totalCategoryRevenue === 0 ? (
                        /* Empty state: subtle dashed ring */
                        <circle
                          cx="100"
                          cy="100"
                          r={donutRadius}
                          fill="transparent"
                          stroke="#e7e5e4"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                        />
                      ) : (
                        donutSlices.map((seg, idx) => {
                          if (seg.strokeDash <= 0) return null;
                          const isHovered = hoveredCategoryIndex === idx;
                          const isAnyHovered = hoveredCategoryIndex !== null;

                          return (
                            <circle
                              key={seg.id}
                              cx="100"
                              cy="100"
                              r={donutRadius}
                              fill="transparent"
                              stroke={seg.hex}
                              strokeWidth={isHovered ? 28 : 22}
                              strokeDasharray={`${Math.max(0, seg.strokeDash - (donutSlices.filter((s) => s.strokeDash > 0).length > 1 ? 2 : 0))} ${donutCircumference}`}
                              strokeDashoffset={-seg.currentOffset}
                              className="transition-all duration-300 cursor-pointer"
                              style={{
                                opacity: isAnyHovered && !isHovered ? 0.4 : 1,
                              }}
                              onMouseEnter={() => setHoveredCategoryIndex(idx)}
                              onMouseLeave={() => setHoveredCategoryIndex(null)}
                            />
                          );
                        })
                      )}
                    </svg>

                    {/* Donut Center Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 pointer-events-none select-none">
                      {hoveredCategory ? (
                        <div className="animate-in fade-in zoom-in-95 duration-150">
                          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                            {hoveredCategory.shortName}
                          </span>
                          <span className="font-mono text-sm sm:text-base font-bold text-rose-950 block leading-tight mt-0.5">
                            {formatVND(hoveredCategory.amount)}
                          </span>
                          <span className="inline-block text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full mt-1 border border-rose-200">
                            {hoveredCategory.share}% ({hoveredCategory.quantity} bó)
                          </span>
                        </div>
                      ) : (
                        <div className="animate-in fade-in duration-150">
                          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                            Tổng Cơ Cấu
                          </span>
                          <span className="font-mono text-sm sm:text-base font-bold text-stone-900 block leading-tight mt-0.5">
                            {formatVND(totalCategoryRevenue)}
                          </span>
                          <span className="text-[10px] text-stone-500 block mt-0.5">
                            {totalCategoryQuantity > 0 ? `${totalCategoryQuantity} bó hoa` : 'Chờ đơn hàng'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Segment List & Legend */}
                  <div className="flex-1 w-full space-y-2">
                    {categorySegments.map((seg, idx) => {
                      const isHovered = hoveredCategoryIndex === idx;
                      return (
                        <div
                          key={seg.id}
                          onMouseEnter={() => setHoveredCategoryIndex(idx)}
                          onMouseLeave={() => setHoveredCategoryIndex(null)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                            isHovered
                              ? 'bg-rose-50/70 border-rose-300 shadow-2xs scale-[1.01]'
                              : 'bg-stone-50/70 hover:bg-stone-50 border-stone-200/70'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-2xs transition-transform"
                              style={{
                                backgroundColor: seg.hex,
                                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                              }}
                            />
                            <div className="min-w-0">
                              <span className="font-semibold text-stone-800 block truncate">
                                {seg.name}
                              </span>
                              <span className="text-[10px] text-stone-500 block">
                                {seg.priceRange} · {seg.quantity} bó
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-2">
                            <span className="font-mono font-bold text-stone-900 block text-xs">
                              {formatVND(seg.amount)}
                            </span>
                            <span className="text-[11px] font-bold text-rose-800">
                              {seg.share}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* View 2: Horizontal Bars (Thanh Ngang) */}
              {categoryChartView === 'bars' && (
                <div className="space-y-3.5 pt-1">
                  {categorySegments.map((seg, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.hex }} />
                          <span className="font-medium text-stone-700">{seg.name} ({seg.priceRange})</span>
                        </div>
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
              )}
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShoppingBag,
  Bell,
  Mail,
  User as UserIcon,
  FlaskConical,
  Menu,
  X,
  ArrowRight,
  MapPin,
  Tag,
  Phone,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  UserCheck,
  ChevronDown,
  Store,
} from 'lucide-react';
import { useStore } from '../store';
import { Role } from '../types';

export const Navbar: React.FC = () => {
  const { state, dispatch, totalQuantity, unreadNotifsCount } = useStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const gmailCount = state.gmailEmails.length;

  const handleRoleSelect = (role: Role) => {
    dispatch({ type: 'SET_CURRENT_ROLE', payload: role });
    setIsRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF5F7]/95 backdrop-blur-md border-b border-rose-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-rose-950 hover:bg-rose-100/60 rounded-lg transition-colors cursor-pointer"
          title="Menu điều hướng"
          aria-label="Menu điều hướng"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xl sm:text-2xl font-display font-medium tracking-tight text-rose-950 whitespace-nowrap shrink-0 hover:text-rose-700 transition-colors flex items-center gap-2 cursor-pointer text-left"
          >
            <span className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-serif text-base shadow-xs shrink-0">
              R
            </span>
            <span className="flex flex-col">
              <span className="font-serif leading-none">Rose Flowers</span>
              <span className="text-[10px] tracking-wider uppercase font-sans text-stone-500 font-normal">
                Tiệm Hoa Sáp Cao Cấp
              </span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Adaptive per View) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs sm:text-sm font-medium text-stone-700">
          {state.activeView === 'storefront' ? (
            <>
              <a href="#collection" className="hover:text-rose-900 transition-colors whitespace-nowrap">
                Bộ Sưu Tập Hoa
              </a>
              <a href="#vouchers" className="hover:text-rose-900 transition-colors whitespace-nowrap">
                Ưu Đãi Dịp Lễ
              </a>
              <a href="#craft" className="hover:text-rose-900 transition-colors whitespace-nowrap">
                Đặc Tính Hoa Sáp
              </a>
              <a href="#branches" className="hover:text-rose-900 transition-colors whitespace-nowrap">
                Chi Nhánh 294 Phạm Văn Bạch
              </a>
              <button
                onClick={() => {
                  if (state.orders.length > 0) {
                    dispatch({ type: 'SET_TRACKING_ORDER_ID', payload: state.orders[0].id });
                  } else {
                    dispatch({
                      type: 'SHOW_TOAST',
                      payload: { message: 'Chưa có đơn hàng nào cần tra cứu. Hãy chọn bó hoa sáp ưng ý ngay!', type: 'info' },
                    });
                  }
                }}
                className="hover:text-rose-900 transition-colors whitespace-nowrap cursor-pointer text-stone-700"
              >
                Tra Cứu Đơn
              </button>

              {/* Quick links to Staff & Admin views for pair-programming & evaluation */}
              <button
                onClick={() => {
                  dispatch({ type: 'SET_CURRENT_ROLE', payload: 'STAFF' });
                  dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'staff' });
                }}
                className="px-2.5 py-1 rounded-md text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 transition-colors cursor-pointer border border-rose-300"
                title="Chuyển sang Bảng Kanban của Nhân viên tư vấn & Florist"
              >
                Kanban Florist
              </button>

              <button
                onClick={() => {
                  dispatch({ type: 'SET_CURRENT_ROLE', payload: 'ADMIN' });
                  dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'admin' });
                }}
                className="px-2.5 py-1 rounded-md text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 transition-colors cursor-pointer border border-amber-300"
                title="Chuyển sang Bảng điều khiển Quản lý Admin"
              >
                Admin Tiệm
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-900 bg-white hover:bg-rose-100/60 rounded-lg border border-rose-300 transition-colors cursor-pointer shadow-2xs"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Quay lại Trang Cửa Hàng</span>
              </button>

              {state.activeView === 'staff' && (
                <span className="text-xs font-medium text-stone-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                  Đang xem: <strong>Staff Order Kanban Board</strong>
                </span>
              )}

              {state.activeView === 'admin' && (
                <span className="text-xs font-medium text-stone-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  Đang xem: <strong>Admin Dashboard & Managers</strong>
                </span>
              )}
            </div>
          )}
        </nav>

        {/* Zone 3: Actions Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* RBAC Role Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-2xs bg-white text-stone-800 border-rose-300 hover:bg-rose-50"
              title="Chuyển đổi vai trò người dùng (CUSTOMER, STAFF, ADMIN)"
            >
              {state.currentRole === 'ADMIN' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              ) : state.currentRole === 'STAFF' ? (
                <UserCheck className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span className="hidden sm:inline">Role:</span>
              <span className="font-bold text-rose-900">{state.currentRole}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-stone-400 px-2 py-1 block">
                  Chọn vai trò trải nghiệm:
                </span>
                <button
                  onClick={() => handleRoleSelect('CUSTOMER')}
                  className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    state.currentRole === 'CUSTOMER' ? 'bg-rose-50 text-rose-950 font-bold' : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                    Khách Hàng (CUSTOMER)
                  </span>
                  {state.currentRole === 'CUSTOMER' && <span className="w-2 h-2 rounded-full bg-rose-600" />}
                </button>

                <button
                  onClick={() => handleRoleSelect('STAFF')}
                  className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    state.currentRole === 'STAFF' ? 'bg-rose-50 text-rose-950 font-bold' : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-rose-600" />
                    Florist (STAFF)
                  </span>
                  {state.currentRole === 'STAFF' && <span className="w-2 h-2 rounded-full bg-rose-600" />}
                </button>

                <button
                  onClick={() => handleRoleSelect('ADMIN')}
                  className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    state.currentRole === 'ADMIN' ? 'bg-rose-50 text-rose-950 font-bold' : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    Quản Lý Tiệm (ADMIN)
                  </span>
                  {state.currentRole === 'ADMIN' && <span className="w-2 h-2 rounded-full bg-rose-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Unit Test Runner Suite Trigger */}
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isTestRunnerOpen', isOpen: true } })}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 rounded-lg transition-colors cursor-pointer border border-stone-200 shadow-2xs"
            title="Quy trình kiểm thử đơn vị tự động (Unit Tests)"
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-700" />
            <span className="whitespace-nowrap">Unit Tests</span>
          </button>

          {/* Simulated Gmail Order Confirmation Inbox */}
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isGmailOpen', isOpen: true } })}
            className="relative p-2 text-stone-700 hover:text-stone-950 hover:bg-rose-100/60 rounded-full transition-colors cursor-pointer"
            title="Hộp thư Gmail xác nhận đơn hàng"
            aria-label="Hộp thư Gmail"
          >
            <Mail className="w-5 h-5 text-rose-900" />
            {gmailCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {gmailCount}
              </span>
            )}
          </button>

          {/* Real-time Push Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-stone-700 hover:text-stone-950 hover:bg-rose-100/60 rounded-full transition-colors cursor-pointer"
              title="Thông báo đẩy trạng thái đơn hàng"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5 text-rose-900" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h4 className="font-semibold text-stone-900 text-sm">Thông Báo Trực Tuyến</h4>
                  <button
                    onClick={() => {
                      dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
                      setIsNotifOpen(false);
                    }}
                    className="text-xs text-rose-700 hover:underline cursor-pointer"
                  >
                    Đã đọc tất cả
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 mt-2">
                  {state.notifications.length === 0 ? (
                    <p className="text-xs text-stone-500 py-4 text-center">Không có thông báo mới</p>
                  ) : (
                    state.notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`py-2.5 px-2 rounded-lg transition-colors cursor-pointer ${
                          n.read ? 'hover:bg-stone-50' : 'bg-rose-50/50 hover:bg-rose-50'
                        }`}
                        onClick={() => {
                          if (n.orderId) {
                            dispatch({ type: 'SET_TRACKING_ORDER_ID', payload: n.orderId });
                            setIsNotifOpen(false);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-stone-900">{n.title}</p>
                          <span className="text-[10px] text-stone-400 whitespace-nowrap">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account Button (Google Login) */}
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthOpen', isOpen: true } })}
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-stone-700 hover:text-stone-950 hover:bg-rose-100/60 rounded-full sm:rounded-lg transition-colors cursor-pointer text-xs font-medium border border-transparent sm:border-rose-200 bg-white"
            title={state.user ? `Tài khoản: ${state.user.name}` : 'Đăng nhập Google'}
          >
            {state.user ? (
              <>
                <img
                  src={state.user.avatarUrl}
                  alt={state.user.name}
                  className="w-6 h-6 rounded-full object-cover border border-rose-300"
                />
                <span className="hidden sm:inline font-medium max-w-[90px] truncate">{state.user.name}</span>
              </>
            ) : (
              <>
                <UserIcon className="w-5 h-5 text-rose-900" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </>
            )}
          </button>

          {/* Shopping Cart Bag (Primary Action) */}
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCartOpen', isOpen: true } })}
            className="relative flex items-center justify-center p-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-full transition-transform active:scale-95 cursor-pointer shadow-sm mr-1"
            title="Xem giỏ hàng"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-rose-900 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-rose-200">
                {totalQuantity}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-rose-200 shadow-xl px-4 py-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-1.5 text-sm font-medium text-stone-800">
            <button
              onClick={() => {
                dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' });
                setIsMobileMenuOpen(false);
              }}
              className="p-3 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-between text-left"
            >
              <span>Trang Cửa Hàng & Bộ Sưu Tập</span>
              <Store className="w-4 h-4 text-rose-700" />
            </button>

            <button
              onClick={() => {
                dispatch({ type: 'SET_CURRENT_ROLE', payload: 'STAFF' });
                dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'staff' });
                setIsMobileMenuOpen(false);
              }}
              className="p-3 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-between text-left font-semibold text-rose-900"
            >
              <span>Bảng Kanban Florist (Staff)</span>
              <LayoutDashboard className="w-4 h-4 text-rose-700" />
            </button>

            <button
              onClick={() => {
                dispatch({ type: 'SET_CURRENT_ROLE', payload: 'ADMIN' });
                dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'admin' });
                setIsMobileMenuOpen(false);
              }}
              className="p-3 hover:bg-amber-50 rounded-xl transition-colors flex items-center justify-between text-left font-semibold text-amber-900"
            >
              <span>Admin Portal Quản Trị Tiệm</span>
              <ShieldCheck className="w-4 h-4 text-amber-700" />
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                dispatch({ type: 'SET_MODAL', payload: { modal: 'isTestRunnerOpen', isOpen: true } });
              }}
              className="p-3 hover:bg-rose-50 rounded-xl transition-colors text-left flex items-center justify-between cursor-pointer text-xs font-semibold text-emerald-800"
            >
              <span className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-700" />
                Kiểm Thử Đơn Vị Tự Động (Unit Tests)
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-stone-600">
            <span>Hotline/Zalo: <strong>0888 208 306</strong></span>
            <span>294 Phạm Văn Bạch, TP.HCM</span>
          </div>
        </div>
      )}
    </header>
  );
};

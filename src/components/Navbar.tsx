/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Bell,
  User as UserIcon,
  Menu,
  X,
  MapPin,
  Tag,
  Phone,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  Store,
  Truck,
} from 'lucide-react';
import { useStore } from '../store';

export const Navbar: React.FC = () => {
  const { state, dispatch, totalQuantity, unreadNotifsCount, relevantNotifications } = useStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartBumping, setIsCartBumping] = useState(false);

  useEffect(() => {
    if (state.lastCartAddedAt) {
      setIsCartBumping(true);
      const timer = setTimeout(() => setIsCartBumping(false), 950);
      return () => clearTimeout(timer);
    }
  }, [state.lastCartAddedAt]);

  const pendingTransfersCount = useMemo(() => {
    return state.orders.filter(
      (o) => o.paymentStatus === 'UNPAID' || o.orderStatus === 'PENDING'
    ).length;
  }, [state.orders]);

  const navigateToSection = (hash: string) => {
    if (state.activeView !== 'storefront') {
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' });
    }
    if (state.selectedFlower) {
      dispatch({ type: 'SELECT_FLOWER', payload: null });
    }
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/${hash}`);
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF5F7]/95 backdrop-blur-md border-b border-rose-200/70 transform-gpu will-change-transform">
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
              if (state.selectedFlower) {
                dispatch({ type: 'SELECT_FLOWER', payload: null });
              }
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
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

        {/* Zone 2: Navigation Links (Clean, Centered, Symmetrical) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-stone-700">
          <a
            href="/#collection"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('#collection');
            }}
            className="hover:text-rose-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            Bộ Sưu Tập Hoa
          </a>
          <a
            href="/#vouchers"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('#vouchers');
            }}
            className="hover:text-rose-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            Ưu Đãi Dịp Lễ
          </a>
          <a
            href="/#craft"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('#craft');
            }}
            className="hover:text-rose-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            Đặc Tính Hoa Sáp
          </a>
          <a
            href="/#branches"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('#branches');
            }}
            className="hover:text-rose-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            Chi Nhánh 294 Phạm Văn Bạch
          </a>
        </nav>

        {/* Zone 3: Actions Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Executive Role Switcher: Role ADMIN */}
          {state.currentRole === 'ADMIN' && (
            state.activeView !== 'admin' ? (
              <button
                onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'admin' })}
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 active:scale-95 rounded-xl border border-amber-300/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap"
                title="Mở Bảng Điều Hành Quản Trị Hệ Thống"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Bảng Điều Hành Admin</span>
                {pendingTransfersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                )}
              </button>
            ) : (
              <button
                onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' })}
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-rose-950 bg-rose-100 hover:bg-rose-200 active:scale-95 rounded-xl border border-rose-300/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap"
                title="Quay lại giao diện mua sắm cửa hàng"
              >
                <Store className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Về Trang Cửa Hàng</span>
              </button>
            )
          )}

          {/* Executive Role Switcher: Role STAFF */}
          {state.currentRole === 'STAFF' && (
            state.activeView !== 'staff' ? (
              <button
                onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'staff' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-rose-950 bg-rose-100 hover:bg-rose-200 active:scale-95 rounded-xl border border-rose-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap"
                title="Bảng Kanban điều phối cắm hoa"
              >
                <LayoutDashboard className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Kanban Florist</span>
              </button>
            ) : (
              <button
                onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-rose-950 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-xl border border-rose-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                title="Quay lại giao diện mua sắm cửa hàng"
              >
                <Store className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Về Trang Cửa Hàng</span>
              </button>
            )
          )}

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
              <>
                {/* Backdrop to close when clicking outside */}
                <div
                  className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
                  onClick={() => setIsNotifOpen(false)}
                />
                <div className="fixed left-3 right-3 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 max-w-[calc(100vw-24px)] bg-white rounded-2xl sm:rounded-xl shadow-2xl sm:shadow-xl border border-stone-200 p-3.5 sm:p-4 z-50 animate-in fade-in zoom-in-95 sm:zoom-in-100 slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <h4 className="font-semibold text-stone-900 text-sm">Thông Báo Trực Tuyến</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          dispatch({
                            type: 'MARK_NOTIFICATIONS_READ',
                            payload: relevantNotifications.map((n) => n.id),
                          });
                          setIsNotifOpen(false);
                        }}
                        className="text-xs text-rose-700 hover:underline cursor-pointer"
                      >
                        Đã đọc tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsNotifOpen(false)}
                        className="sm:hidden p-1 text-stone-400 hover:text-stone-700 rounded-md cursor-pointer"
                        aria-label="Đóng"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[60vh] sm:max-h-72 overflow-y-auto divide-y divide-stone-100 mt-2">
                    {relevantNotifications.length === 0 ? (
                      <p className="text-xs text-stone-500 py-4 text-center">Không có thông báo mới</p>
                    ) : (
                      relevantNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`py-2.5 px-2 rounded-lg transition-colors cursor-pointer ${
                            n.read ? 'hover:bg-stone-50' : 'bg-rose-50/50 hover:bg-rose-50'
                          }`}
                          onClick={() => {
                            if (n.orderId) {
                              dispatch({ type: 'SET_TRACKING_ORDER_ID', payload: n.orderId });
                              setIsNotifOpen(false);
                            } else if (n.type === 'promo') {
                              dispatch({
                                type: 'SHOW_TOAST',
                                payload: { message: 'Mã ưu đãi ROSE10 (giảm 10%) đã được lưu trong giỏ hàng của bạn!', type: 'success' },
                              });
                              setIsNotifOpen(false);
                            } else {
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
              </>
            )}
          </div>

          {/* User Account Button & Quick Settings */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => {
                if (state.user) {
                  dispatch({ type: 'SET_MODAL', payload: { modal: 'isAccountSettingsOpen', isOpen: true } });
                } else {
                  dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthOpen', isOpen: true } });
                }
              }}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-stone-700 hover:text-stone-950 hover:bg-rose-100/60 rounded-full sm:rounded-lg transition-colors cursor-pointer text-xs font-medium border border-transparent sm:border-rose-200 bg-white shadow-2xs"
              title={state.user ? `Tài khoản: ${state.user.name}` : 'Đăng nhập / Đăng ký tài khoản'}
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
          </div>

          {/* Shopping Cart Bag (Chỉ hiển thị cho Khách và Staff, Role Admin không có giỏ hoa) */}
          {state.currentRole !== 'ADMIN' && (
            <button
              onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCartOpen', isOpen: true } })}
              className={`relative flex items-center justify-center p-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-full transition-all active:scale-95 cursor-pointer shadow-sm mr-1 ${
                isCartBumping ? 'cart-bump ring-4 ring-rose-300 scale-105' : ''
              }`}
              title="Xem giỏ hoa của bạn"
              aria-label="Giỏ hoa của bạn"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalQuantity > 0 && (
                <span
                  key={totalQuantity}
                  className={`absolute -top-1 -right-1 bg-white text-rose-900 text-[11px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-md border border-rose-200 transition-transform ${
                    isCartBumping ? 'badge-pop ring-2 ring-rose-400' : ''
                  }`}
                >
                  {totalQuantity}
                </span>
              )}
              {isCartBumping && (
                <span className="absolute -bottom-7 right-0 bg-rose-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md fly-item-anim pointer-events-none whitespace-nowrap z-50">
                  +1 Giỏ hoa 🌹
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-20 bg-stone-950/40 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative z-40 lg:hidden bg-white border-b border-rose-200 shadow-2xl px-4 py-4 sm:py-5 space-y-3.5 max-h-[calc(100dvh-5rem)] overflow-y-auto animate-in slide-in-from-top-3 duration-200">
            <div className="flex flex-col space-y-1 text-sm font-medium text-stone-800">
              <button
                onClick={() => {
                  dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' });
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/');
                  }
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-3 rounded-xl transition-colors flex items-center justify-between text-left cursor-pointer ${
                  state.activeView === 'storefront'
                    ? 'bg-rose-50 text-rose-950 font-bold border border-rose-200/80 shadow-2xs'
                    : 'hover:bg-rose-50/60 text-stone-700'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-rose-700" />
                  <span>Trang Cửa Hàng &amp; Bộ Sưu Tập</span>
                </span>
                {state.activeView === 'storefront' && (
                  <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded-full">
                    Đang xem
                  </span>
                )}
              </button>

              {/* Quick Anchor Shortcuts */}
              <a
                href="#collection"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 hover:bg-rose-50/60 rounded-xl transition-colors flex items-center justify-between text-left text-stone-700 text-xs sm:text-sm font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <span>Bộ sưu tập 78 mẫu hoa sáp</span>
                </span>
                <span className="text-[11px] text-stone-400">#collection</span>
              </a>

              <a
                href="#vouchers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 hover:bg-rose-50/60 rounded-xl transition-colors flex items-center justify-between text-left text-stone-700 text-xs sm:text-sm font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-rose-600" />
                  <span>Mã giảm giá &amp; Ưu đãi lễ</span>
                </span>
                <span className="text-[11px] text-stone-400">#vouchers</span>
              </a>

              <a
                href="#branches"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 hover:bg-rose-50/60 rounded-xl transition-colors flex items-center justify-between text-left text-stone-700 text-xs sm:text-sm font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>Chi nhánh &amp; Bản đồ giao hỏa tốc</span>
                </span>
                <span className="text-[11px] text-stone-400">#branches</span>
              </a>

              {state.currentRole === 'STAFF' && (
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'staff' });
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-xl transition-colors flex items-center justify-between text-left font-semibold cursor-pointer ${
                    state.activeView === 'staff'
                      ? 'bg-rose-100 text-rose-950 font-bold border border-rose-300 shadow-2xs'
                      : 'hover:bg-rose-50 text-rose-900 bg-rose-50/40'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-rose-700" />
                    <span>Bảng Kanban Florist (Staff)</span>
                  </span>
                  <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">STAFF</span>
                </button>
              )}

              {state.currentRole === 'ADMIN' && (
                <button
                  onClick={() => {
                    dispatch({
                      type: 'SET_ACTIVE_VIEW',
                      payload: state.activeView === 'admin' ? 'storefront' : 'admin',
                    });
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-xl transition-colors flex items-center justify-between text-left font-semibold cursor-pointer ${
                    state.activeView === 'admin'
                      ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300 shadow-2xs'
                      : 'hover:bg-amber-50 text-amber-900 bg-amber-50/40'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {state.activeView === 'admin' ? (
                      <>
                        <Store className="w-4 h-4 text-rose-700" />
                        <span>Về Trang Cửa Hàng</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        <span>Bảng Điều Hành Admin</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">ADMIN</span>
                </button>
              )}
            </div>

            {/* Contact row with clickable links and responsive wrapping */}
            <div className="pt-3 border-t border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-600">
              <a
                href="https://zalo.me/0888208306"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-rose-900 transition-colors py-0.5"
              >
                <Phone className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                <span>Hotline/Zalo: <strong className="font-mono text-stone-900">0888 208 306</strong></span>
              </a>
              <a
                href="#branches"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-1.5 hover:text-rose-900 transition-colors py-0.5"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                <span>294 Phạm Văn Bạch, TP.HCM</span>
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

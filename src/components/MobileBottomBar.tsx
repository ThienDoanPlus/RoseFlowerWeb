/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Flower2, ShoppingBag, LayoutDashboard, ShieldCheck, MessageSquare, Phone, QrCode, Users } from 'lucide-react';
import { useStore } from '../store';

export const MobileBottomBar: React.FC = () => {
  const { state, dispatch, totalQuantity } = useStore();

  // Role ADMIN có thanh điều hướng chuyên biệt phục vụ điều hành, không có giỏ hoa của khách hay chatbot
  if (state.currentRole === 'ADMIN') {
    const pendingTransfersCount = state.orders.filter(
      (o) => o.paymentStatus === 'UNPAID' || o.orderStatus === 'PENDING'
    ).length;

    return (
      <nav
        aria-label="Điều hướng nhanh Admin"
        className="md:hidden fixed bottom-0 left-0 right-0 z-35 bg-white/95 backdrop-blur-md border-t border-amber-300 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="grid grid-cols-5 items-center text-center">
          {/* 1. Tổng Quan Dashboard */}
          <button
            onClick={() => {
              dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'admin' });
              dispatch({ type: 'SET_ADMIN_TAB', payload: 'overview' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              state.activeView === 'admin' && state.adminActiveTab === 'overview'
                ? 'text-amber-900 font-bold'
                : 'text-stone-600 hover:text-amber-900'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Tổng Quan</span>
          </button>

          {/* 2. Duyệt Chuyển Khoản VietQR */}
          <button
            onClick={() => {
              dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'admin' });
              dispatch({ type: 'SET_ADMIN_TAB', payload: 'transfers' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
              state.activeView === 'admin' && state.adminActiveTab === 'transfers'
                ? 'text-emerald-900 font-bold'
                : 'text-stone-600 hover:text-emerald-900'
            }`}
          >
            <div className="relative">
              <QrCode className="w-5 h-5" />
              {pendingTransfersCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {pendingTransfersCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Duyệt Tiền</span>
          </button>

          {/* 3. Kho Hoa */}
          <button
            onClick={() => {
              dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'admin' });
              dispatch({ type: 'SET_ADMIN_TAB', payload: 'flowers' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              state.activeView === 'admin' && state.adminActiveTab === 'flowers'
                ? 'text-rose-900 font-bold'
                : 'text-stone-600 hover:text-rose-900'
            }`}
          >
            <Flower2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Kho Hoa</span>
          </button>

          {/* 4. Nhân Sự RBAC */}
          <button
            onClick={() => {
              dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'admin' });
              dispatch({ type: 'SET_ADMIN_TAB', payload: 'users' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              state.activeView === 'admin' && state.adminActiveTab === 'users'
                ? 'text-blue-900 font-bold'
                : 'text-stone-600 hover:text-blue-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Nhân Sự</span>
          </button>

          {/* 5. Cài Đặt */}
          <button
            onClick={() => {
              dispatch({ type: 'SET_MODAL', payload: { modal: 'isAccountSettingsOpen', isOpen: true } });
            }}
            className="flex flex-col items-center justify-center py-1 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            {state.user ? (
              <img
                src={state.user.avatarUrl}
                alt={state.user.name}
                className="w-5 h-5 rounded-full object-cover border border-amber-400"
              />
            ) : (
              <ShieldCheck className="w-5 h-5 text-stone-600" />
            )}
            <span className="text-[10px] font-medium mt-0.5">Cài Đặt</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Điều hướng nhanh di động"
      className="md:hidden fixed bottom-0 left-0 right-0 z-35 bg-white/95 backdrop-blur-md border-t border-rose-200/80 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-5 items-center text-center">
        {/* 1. Home / Storefront */}
        <button
          onClick={() => {
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' });
            if (state.selectedFlower) {
              dispatch({ type: 'SELECT_FLOWER', payload: null });
            }
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            state.activeView === 'storefront' ? 'text-rose-900 font-bold' : 'text-stone-600 hover:text-rose-900'
          }`}
        >
          <Home className={`w-5 h-5 ${state.activeView === 'storefront' ? 'text-rose-900' : 'text-stone-600'}`} />
          <span className="text-[10px] mt-0.5">Cửa Hàng</span>
        </button>

        {/* 2. Slot 2: Staff Kanban (nếu là Staff) hoặc Danh mục hoa (nếu là Khách) */}
        {state.currentRole === 'STAFF' ? (
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'staff' })}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              state.activeView === 'staff' ? 'text-rose-900 font-bold' : 'text-stone-600 hover:text-rose-900'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${state.activeView === 'staff' ? 'text-rose-900' : 'text-stone-600'}`} />
            <span className="text-[10px] mt-0.5">Kanban</span>
          </button>
        ) : (
          <a
            href="/#collection"
            onClick={() => {
              if (state.activeView === 'product-detail') {
                dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' });
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/#collection');
                }
              } else if (state.selectedFlower) {
                dispatch({ type: 'SELECT_FLOWER', payload: null });
              }
            }}
            className="flex flex-col items-center justify-center py-1 text-stone-600 hover:text-rose-900 transition-colors"
          >
            <Flower2 className="w-5 h-5 text-stone-600" />
            <span className="text-[10px] mt-0.5">Mẫu Hoa</span>
          </a>
        )}

        {/* 3. Shopping Cart Bag */}
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCartOpen', isOpen: true } })}
          className="flex flex-col items-center justify-center py-1 text-stone-600 hover:text-rose-900 transition-colors relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-stone-600" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalQuantity}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-0.5">Giỏ hàng</span>
        </button>

        {/* 4. Slot 4: Tư vấn Chatbot */}
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCustomerChatOpen', isOpen: true } })}
          className="flex flex-col items-center justify-center py-1 text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 text-rose-700" />
          <span className="text-[10px] font-medium mt-0.5">Tư vấn</span>
        </button>

        {/* 5. User Account / Login */}
        <button
          onClick={() => {
            if (state.user) {
              dispatch({ type: 'SET_MODAL', payload: { modal: 'isAccountSettingsOpen', isOpen: true } });
            } else {
              dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthOpen', isOpen: true } });
            }
          }}
          className="flex flex-col items-center justify-center py-1 text-stone-600 hover:text-rose-900 transition-colors cursor-pointer"
        >
          {state.user ? (
            <img
              src={state.user.avatarUrl}
              alt={state.user.name}
              className="w-5 h-5 rounded-full object-cover border border-rose-300"
            />
          ) : (
            <Phone className="w-5 h-5 text-stone-600" />
          )}
          <span className="text-[10px] font-medium mt-0.5">
            {state.user ? (state.currentRole === 'STAFF' ? 'Florist' : 'Tôi') : 'Đăng nhập'}
          </span>
        </button>
      </div>

    </nav>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Flower2, ShoppingBag, LayoutDashboard, ShieldCheck, MessageSquare, Phone } from 'lucide-react';
import { useStore } from '../store';

export const MobileBottomBar: React.FC = () => {
  const { state, dispatch, totalQuantity } = useStore();

  return (
    <nav
      aria-label="Điều hướng nhanh di động"
      className="md:hidden fixed bottom-0 left-0 right-0 z-35 bg-white/95 backdrop-blur-md border-t border-rose-200/80 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-5 items-center text-center">
        {/* Home / Storefront */}
        <button
          onClick={() => {
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            state.activeView === 'storefront' ? 'text-rose-900 font-bold' : 'text-stone-600 hover:text-rose-900'
          }`}
        >
          <Home className={`w-5 h-5 ${state.activeView === 'storefront' ? 'text-rose-900' : 'text-stone-600'}`} />
          <span className="text-[10px] mt-0.5">Cửa Hàng</span>
        </button>

        {/* Staff Kanban Board */}
        <button
          onClick={() => {
            dispatch({ type: 'SET_CURRENT_ROLE', payload: 'STAFF' });
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'staff' });
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            state.activeView === 'staff' ? 'text-rose-900 font-bold' : 'text-stone-600 hover:text-rose-900'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${state.activeView === 'staff' ? 'text-rose-900' : 'text-stone-600'}`} />
          <span className="text-[10px] mt-0.5">Kanban Florist</span>
        </button>

        {/* Shopping Cart Bag */}
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

        {/* Admin Dashboard */}
        <button
          onClick={() => {
            dispatch({ type: 'SET_CURRENT_ROLE', payload: 'ADMIN' });
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'admin' });
          }}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            state.activeView === 'admin' ? 'text-rose-900 font-bold' : 'text-stone-600 hover:text-rose-900'
          }`}
        >
          <ShieldCheck className={`w-5 h-5 ${state.activeView === 'admin' ? 'text-rose-900' : 'text-stone-600'}`} />
          <span className="text-[10px] mt-0.5">Admin Tiệm</span>
        </button>

        {/* Live Chat */}
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCustomerChatOpen', isOpen: true } })}
          className="flex flex-col items-center justify-center py-1 text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 text-rose-700" />
          <span className="text-[10px] font-medium mt-0.5">Tư vấn</span>
        </button>
      </div>
    </nav>
  );
};

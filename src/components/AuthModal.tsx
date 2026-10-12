/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, LogOut, CheckCircle2, User as UserIcon, Shield, Package } from 'lucide-react';
import { useStore } from '../store';
import { FlowerAPI } from '../services/api';
import { formatVND } from '../utils/calculations';

export const AuthModal: React.FC = () => {
  const { state, dispatch } = useStore();
  const [customEmail, setCustomEmail] = useState('nguyenthiendoan2@gmail.com');
  const [isLoading, setIsLoading] = useState(false);

  if (!state.isAuthOpen) return null;

  const handleGoogleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    const res = await FlowerAPI.loginWithGoogle(customEmail);
    dispatch({ type: 'LOGIN_USER', payload: res.data });
    setIsLoading(false);
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT_USER' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
        
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthOpen', isOpen: false } })}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {state.user ? (
          /* Profile view */
          <div className="space-y-6">
            <div className="text-center">
              <img
                src={state.user.avatarUrl}
                alt={state.user.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-stone-900 shadow-md"
              />
              <h3 className="font-display font-medium text-xl text-stone-900">{state.user.name}</h3>
              <p className="text-xs text-stone-500 font-mono mt-0.5">{state.user.email}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-2 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Tài khoản Google đã xác thực
              </span>
            </div>

            {/* Saved info */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Số điện thoại:</span>
                <span className="font-medium text-stone-900">{state.user.phone || '0908 123 456'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Địa chỉ mặc định:</span>
                <span className="font-medium text-stone-900 text-right max-w-[200px] truncate">
                  {state.user.savedAddress}
                </span>
              </div>
            </div>

            {/* Order history count */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-stone-700" />
                <span className="text-stone-700">Đơn hàng đã đặt:</span>
              </div>
              <span className="font-mono font-bold text-stone-900">{state.orders.length} đơn</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        ) : (
          /* Sign-in form */
          <div className="text-center space-y-6">
            <div>
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-3">
                <UserIcon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-medium text-2xl text-stone-900 mb-1">
                Đăng Nhập / Đăng Ký
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Đăng nhập bằng tài khoản Google/Gmail để theo dõi đơn hàng và nhận ưu đãi riêng.
              </p>
            </div>

            {/* Fast Google Login Button */}
            <button
              onClick={() => handleGoogleLogin()}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-xl font-semibold text-xs transition-all shadow-2xs flex items-center justify-center gap-3 cursor-pointer"
            >
              {/* Google official SVG logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Đang xác thực...' : 'Tiếp tục với Google (nguyenthiendoan2@gmail.com)'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-stone-400 absolute">hoặc email khác</span>
            </div>

            <form onSubmit={handleGoogleLogin} className="space-y-3">
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="nhap-email-cua-ban@gmail.com"
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Đăng nhập với email này
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  LogOut,
  CheckCircle2,
  User as UserIcon,
  Shield,
  ShieldCheck,
  Package,
  Lock,
  Mail,
  Store,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../store';
import { FlowerAPI } from '../services/api';

export const AuthModal: React.FC = () => {
  const { state, dispatch } = useStore();
  const [email, setEmail] = useState('admin@roseflowers.vn');
  const [password, setPassword] = useState('Admin@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!state.isAuthOpen) return null;

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const targetEmail = loginEmail || email;
    const targetPassword = loginPassword !== undefined ? loginPassword : password;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await FlowerAPI.login(targetEmail, targetPassword);
      dispatch({ type: 'LOGIN_USER', payload: res.data });
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAccountSelect = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    handleLogin(accEmail, accPass);
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
                src={state.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={state.user.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-stone-900 shadow-md"
              />
              <h3 className="font-display font-medium text-xl text-stone-900">{state.user.name}</h3>
              <p className="text-xs text-stone-500 font-mono mt-0.5">{state.user.email}</p>
              
              <div className="mt-3 flex items-center justify-center gap-2">
                {state.user.role === 'ADMIN' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    Quản Lý Tiệm (ADMIN)
                  </span>
                ) : state.user.role === 'STAFF' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-900 bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                    <LayoutDashboard className="w-3.5 h-3.5 text-rose-700" />
                    Thợ Cắm Hoa / Florist (STAFF)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
                    <UserIcon className="w-3.5 h-3.5 text-blue-700" />
                    Khách Hàng (CUSTOMER)
                  </span>
                )}
              </div>
            </div>

            {/* Role Navigation Shortcuts */}
            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200 text-xs space-y-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase block tracking-wider">
                Giao diện được phân quyền truy cập:
              </span>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' });
                    dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthOpen', isOpen: false } });
                  }}
                  className={`w-full p-2 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    state.activeView === 'storefront' ? 'bg-rose-100 text-rose-950 font-bold' : 'hover:bg-stone-200/50 text-stone-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-rose-700" />
                    Trang Cửa Hàng & Mua Sắm
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {(state.user.role === 'STAFF' || state.user.role === 'ADMIN') && (
                  <button
                    onClick={() => {
                      dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'staff' });
                      dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthOpen', isOpen: false } });
                    }}
                    className={`w-full p-2 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      state.activeView === 'staff' ? 'bg-rose-100 text-rose-950 font-bold' : 'hover:bg-stone-200/50 text-stone-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-rose-700" />
                      Bảng Kanban Florist (Điều Phối Đơn)
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {state.user.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'admin' });
                      dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthOpen', isOpen: false } });
                    }}
                    className={`w-full p-2 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      state.activeView === 'admin' ? 'bg-amber-100 text-amber-950 font-bold' : 'hover:bg-stone-200/50 text-stone-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      Bảng Điều Khiển Quản Lý (Admin Portal)
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        ) : (
          /* Sign-in form */
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-2.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-medium text-2xl text-stone-900">
                Đăng Nhập Hệ Thống
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                Đăng nhập bằng tài khoản để hệ thống tự động chuyển vào đúng giao diện phân quyền tương ứng.
              </p>
            </div>

            {/* Quick Demo Accounts Selector */}
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Chọn tài khoản đăng nhập mẫu:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickAccountSelect('admin@roseflowers.vn', 'Admin@123')}
                  className="w-full p-2 text-left rounded-lg bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 transition-colors flex items-center justify-between text-xs cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      Quản Lý (ADMIN)
                    </span>
                    <span className="text-[10px] text-amber-800 font-mono block">admin@roseflowers.vn · Admin@123</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">Vào Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAccountSelect('florist.mai@roseflowers.vn', 'Staff@123')}
                  className="w-full p-2 text-left rounded-lg bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 transition-colors flex items-center justify-between text-xs cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-rose-950 flex items-center gap-1.5">
                      <LayoutDashboard className="w-3.5 h-3.5 text-rose-700" />
                      Thợ Cắm Hoa (STAFF)
                    </span>
                    <span className="text-[10px] text-rose-800 font-mono block">florist.mai@roseflowers.vn · Staff@123</span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-900 bg-rose-200/70 px-2 py-0.5 rounded">Vào Kanban</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAccountSelect('nguyenthiendoan2@gmail.com', 'Customer@123')}
                  className="w-full p-2 text-left rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors flex items-center justify-between text-xs cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                      Khách Hàng (CUSTOMER)
                    </span>
                    <span className="text-[10px] text-stone-600 font-mono block">nguyenthiendoan2@gmail.com</span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-700 bg-stone-200 px-2 py-0.5 rounded">Cửa hàng</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {errorMessage}
              </div>
            )}

            {/* Direct Login Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">Email đăng nhập</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

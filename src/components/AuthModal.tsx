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
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Store,
  LayoutDashboard,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useStore } from '../store';
import { FlowerAPI } from '../services/api';

type AuthTab = 'login' | 'register';

export const AuthModal: React.FC = () => {
  const { state, dispatch } = useStore();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Social linking dialog state (when user clicks Google or Facebook)
  const [socialModal, setSocialModal] = useState<{
    isOpen: boolean;
    provider: 'google' | 'facebook';
    email: string;
    name: string;
  } | null>(null);

  if (!state.isAuthOpen) return null;

  const handleClose = () => {
    dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthOpen', isOpen: false } });
    setErrorMessage('');
    setSuccessMessage('');
    setSocialModal(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await FlowerAPI.login(loginEmail.trim(), loginPassword);
      setSuccessMessage('Đăng nhập thành công!');
      setTimeout(() => {
        dispatch({ type: 'LOGIN_USER', payload: res.data });
      }, 350);
    } catch (err: any) {
      setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail.trim() || !registerPassword.trim() || !fullName.trim()) {
      setErrorMessage('Vui lòng điền họ tên, email và mật khẩu.');
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMessage('Mật khẩu cần tối thiểu 6 ký tự để đảm bảo an toàn.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await FlowerAPI.register({
        email: registerEmail.trim(),
        password: registerPassword,
        fullName: fullName.trim(),
        phone: phoneNumber.trim(),
      });
      setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      setTimeout(() => {
        dispatch({ type: 'LOGIN_USER', payload: res.data });
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialClick = (provider: 'google' | 'facebook') => {
    // If the user already filled an email in the active tab, prefill or use it
    const prefilledEmail = activeTab === 'login' ? loginEmail.trim() : registerEmail.trim();
    const prefilledName = activeTab === 'register' ? fullName.trim() : '';

    if (prefilledEmail && prefilledEmail.includes('@')) {
      // Connect directly using the provided email
      executeSocialAuth(provider, prefilledEmail, prefilledName);
    } else {
      // Open the interactive social linking dialog so user can enter or confirm their Gmail / Facebook email
      setSocialModal({
        isOpen: true,
        provider,
        email: provider === 'google' ? 'nguyenthiendoan2@gmail.com' : 'user.fb@gmail.com',
        name: prefilledName || (provider === 'google' ? 'Nguyễn Thiên Đoan' : 'Khách Hàng Facebook'),
      });
    }
  };

  const executeSocialAuth = async (provider: 'google' | 'facebook', email: string, name?: string) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await FlowerAPI.loginSocial(provider, email, name);
      setSuccessMessage(res.message || 'Xác thực thành công!');
      setTimeout(() => {
        setSocialModal(null);
        dispatch({ type: 'LOGIN_USER', payload: res.data });
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Xác thực tài khoản xã hội không thành công.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT_USER' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-full transition-colors cursor-pointer z-10"
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
                    handleClose();
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
                      handleClose();
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
                      handleClose();
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
          /* Authentication Form (Login & Register) */
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center pt-1">
              <h3 className="font-display font-medium text-2xl text-stone-900">
                Tài Khoản Rose Flowers
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                {activeTab === 'login'
                  ? 'Đăng nhập để theo dõi đơn hoa hoặc quản lý hệ thống.'
                  : 'Tạo tài khoản khách hàng để nhận ưu đãi và tích điểm.'}
              </p>
            </div>

            {/* Tabs switcher: Đăng nhập / Đăng ký */}
            <div className="flex p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Đăng Ký Tài Khoản
              </button>
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Email đăng nhập
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-medium text-stone-700">
                      Mật khẩu
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs pl-9 pr-9 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <span>Đăng Nhập</span>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                    Email tài khoản
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0901 234 567"
                      className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="≥ 6 ký tự"
                        className="w-full text-xs pl-8 pr-2 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                      Nhập lại mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại"
                        className="w-full text-xs pl-8 pr-2 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 py-2.5 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang tạo tài khoản...</span>
                    </>
                  ) : (
                    <span>Tạo Tài Khoản Khách Hàng</span>
                  )}
                </button>
              </form>
            )}

            {/* SOCIAL LOGIN / REGISTRATION SECTION */}
            <div className="pt-2">
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2.5 text-stone-400 font-semibold tracking-wider">
                    Hoặc liên kết nhanh qua
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('google')}
                  disabled={isLoading}
                  className="w-full py-2 px-3 border border-stone-300 hover:bg-stone-50 rounded-lg text-xs font-medium text-stone-700 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>Google</span>
                </button>

                {/* Facebook Button */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('facebook')}
                  disabled={isLoading}
                  className="w-full py-2 px-3 border border-stone-300 hover:bg-stone-50 rounded-lg text-xs font-medium text-stone-700 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            <p className="text-[10px] text-stone-400 text-center pt-2">
              Bằng việc đăng ký hoặc đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Rose Flowers.
            </p>
          </div>
        )}

        {/* INTERACTIVE SOCIAL AUTH DIALOG OVERLAY */}
        {socialModal && socialModal.isOpen && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md p-6 flex flex-col justify-center rounded-2xl z-20 animate-in fade-in duration-150">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-2 shadow-inner">
                {socialModal.provider === 'google' ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                ) : (
                  <svg className="w-6 h-6 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
              </div>
              <h4 className="font-display font-medium text-lg text-stone-900">
                Liên kết {socialModal.provider === 'google' ? 'Google / Gmail' : 'Facebook'}
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                Nhập hoặc xác nhận tài khoản email để hệ thống liên kết và lưu trữ hồ sơ của bạn.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSocialAuth(socialModal.provider, socialModal.email, socialModal.name);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  Địa chỉ Email {socialModal.provider === 'google' ? 'Gmail' : 'Facebook'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={socialModal.email}
                    onChange={(e) =>
                      setSocialModal({ ...socialModal, email: e.target.value })
                    }
                    placeholder={
                      socialModal.provider === 'google'
                        ? 'nguyenthiendoan2@gmail.com'
                        : 'user@facebook.com'
                    }
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  Họ và tên hiển thị
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={socialModal.name}
                    onChange={(e) =>
                      setSocialModal({ ...socialModal, name: e.target.value })
                    }
                    placeholder="Nguyễn Thiên Đoan"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSocialModal(null)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang kết nối...</span>
                    </>
                  ) : (
                    <span>Xác Nhận & Tiếp Tục</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

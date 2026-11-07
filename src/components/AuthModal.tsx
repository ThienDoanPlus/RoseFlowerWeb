/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  Settings,
  Sparkles,
  Check,
} from 'lucide-react';
import { useStore } from '../store';
import { FlowerAPI } from '../services/api';

type AuthTab = 'login' | 'register';

const BLOOMING_PETALS = [
  { left: '6%', top: '12%', size: '1.4rem', duration: 7, delay: 0, rotate: 15, opacity: 0.75, symbol: '🌸' },
  { left: '16%', top: '68%', size: '1.2rem', duration: 8.5, delay: 1.2, rotate: -30, opacity: 0.65, symbol: '🌺' },
  { left: '22%', top: '22%', size: '1.6rem', duration: 9, delay: 0.5, rotate: 45, opacity: 0.7, symbol: '🌸' },
  { left: '32%', top: '82%', size: '1.1rem', duration: 6.8, delay: 2, rotate: -15, opacity: 0.6, symbol: '💮' },
  { left: '74%', top: '18%', size: '1.5rem', duration: 8, delay: 1.5, rotate: 60, opacity: 0.75, symbol: '🌸' },
  { left: '84%', top: '62%', size: '1.3rem', duration: 9.5, delay: 0.8, rotate: -40, opacity: 0.65, symbol: '🌺' },
  { left: '90%', top: '28%', size: '1.7rem', duration: 7.5, delay: 2.5, rotate: 25, opacity: 0.8, symbol: '🌸' },
  { left: '62%', top: '86%', size: '1.2rem', duration: 8.2, delay: 3, rotate: -20, opacity: 0.6, symbol: '💮' },
  { left: '10%', top: '42%', size: '1.3rem', duration: 10, delay: 1, rotate: 35, opacity: 0.65, symbol: '🌸' },
  { left: '82%', top: '10%', size: '1.4rem', duration: 6.5, delay: 0.2, rotate: -50, opacity: 0.75, symbol: '🌺' },
  { left: '4%', top: '88%', size: '1.2rem', duration: 8.8, delay: 2.2, rotate: 20, opacity: 0.55, symbol: '🌸' },
  { left: '94%', top: '82%', size: '1.5rem', duration: 7.8, delay: 1.8, rotate: -35, opacity: 0.7, symbol: '🌸' },
];

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

  // Password criteria checking for registration
  const regMinLength = registerPassword.length >= 8;
  const regHasUpper = /[A-Z]/.test(registerPassword);
  const regHasLower = /[a-z]/.test(registerPassword);
  const regHasNumber = /[0-9]/.test(registerPassword);
  const regHasSpecial = /[^A-Za-z0-9]/.test(registerPassword);
  const isRegPasswordValid = regMinLength && regHasUpper && regHasLower && regHasNumber && regHasSpecial;

  // Phone validation: exactly 10 digits
  const isPhoneValid = (phone: string) => /^\d{10}$/.test(phone.replace(/[\s\-\.]/g, ''));

  if (!state.isAuthOpen) return null;

  const handleClose = () => {
    dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthOpen', isOpen: false } });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const grantWelcomeBonus = () => {
    const welcomeVoucher = state.vouchers.find((v) => v.code === 'ROSE10') || state.vouchers[0];
    if (welcomeVoucher) {
      dispatch({ type: 'APPLY_VOUCHER', payload: welcomeVoucher });
    }

    dispatch({
      type: 'ADD_PUSH_NOTIFICATION',
      payload: {
        id: `notif-${Date.now()}`,
        title: '🎉 Chào Bạn Mới Tiệm Hoa Rose!',
        message: 'Chúc mừng bạn đã gia nhập Rose Flowers. Ưu đãi "Chào Bạn Mới Tiệm Hoa Rose" (Mã: ROSE10) giảm 10% đã được tự động áp dụng cho đơn hàng đầu tiên của bạn!',
        timestamp: 'Vừa xong',
        type: 'promo',
        read: false,
      },
    });
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
    setErrorMessage('');
    setSuccessMessage('');

    if (!registerEmail.trim() || !registerPassword.trim() || !fullName.trim() || !phoneNumber.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ họ tên, số điện thoại, email và mật khẩu.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[\s\-\.]/g, '');
    if (!isPhoneValid(cleanPhone)) {
      setErrorMessage('Số điện thoại không hợp lệ. Số điện thoại phải bao gồm đúng 10 chữ số (VD: 0901234567).');
      return;
    }

    if (!isRegPasswordValid) {
      setErrorMessage('Mật khẩu chưa đáp ứng tiêu chuẩn an toàn (tối thiểu 8 ký tự và kết hợp đủ 4 nhóm: chữ hoa, chữ thường, số, ký tự đặc biệt).');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await FlowerAPI.register({
        email: registerEmail.trim(),
        password: registerPassword,
        fullName: fullName.trim(),
        phone: cleanPhone,
      });

      // Tự động kích hoạt ưu đãi Chào Bạn Mới Tiệm Hoa Rose
      grantWelcomeBonus();

      setSuccessMessage('Đăng ký tài khoản thành công! Tặng bạn ưu đãi "Chào Bạn Mới Tiệm Hoa Rose" (Mã: ROSE10)!');
      setTimeout(() => {
        dispatch({ type: 'LOGIN_USER', payload: res.data });
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT_USER' });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300"
      onClick={handleClose}
    >
      {/* Blooming Rose Arch Background with Motion */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Animated Rose Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform will-change-transform"
          style={{
            backgroundImage: `url('/images/auth-blooming-roses-bg.jpg')`,
            animation: 'roseBloomBreathe 14s ease-in-out infinite alternate',
          }}
        />

        {/* Gentle Rose Petal Shimmer / Vignette Overlay for focus on the center heart opening */}
        <div className="absolute inset-0 bg-radial from-transparent via-rose-950/20 to-stone-950/70 backdrop-blur-[1px]" />

        {/* Floating & Blooming Rose Petals Effect */}
        <div className="absolute inset-0 overflow-hidden">
          {BLOOMING_PETALS.map((petal, i) => (
            <span
              key={i}
              className="absolute pointer-events-none select-none"
              style={{
                left: petal.left,
                top: petal.top,
                fontSize: petal.size,
                opacity: petal.opacity,
                animation: `petalBloomFloat ${petal.duration}s ease-in-out ${petal.delay}s infinite alternate`,
                transform: `rotate(${petal.rotate}deg)`,
                filter: 'drop-shadow(0 2px 6px rgba(225, 29, 72, 0.35))',
              }}
            >
              {petal.symbol}
            </span>
          ))}
        </div>
      </div>

      {/* Center Form Card */}
      <div
        className="relative z-10 bg-white/94 sm:bg-white/96 backdrop-blur-xl rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 sm:p-7 shadow-[0_25px_60px_-12px_rgba(225,29,72,0.35)] border border-white/80 ring-1 ring-rose-200/60 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 text-stone-500 hover:text-stone-900 bg-white/80 hover:bg-white rounded-full transition-all cursor-pointer z-20 shadow-xs border border-rose-100"
          title="Đóng cửa sổ"
        >
          <X className="w-4 h-4" />
        </button>

        {state.user ? (
          /* Profile view */
          <div className="space-y-5">
            <div className="text-center">
              <img
                src={state.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={state.user.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-stone-900 shadow-md"
              />
              <h3 className="font-display font-medium text-xl text-stone-900">{state.user.name}</h3>
              <p className="text-xs text-stone-500 font-mono mt-0.5">{state.user.email}</p>
              {state.user.phone && (
                <p className="text-xs text-stone-500 mt-0.5 flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3 text-stone-400" />
                  <span>{state.user.phone}</span>
                </p>
              )}
              
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
                    Khách Hàng Thân Thiết (CUSTOMER)
                  </span>
                )}
              </div>
            </div>

            {/* Chỉnh sửa tài khoản Button */}
            <button
              onClick={() => {
                dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthOpen', isOpen: false } });
                dispatch({ type: 'SET_MODAL', payload: { modal: 'isAccountSettingsOpen', isOpen: true } });
              }}
              className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
            >
              <Settings className="w-4 h-4 text-rose-300" />
              <span>Cài Đặt & Chỉnh Sửa Hồ Sơ Cá Nhân</span>
            </button>

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
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
              <div className="relative inline-flex items-center justify-center mx-auto mb-2.5">
                <div className="absolute inset-0 rounded-full bg-rose-400/35 blur-md animate-pulse" />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-400 text-white flex items-center justify-center text-xl shadow-md ring-4 ring-white/90">
                  <span className="inline-block animate-[flowerBloomPulse_3s_ease-in-out_infinite]">🌹</span>
                </div>
              </div>
              <h3 className="font-display font-medium text-2xl text-stone-900">
                Rose Flowers Xin chào!
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                {activeTab === 'login'
                  ? 'Đăng nhập để nhận ưu đãi và trải nghiệm dịch vụ tốt nhất.'
                  : 'Tạo tài khoản khách hàng để nhận ngay ưu đãi "Chào Bạn Mới" (ROSE10).'}
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

            {/* TAB: LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="ban@example.com"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-stone-700">Mật khẩu</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
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
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <span>Đăng Nhập Hệ Thống</span>
                  )}
                </button>
              </form>
            )}

            {/* TAB: REGISTER FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Họ và tên của bạn
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full text-xs pl-8 pr-2 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Số điện thoại (đúng 10 số)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0901234567"
                        className={`w-full text-xs pl-8 pr-2 py-2 bg-stone-50 border rounded-lg text-stone-900 focus:outline-none ${
                          phoneNumber && !isPhoneValid(phoneNumber)
                            ? 'border-red-400 focus:ring-1 focus:ring-red-500'
                            : 'border-stone-300 focus:ring-1 focus:ring-rose-800'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Mật khẩu bảo mật
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự"
                        className="w-full text-xs pl-8 pr-2 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full text-xs pl-8 pr-2 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Tiêu chuẩn mật khẩu 4 nhóm ký tự trực quan */}
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-[11px] space-y-1">
                  <span className="font-semibold text-stone-700 block text-[10px] uppercase tracking-wider">
                    Tiêu chuẩn an toàn mật khẩu:
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <span className={`flex items-center gap-1 ${regMinLength ? 'text-emerald-700 font-semibold' : 'text-stone-400'}`}>
                      <Check className="w-3 h-3 shrink-0" /> Độ dài 8 - 12+ ký tự
                    </span>
                    <span className={`flex items-center gap-1 ${regHasUpper ? 'text-emerald-700 font-semibold' : 'text-stone-400'}`}>
                      <Check className="w-3 h-3 shrink-0" /> Chữ in hoa (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 ${regHasLower ? 'text-emerald-700 font-semibold' : 'text-stone-400'}`}>
                      <Check className="w-3 h-3 shrink-0" /> Chữ thường (a-z)
                    </span>
                    <span className={`flex items-center gap-1 ${regHasNumber ? 'text-emerald-700 font-semibold' : 'text-stone-400'}`}>
                      <Check className="w-3 h-3 shrink-0" /> Chữ số (0-9)
                    </span>
                  </div>
                  <div className="pt-0.5">
                    <span className={`flex items-center gap-1 text-[10px] ${regHasSpecial ? 'text-emerald-700 font-semibold' : 'text-stone-400'}`}>
                      <Check className="w-3 h-3 shrink-0" /> Ký tự đặc biệt (!@#$%^&*...)
                    </span>
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
                    <span>Tạo Tài Khoản Khách Hàng (Nhận ROSE10)</span>
                  )}
                </button>
              </form>
            )}

            <p className="text-[10px] text-stone-400 text-center pt-2">
              Bằng việc đăng ký hoặc đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Rose Flowers.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

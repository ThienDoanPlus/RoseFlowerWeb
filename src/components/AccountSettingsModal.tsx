/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Camera,
  Calendar,
  Upload,
} from 'lucide-react';
import { useStore } from '../store';
import { FlowerAPI } from '../services/api';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

export const AccountSettingsModal: React.FC = () => {
  const { state, dispatch } = useStore();
  const user = state.user;

  // Active section
  const [activeSection, setActiveSection] = useState<'profile' | 'security'>('profile');

  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savedAddress, setSavedAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhoneNumber(user.phone || '');
      setAvatarUrl(user.avatarUrl || DEFAULT_AVATAR);
      setSavedAddress(user.savedAddress || state.deliveryInfo.address || '');
      setDistrict(user.district || state.deliveryInfo.district || 'Phường Tân Sơn');
      setCity(user.city || state.deliveryInfo.city || 'TP. Hồ Chí Minh');
    }
  }, [user, state.isAccountSettingsOpen]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP, GIF).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh quá lớn (tối đa 5MB). Vui lòng chọn ảnh có dung lượng nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setErrorMessage('');
      }
    };
    reader.onerror = () => {
      setErrorMessage('Có lỗi xảy ra khi đọc file ảnh. Vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  if (!state.isAccountSettingsOpen || !user) return null;

  // Realtime password criteria checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  // Phone validation: exactly 10 digits
  const isPhoneValid = (phone: string) => /^\d{10}$/.test(phone.replace(/[\s\-\.]/g, ''));

  const handleClose = () => {
    dispatch({ type: 'SET_MODAL', payload: { modal: 'isAccountSettingsOpen', isOpen: false } });
    setErrorMessage('');
    setSuccessMessage('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanPhone = phoneNumber.replace(/[\s\-\.]/g, '');
    if (cleanPhone && !isPhoneValid(cleanPhone)) {
      setErrorMessage('Số điện thoại phải bao gồm đúng 10 chữ số (VD: 0901234567).');
      return;
    }

    if (newPassword) {
      if (!isPasswordValid) {
        setErrorMessage('Mật khẩu mới chưa đáp ứng đủ 4 nhóm ký tự (Hoa, thường, số, đặc biệt) hoặc chưa đủ 8 ký tự.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Xác nhận mật khẩu mới không trùng khớp.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await FlowerAPI.updateProfile({
        userId: user.id,
        email: user.email,
        fullName: fullName.trim(),
        phoneNumber: cleanPhone,
        avatarUrl,
        savedAddress: savedAddress.trim(),
        district: district.trim(),
        city: city.trim(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      // Update store user profile
      dispatch({
        type: 'UPDATE_USER_PROFILE',
        payload: {
          name: fullName.trim() || user.name,
          phone: cleanPhone || user.phone,
          avatarUrl,
          savedAddress: savedAddress.trim(),
          district: district.trim(),
          city: city.trim(),
        },
      });

      setSuccessMessage('Đã cập nhật thông tin tài khoản thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
          <div className="relative">
            <img
              src={avatarUrl || user.avatarUrl}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-stone-900 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="font-display font-medium text-xl text-stone-900 flex items-center gap-2">
              <span>{user.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-stone-100 text-stone-700">
                {user.role}
              </span>
            </h3>
            <p className="text-xs text-stone-500 font-mono">{user.email}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 my-4 p-1 bg-stone-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSection === 'profile'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Thông Tin Cá Nhân & Địa Chỉ
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('security')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSection === 'security'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Bảo Mật & Mật Khẩu
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {activeSection === 'profile' && (
            <div className="space-y-4">
              {/* Custom Avatar Upload */}
              <div className="p-3.5 sm:p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-rose-800" />
                    <span>Ảnh đại diện</span>
                  </label>
                  <span className="text-[11px] text-stone-500">
                    JPG, PNG, WEBP (tối đa 5MB)
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Avatar Preview with Camera Overlay */}
                  <div className="relative group shrink-0">
                    <img
                      src={avatarUrl || user.avatarUrl || DEFAULT_AVATAR}
                      alt={fullName || user.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-stone-300 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                      title="Bấm để tải ảnh mới từ máy"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Upload Button & Actions */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 active:scale-98 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh từ máy lên</span>
                      </button>

                      {avatarUrl && avatarUrl !== user.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl(user.avatarUrl)}
                          className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-600 text-xs font-medium rounded-lg border border-stone-200 transition-colors cursor-pointer"
                        >
                          Khôi phục ảnh cũ
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Bạn có thể tự chọn và tải lên bất kỳ hình ảnh nào từ máy tính hoặc điện thoại của mình.
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-700 mb-1">
                    Số điện thoại (đúng 10 chữ số)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0901234567"
                      className={`w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border rounded-lg text-stone-900 focus:outline-none focus:ring-1 ${
                        phoneNumber && !isPhoneValid(phoneNumber)
                          ? 'border-red-400 focus:ring-red-600'
                          : 'border-stone-300 focus:ring-stone-900'
                      }`}
                    />
                  </div>
                  {phoneNumber && !isPhoneValid(phoneNumber) && (
                    <p className="text-[10px] text-red-600 mt-1">
                      Số điện thoại phải gồm đúng 10 chữ số.
                    </p>
                  )}
                </div>
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  Địa chỉ Email tài khoản (Không thể thay đổi)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-stone-100 border border-stone-200 rounded-lg text-stone-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Delivery Address Defaults */}
              <div className="pt-2 border-t border-stone-200">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-700" />
                  <span>Địa chỉ nhận hoa mặc định</span>
                </h4>
                
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Địa chỉ (Số nhà, tên đường)
                    </label>
                    <input
                      type="text"
                      value={savedAddress}
                      onChange={(e) => setSavedAddress(e.target.value)}
                      placeholder="294 Phạm Văn Bạch"
                      className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 mb-1">
                        Phường / Quận
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Phường Tân Sơn"
                        className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 mb-1">
                        Tỉnh / Thành phố
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="TP. Hồ Chí Minh"
                        className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-3.5">
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-semibold block mb-0.5">Tiêu chuẩn mật khẩu an toàn:</span>
                <p className="text-[11px] leading-relaxed">
                  Mật khẩu cần tối thiểu từ <strong>8 đến 12+ ký tự</strong> và bắt buộc kết hợp cả <strong>4 nhóm ký tự</strong>: Chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full text-xs pl-9 pr-9 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  Mật khẩu mới (≥ 8 ký tự)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới an toàn"
                    className="w-full text-xs pl-9 pr-9 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                {/* Real-time 4 Character Groups Checklist */}
                {newPassword && (
                  <div className="mt-2 p-2.5 bg-stone-50 rounded-lg border border-stone-200 grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-stone-400'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-stone-300'}`} />
                      <span>Ít nhất 8-12 ký tự ({newPassword.length}/8)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700 font-medium' : 'text-stone-400'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${hasUpper ? 'text-emerald-600' : 'text-stone-300'}`} />
                      <span>Chữ in hoa (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-700 font-medium' : 'text-stone-400'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${hasLower ? 'text-emerald-600' : 'text-stone-300'}`} />
                      <span>Chữ thường (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-medium' : 'text-stone-400'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-stone-300'}`} />
                      <span>Chữ số (0-9)</span>
                    </div>
                    <div className={`col-span-2 flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-medium' : 'text-stone-400'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600' : 'text-stone-300'}`} />
                      <span>Ký tự đặc biệt (!@#$%^&*...)</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full text-xs pl-9 pr-9 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] text-red-600 mt-1">
                    Xác nhận mật khẩu chưa trùng khớp.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu Thay Đổi</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

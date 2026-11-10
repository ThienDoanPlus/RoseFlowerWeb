/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, X, Copy, Check } from 'lucide-react';
import { useStore } from '../store';

export const PromoBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { state, dispatch } = useStore();

  // Role ADMIN không hiển thị banner khuyến mãi mua hoa của khách
  if (isDismissed || state.currentRole === 'ADMIN') return null;

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard?.writeText('ROSE10');
      setIsCopied(true);
      dispatch({
        type: 'ADD_PUSH_NOTIFICATION',
        payload: {
          id: `promo-copy-${Date.now()}`,
          title: '🎉 Đã sao chép mã ưu đãi ROSE10!',
          message: 'Mã ROSE10 (giảm 10% đơn hàng) đã được sao chép. Dán mã này tại bước thanh toán để nhận ưu đãi nhé!',
          timestamp: 'Vừa xong',
          type: 'promo',
          read: false,
        },
      });
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <aside
      aria-label="Khuyến mãi đặc biệt"
      className="bg-gradient-to-r from-rose-950 via-[#4A0E17] to-rose-950 text-rose-100 text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 border-b border-rose-900/80 shadow-xs relative z-30"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left balance spacer (matches right close button width for true mathematical centering) */}
        <div className="w-7 sm:w-8 shrink-0 hidden sm:block" aria-hidden="true" />

        {/* Perfectly centered promo content */}
        <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-center">
          <span className="inline-flex items-center gap-1.5 font-medium text-rose-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
            <span className="font-semibold text-white">Ưu đãi chào bạn mới:</span>
          </span>

          <span className="text-rose-200 inline-flex items-center gap-1">
            <span>Nhập mã</span>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Bấm để sao chép mã ROSE10"
              className="shine-auto group relative inline-flex items-center gap-1 text-white bg-rose-900/90 hover:bg-rose-800 px-2 py-0.5 rounded-md font-mono font-bold border border-rose-600/70 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <span>ROSE10</span>
              {isCopied ? (
                <Check className="w-3 h-3 text-emerald-300 shrink-0" />
              ) : (
                <Copy className="w-3 h-3 text-rose-300 group-hover:text-white shrink-0" />
              )}
            </button>
            <span className="font-medium text-amber-200">giảm ngay 10%</span>
            <span className="hidden lg:inline text-rose-300/80">· Tặng kèm thiệp viết tay · Giao nhanh 45 phút</span>
          </span>

          <button
            type="button"
            onClick={() => {
              const vouchersEl = document.getElementById('vouchers');
              if (vouchersEl) {
                vouchersEl.scrollIntoView({ behavior: 'smooth' });
              } else {
                dispatch({ type: 'SET_MODAL', payload: { modal: 'isCartOpen', isOpen: true } });
              }
            }}
            className="text-white hover:text-amber-200 underline underline-offset-2 ml-1 transition-colors cursor-pointer text-[10px] sm:text-[11px] font-semibold whitespace-nowrap"
          >
            Xem ưu đãi →
          </button>
        </div>

        {/* Right close button */}
        <div className="shrink-0 flex items-center justify-end w-7 sm:w-8">
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="w-7 h-7 flex items-center justify-center text-rose-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Đóng thông báo"
            aria-label="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

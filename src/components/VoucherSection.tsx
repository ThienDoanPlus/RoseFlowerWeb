/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Tag, Check, Copy, Gift, Sparkles, Percent, Share2, AlertCircle, CheckCircle2, Lock, Clock } from 'lucide-react';
import { useStore } from '../store';
import { VOUCHERS } from '../data/mockData';
import { formatVND, checkVoucherUsageStatus } from '../utils/calculations';
import { Voucher } from '../types';

export const VoucherSection: React.FC = () => {
  const { state, dispatch, subtotal, totalQuantity } = useStore();
  const currentCode = state.activeVoucher?.code;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLinkCode, setCopiedLinkCode] = useState<string | null>(null);

  // Lấy mã voucher từ URL query params (?voucher=...)
  const getUrlVoucherCode = () => {
    if (typeof window === 'undefined') return '';
    try {
      const params = new URLSearchParams(window.location.search);
      return (params.get('voucher') || params.get('magiamgia') || params.get('code') || '').toUpperCase();
    } catch {
      return '';
    }
  };
  const sharedUrlVoucher = getUrlVoucherCode();

  // Ngữ cảnh kiểm tra số lần sử dụng voucher của khách hàng
  const voucherUsageContext = useMemo(
    () => ({
      userId: state.user?.id,
      email: state.user?.email || state.deliveryInfo.recipientEmail,
      phone: state.user?.phone || state.deliveryInfo.recipientPhone,
      usedVouchersHistory: state.usedVouchers,
      currentYear: new Date().getFullYear(),
    }),
    [state.user, state.deliveryInfo, state.usedVouchers]
  );

  // Tự động điều hướng và cuộn chính xác đến thẻ mã ưu đãi đó
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scrollToTargetVoucher = () => {
      const code = getUrlVoucherCode();
      const hash = window.location.hash.replace('#', '');
      const targetId = code ? `voucher-${code}` : hash;
      if (!targetId) return;

      const targetEl = document.getElementById(targetId) || (code ? document.getElementById('vouchers') : null);
      if (targetEl) {
        const navHeight = 96; // Tránh bị che bởi Navbar sticky (80px + 16px khoảng đệm)
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: Math.max(0, y),
          behavior: 'smooth',
        });
      }
    };

    // Cuộn qua 3 giai đoạn để vượt qua layout shift khi ảnh tải
    const t1 = setTimeout(scrollToTargetVoucher, 150);
    const t2 = setTimeout(scrollToTargetVoucher, 500);
    const t3 = setTimeout(scrollToTargetVoucher, 950);

    window.addEventListener('hashchange', scrollToTargetVoucher);
    window.addEventListener('popstate', scrollToTargetVoucher);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('hashchange', scrollToTargetVoucher);
      window.removeEventListener('popstate', scrollToTargetVoucher);
    };
  }, []);

  // 1. Sao chép trực tiếp mã voucher để dán vào giỏ hàng hoặc thanh toán
  const handleCopyVoucherCode = (code: string) => {
    if (typeof window === 'undefined') return;
    try {
      navigator.clipboard.writeText(code).then(() => {
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: `Đã chép mã "${code}"! Bạn có thể dán vào ô nhập mã trong giỏ hàng hoặc bước thanh toán.`,
            type: 'success',
          },
        });
      }).catch(() => {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: `Mã ưu đãi của bạn: ${code}`, type: 'info' },
        });
      });
    } catch {
      // ignore
    }
  };

  // 2. Sao chép link chia sẻ riêng biệt cho từng mã voucher (mỗi mã có 1 URL riêng)
  const handleShareVoucher = (voucher: Voucher) => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/?voucher=${encodeURIComponent(voucher.code)}#voucher-${encodeURIComponent(voucher.code.toUpperCase())}`;
    try {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLinkCode(voucher.code);
        setTimeout(() => setCopiedLinkCode(null), 2500);
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: `Đã sao chép link riêng cho mã ${voucher.code}! Gửi link này cho bạn bè để nhận ưu đãi (Đơn từ ${formatVND(voucher.minOrderValue)}).`,
            type: 'success',
          },
        });
      }).catch(() => {
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: `Link ưu đãi mã ${voucher.code}: ${shareUrl}`,
            type: 'info',
          },
        });
      });
    } catch {
      // ignore
    }
  };

  // 3. Áp dụng trực tiếp mã voucher
  const handleApplyVoucher = (voucher: Voucher) => {
    // Kiểm tra chính sách giới hạn số lần sử dụng
    const usageStatus = checkVoucherUsageStatus(voucher, voucherUsageContext);
    if (usageStatus.isUsed) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: usageStatus.reason || 'Mã ưu đãi này đã được sử dụng theo chính sách của tiệm.',
          type: 'warning',
        },
      });
      return;
    }

    dispatch({ type: 'APPLY_VOUCHER', payload: voucher });

    const isMinOrderMet = subtotal >= voucher.minOrderValue;
    const isMinQtyMet = !voucher.minQuantity || totalQuantity >= voucher.minQuantity;
    const isFullyEligible = isMinOrderMet && isMinQtyMet;

    if (isFullyEligible) {
      const discountText = voucher.discountType === 'PERCENT'
        ? `giảm ${voucher.discountValue}% (tối đa ${formatVND(voucher.maxDiscountAmount || 0)})`
        : `giảm ${formatVND(voucher.discountValue)}`;
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: `Đã kích hoạt mã ${voucher.code}: Đơn hàng đủ điều kiện ${discountText}!`,
          type: 'success',
        },
      });
    } else if (subtotal === 0) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: `Đã lưu mã ${voucher.code}! Giảm giá sẽ tự động kích hoạt khi giỏ hàng đạt từ ${formatVND(voucher.minOrderValue)}.`,
          type: 'info',
        },
      });
    } else {
      const missingAmount = voucher.minOrderValue - subtotal;
      const reason = !isMinOrderMet
        ? `Cần thêm ${formatVND(missingAmount)} tiền hoa nữa để đạt đơn tối thiểu ${formatVND(voucher.minOrderValue)}.`
        : `Cần chọn tối thiểu ${voucher.minQuantity} bó hoa để sử dụng mã này.`;
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: `Đã lưu mã ${voucher.code}. Lưu ý: ${reason}`,
          type: 'warning',
        },
      });
    }
  };

  return (
    <section id="vouchers" className="py-12 sm:py-16 bg-[#FFF0F4] border-y border-rose-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs uppercase tracking-widest text-rose-700 font-semibold block mb-2">
            Rose Special Perks
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-rose-950 tracking-tight mb-3 sm:mb-4">
            Ưu Đãi Hoa Sáp Dịp Lễ & Đặt Số Lượng Lớn
          </h2>
          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
            Áp dụng mã giảm giá độc quyền cho hoa sáp thơm tại Rose (294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM) hoặc chia sẻ link nhận ưu đãi cho người thân.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VOUCHERS.map((voucher) => {
            const usageStatus = checkVoucherUsageStatus(voucher, voucherUsageContext);
            const isUsed = usageStatus.isUsed;
            const isApplied = currentCode === voucher.code && !isUsed;
            const isMinOrderMet = subtotal >= voucher.minOrderValue;
            const isMinQtyMet = !voucher.minQuantity || totalQuantity >= voucher.minQuantity;
            const isFullyEligible = isMinOrderMet && isMinQtyMet;
            const isSharedTarget = sharedUrlVoucher === voucher.code.toUpperCase();

            return (
              <div
                id={`voucher-${voucher.code.toUpperCase()}`}
                key={voucher.code}
                className={`scroll-mt-28 bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between relative group overflow-hidden ${
                  isSharedTarget
                    ? 'ring-4 ring-rose-500 shadow-2xl border-rose-500 scale-[1.02] bg-rose-50/20'
                    : isUsed
                    ? 'border-stone-200 bg-stone-50/60'
                    : isApplied
                    ? isFullyEligible
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                    : 'border-stone-200 hover:border-rose-300 hover:shadow-md'
                }`}
              >
                {/* Top Specular Reflection Highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-300/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                {/* Glossy Specular Light Reflection Sweep on Hover */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                  <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-r from-transparent via-white/50 to-transparent -rotate-45 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100" />
                </div>
                <div>
                  {/* Glowing banner for shared voucher */}
                  {isSharedTarget && (
                    <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-t-2xl -mt-5 -mx-5 mb-3.5 flex items-center justify-between shadow-xs">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>Mã ưu đãi bạn được chia sẻ</span>
                      </span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                        Đang áp dụng ✓ 
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      {voucher.holidayTag ? (
                        <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block mb-1">
                          {voucher.holidayTag}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                          {voucher.minQuantity ? 'Ưu đãi số lượng lớn' : 'Khách hàng thân thiết'}
                        </span>
                      )}
                      <h4 className="text-base font-semibold text-stone-900">{voucher.title}</h4>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                      <Percent className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    {voucher.description}
                  </p>

                  {/* Condition status badge */}
                  <div className="mb-4">
                    {isUsed ? (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
                        <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{usageStatus.reason || usageStatus.badgeText}</span>
                      </div>
                    ) : isApplied ? (
                      isFullyEligible ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Đã đủ điều kiện · Kích hoạt giảm giá</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Chưa đủ điều kiện ({subtotal === 0 ? `Đơn từ ${formatVND(voucher.minOrderValue)}` : `Thiếu ${formatVND(voucher.minOrderValue - subtotal)}`})</span>
                        </div>
                      )
                    ) : (
                      <div className="text-[11px] text-stone-600 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                        <span>Điều kiện: Đơn từ <strong>{formatVND(voucher.minOrderValue)}</strong>{voucher.minQuantity ? ` · Từ ${voucher.minQuantity} bó` : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-stone-500 space-y-1 mb-5">
                    <div>
                      Đơn tối thiểu: <strong>{formatVND(voucher.minOrderValue)}</strong>
                    </div>
                    {voucher.maxDiscountAmount && (
                      <div>
                        Giảm tối đa: <strong>{formatVND(voucher.maxDiscountAmount)}</strong>
                      </div>
                    )}
                    {voucher.minQuantity && (
                      <div>
                        Số lượng tối thiểu: <strong>{voucher.minQuantity} bó hoa</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-stone-100">
                  {/* Top row: Voucher code & Copy button, and Share link button */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyVoucherCode(voucher.code)}
                      className={`font-mono text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        copiedCode === voucher.code
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/30'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border-stone-300'
                      }`}
                      title="Bấm để sao chép mã và dán vào giỏ hàng hoặc bước thanh toán"
                    >
                      {copiedCode === voucher.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{voucher.code}</span>
                          <span className="text-[10px] font-sans font-normal text-emerald-700 ml-1">Đã chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-500" />
                          <span>{voucher.code}</span>
                          <span className="text-[10px] font-sans font-normal text-stone-500 ml-0.5">Chép mã</span>
                        </>
                      )}
                    </button>

                    {/* Share Unique Link Button */}
                    <button
                      type="button"
                      onClick={() => handleShareVoucher(voucher)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs whitespace-nowrap active:scale-95 ${
                        copiedLinkCode === voucher.code
                          ? 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-300'
                          : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300 hover:border-stone-400'
                      }`}
                      title={`Sao chép link riêng cho mã ${voucher.code} để chia sẻ cho người khác`}
                    >
                      {copiedLinkCode === voucher.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-rose-700" />
                          <span className="text-rose-900 font-semibold text-[11px]">Đã chép link!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-rose-700" />
                          <span className="text-[11px]">Chia sẻ link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bottom row: Direct Apply Action */}
                  {isUsed ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
                    >
                      <Lock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{usageStatus.badgeText || 'Đã sử dụng'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyVoucher(voucher)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap active:scale-98 ${
                        isApplied
                          ? isFullyEligible
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isFullyEligible ? 'Đã kích hoạt vào giỏ hàng' : 'Đã chọn mã (Chờ đủ điều kiện)'}</span>
                        </>
                      ) : (
                        <>
                          <Tag className="w-3.5 h-3.5" />
                          <span>Áp dụng ngay vào giỏ hàng</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

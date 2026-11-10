/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tag, Check, Copy, Gift, Sparkles, Percent, Share2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { VOUCHERS } from '../data/mockData';
import { formatVND } from '../utils/calculations';
import { Voucher } from '../types';

export const VoucherSection: React.FC = () => {
  const { state, dispatch, subtotal, totalQuantity } = useStore();
  const currentCode = state.activeVoucher?.code;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleShareVoucher = (voucher: Voucher) => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/?voucher=${encodeURIComponent(voucher.code)}#vouchers`;
    try {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedCode(voucher.code);
        setTimeout(() => setCopiedCode(null), 2000);
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: `Đã sao chép link ưu đãi: Mã ${voucher.code}! (Đơn tối thiểu ${formatVND(voucher.minOrderValue)})`,
            type: 'success',
          },
        });
      }).catch(() => {
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: `Link ưu đãi: ${shareUrl}`,
            type: 'info',
          },
        });
      });
    } catch {
      // ignore
    }
  };

  const handleApplyVoucher = (voucher: Voucher) => {
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
            const isApplied = currentCode === voucher.code;
            const isMinOrderMet = subtotal >= voucher.minOrderValue;
            const isMinQtyMet = !voucher.minQuantity || totalQuantity >= voucher.minQuantity;
            const isFullyEligible = isMinOrderMet && isMinQtyMet;

            return (
              <div
                key={voucher.code}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isApplied
                    ? isFullyEligible
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                    : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                <div>
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
                    {isApplied ? (
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

                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-stone-100">
                  <div className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1.5 rounded-lg border border-stone-200 select-all">
                    {voucher.code}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Share Link Button */}
                    <button
                      type="button"
                      onClick={() => handleShareVoucher(voucher)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 transition-all cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap"
                      title="Sao chép link chia sẻ mã ưu đãi này"
                    >
                      <Share2 className="w-3.5 h-3.5 text-rose-700" />
                      <span className="hidden xs:inline sm:inline">Chia sẻ</span>
                    </button>

                    {/* Apply Button */}
                    <button
                      type="button"
                      onClick={() => handleApplyVoucher(voucher)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap ${
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
                          <span>{isFullyEligible ? 'Đã kích hoạt' : 'Đã chọn mã'}</span>
                        </>
                      ) : (
                        <>
                          <Tag className="w-3.5 h-3.5" />
                          <span>Áp dụng ngay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

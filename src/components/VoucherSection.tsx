/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tag, Check, Copy, Gift, Sparkles, Percent } from 'lucide-react';
import { useStore } from '../store';
import { VOUCHERS } from '../data/mockData';
import { formatVND } from '../utils/calculations';

export const VoucherSection: React.FC = () => {
  const { state, dispatch } = useStore();
  const currentCode = state.activeVoucher?.code;

  return (
    <section id="vouchers" className="py-16 bg-[#FFF0F4] border-y border-rose-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-rose-700 font-semibold block mb-2">
            Rose Special Perks
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-medium text-rose-950 tracking-tight mb-4">
            Ưu Đãi Hoa Sáp Dịp Lễ & Đặt Số Lượng Lớn
          </h2>
          <p className="text-stone-700 text-sm leading-relaxed">
            Áp dụng mã giảm giá độc quyền cho hoa sáp thơm tại Rose (294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM) hoặc chiết khấu trực tiếp cho đơn hàng số lượng lớn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VOUCHERS.map((voucher) => {
            const isApplied = currentCode === voucher.code;

            return (
              <div
                key={voucher.code}
                className={`bg-white rounded-xl p-5 border transition-all ${
                  isApplied
                    ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                    : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                } flex flex-col justify-between`}
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

                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {voucher.description}
                  </p>

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

                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <div className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1.5 rounded border border-stone-200 select-all">
                    {voucher.code}
                  </div>

                  <button
                    onClick={() => {
                      dispatch({ type: 'APPLY_VOUCHER', payload: voucher });
                      dispatch({
                        type: 'SHOW_TOAST',
                        payload: { message: `Đã chọn áp dụng mã ${voucher.code}!`, type: 'success' },
                      });
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isApplied
                        ? 'bg-rose-700 text-white shadow-sm'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đang kích hoạt</span>
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
            );
          })}
        </div>
      </div>
    </section>
  );
};

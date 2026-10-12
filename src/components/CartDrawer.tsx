/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trash2, ArrowRight, Tag, Percent, Sparkles, Check, ShoppingBag } from 'lucide-react';
import { useStore } from '../store';
import { VOUCHERS } from '../data/mockData';
import { formatVND } from '../utils/calculations';

export const CartDrawer: React.FC = () => {
  const { state, dispatch, subtotal, totalQuantity, bulkDiscountInfo, voucherValidation, shippingFee, finalTotal } = useStore();
  const [voucherInput, setVoucherInput] = useState('');

  if (!state.isCartOpen) return null;

  const handleApplyCustomVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherInput.trim().toUpperCase();
    const found = VOUCHERS.find((v) => v.code === code);
    if (found) {
      dispatch({ type: 'APPLY_VOUCHER', payload: found });
      dispatch({ type: 'SHOW_TOAST', payload: { message: `Đã áp dụng mã ${found.code}`, type: 'success' } });
      setVoucherInput('');
    } else {
      dispatch({ type: 'SHOW_TOAST', payload: { message: `Mã "${code}" không hợp lệ`, type: 'error' } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-stone-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-900" />
            <h3 className="font-display font-medium text-lg text-stone-900">
              Giỏ Hoa Của Bạn ({totalQuantity})
            </h3>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCartOpen', isOpen: false } })}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {state.cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-medium text-stone-800 text-base mb-1">Giỏ hoa đang trống</h4>
              <p className="text-xs text-stone-500 max-w-xs mb-6">
                Hãy lựa chọn những bó hoa tươi thắm nhất để trao gửi cảm xúc chân thành.
              </p>
              <button
                onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCartOpen', isOpen: false } })}
                className="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Tiếp tục ngắm hoa
              </button>
            </div>
          ) : (
            <>
              {/* Bulk Discount Notification Banner */}
              {bulkDiscountInfo.isEligible ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Ưu đãi tự động:</strong> {bulkDiscountInfo.reason} (tiết kiệm {formatVND(bulkDiscountInfo.bulkDiscount)})
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-600 flex items-center justify-between">
                  <span>Đặt từ 3 bó trở lên để nhận ngay chiết khấu 10%!</span>
                  <span className="font-semibold text-stone-900 font-mono">Hiện có: {totalQuantity} bó</span>
                </div>
              )}

              {/* Items */}
              {state.cart.map((item) => {
                const variantLabel =
                  item.sizeVariant === 'standard' ? 'Tiêu chuẩn' : item.sizeVariant === 'deluxe' ? 'Thịnh soạn' : 'Vương giả';

                return (
                  <div key={item.id} className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
                    <div className="flex gap-3">
                      <img
                        src={item.flower.imageUrl}
                        alt={item.flower.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-semibold text-xs text-stone-900 truncate">{item.flower.name}</h4>
                          <button
                            onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: { itemId: item.id } })}
                            className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer transition-colors"
                            title="Xóa khỏi giỏ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-[11px] text-stone-500 block">{variantLabel}</span>

                        <div className="flex items-center justify-between mt-2">
                          <span className="font-mono text-xs font-bold text-stone-900 tabular-nums">
                            {formatVND(item.unitPrice * item.quantity)}
                          </span>

                          {/* Stepper */}
                          <div className="flex items-center border border-stone-200 rounded-md bg-stone-50 text-xs">
                            <button
                              onClick={() =>
                                dispatch({
                                  type: 'UPDATE_CART_QTY',
                                  payload: { itemId: item.id, quantity: item.quantity - 1 },
                                })
                              }
                              className="px-2 py-0.5 text-stone-600 hover:text-stone-900 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 font-mono font-medium text-stone-900">{item.quantity}</span>
                            <button
                              onClick={() =>
                                dispatch({
                                  type: 'UPDATE_CART_QTY',
                                  payload: { itemId: item.id, quantity: item.quantity + 1 },
                                })
                              }
                              className="px-2 py-0.5 text-stone-600 hover:text-stone-900 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Greeting card note attached to this bouquet */}
                    {item.cardMessage && (
                      <p className="text-[11px] text-stone-600 italic bg-[#FAF8F5] p-2 rounded border border-stone-200/60 truncate">
                        💌 "{item.cardMessage}"
                      </p>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer & Checkout Breakdown */}
        {state.cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-[#FAF8F5] space-y-4">
            {/* Voucher input form */}
            <form onSubmit={handleApplyCustomVoucher} className="flex gap-2">
              <input
                type="text"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
                placeholder="Nhập mã voucher (vd: PHUNUVN2010)"
                className="flex-1 text-xs uppercase px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:normal-case placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
              >
                Áp dụng
              </button>
            </form>

            {/* Active Voucher Tag */}
            {state.activeVoucher && (
              <div className="flex items-center justify-between text-xs bg-rose-50 text-rose-800 p-2 rounded-md border border-rose-200">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <Tag className="w-3.5 h-3.5 shrink-0" />
                  Mã {state.activeVoucher.code}: {voucherValidation.message}
                </span>
                <button
                  onClick={() => dispatch({ type: 'APPLY_VOUCHER', payload: null })}
                  className="text-stone-400 hover:text-stone-700 ml-2 cursor-pointer"
                  title="Hủy voucher"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-200">
              <div className="flex justify-between">
                <span>Tạm tính tiền hoa:</span>
                <span className="font-mono text-stone-900 tabular-nums">{formatVND(subtotal)}</span>
              </div>

              {bulkDiscountInfo.isEligible && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Chiết khấu mua nhiều ({bulkDiscountInfo.bulkRate}%):</span>
                  <span className="font-mono tabular-nums">-{formatVND(bulkDiscountInfo.bulkDiscount)}</span>
                </div>
              )}

              {voucherValidation.isValid && voucherValidation.discountAmount > 0 && !bulkDiscountInfo.isEligible && (
                <div className="flex justify-between text-rose-700 font-medium">
                  <span>Voucher giảm giá ({state.activeVoucher?.code}):</span>
                  <span className="font-mono tabular-nums">-{formatVND(voucherValidation.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Cước vận chuyển ({state.deliveryInfo.distanceKm} km):</span>
                <span className="font-mono text-stone-900 tabular-nums">
                  {shippingFee === 0 ? 'Miễn phí (Freeship)' : formatVND(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-sm font-semibold text-stone-900 pt-2 border-t border-stone-300">
                <span>Tổng cộng:</span>
                <span className="text-base font-mono font-bold tabular-nums">{formatVND(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => {
                dispatch({ type: 'SET_MODAL', payload: { modal: 'isCartOpen', isOpen: false } });
                dispatch({ type: 'SET_MODAL', payload: { modal: 'isCheckoutOpen', isOpen: true } });
              }}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Tiến hành đặt hoa & thanh toán</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

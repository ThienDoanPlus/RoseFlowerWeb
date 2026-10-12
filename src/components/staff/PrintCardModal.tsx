/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { X, Printer, Copy, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../store';

export const PrintCardModal: React.FC = () => {
  const { state, dispatch } = useStore();
  const [copied, setCopied] = React.useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!state.isPrintCardOpen || !state.selectedOrderForPrint) return null;

  const order = state.selectedOrderForPrint;
  const delivery = order.deliveryInfo;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `Lời chúc: "${delivery.cardMessage}"\nNgười gửi: ${delivery.senderName}\nNgười nhận: ${delivery.recipientName} - Đơn hàng #${order.id}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: 'Đã sao chép nội dung thiệp chúc mừng', type: 'success' },
    });
  };

  const handleClose = () => {
    dispatch({ type: 'SET_PRINT_ORDER', payload: null });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
        
        {/* Header Action Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-100 text-rose-800 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-medium text-lg text-stone-900">
                Xuất In Thiệp Chúc Mừng Trang Trọng
              </h3>
              <p className="text-xs text-stone-500">
                Đơn hàng #{order.id} · Chuẩn kích thước thiệp 10x15cm Rose Flowers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              title="Sao chép lời chúc"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-900 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              title="In thiệp ngay"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In thiệp</span>
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Card Printable Canvas (10x15 cm ratio) */}
        <div
          ref={printAreaRef}
          className="printable-card relative bg-[#FFFDF9] rounded-xl border-2 border-rose-200/80 p-8 sm:p-10 shadow-inner overflow-hidden text-center"
          style={{
            backgroundImage:
              'radial-gradient(#e5a4b4 0.6px, transparent 0.6px), radial-gradient(#d4af37 0.4px, #FFFDF9 0.4px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        >
          {/* Ornate Gold Inner Border */}
          <div className="absolute inset-3 border border-amber-300/60 rounded-lg pointer-events-none" />
          <div className="absolute inset-4 border border-rose-300/40 rounded-md pointer-events-none" />

          {/* Floral Crest */}
          <div className="flex flex-col items-center justify-center mb-5">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shadow-2xs mb-2">
              <Heart className="w-5 h-5 fill-rose-600/20 text-rose-700" />
            </div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-sans text-rose-900/70 font-semibold">
              Rose Flowers · Tiệm Hoa Sáp Rose
            </span>
            <div className="w-16 h-0.5 bg-rose-300/70 mt-1" />
          </div>

          {/* Card Message Body in Calligraphy / Serif Font */}
          <div className="py-4 px-2 sm:px-6">
            <p className="font-serif italic text-base sm:text-xl text-stone-800 leading-relaxed sm:leading-loose whitespace-pre-line tracking-wide">
              "{delivery.cardMessage || 'Gửi trọn yêu thương cùng những đóa hoa thơm ngát vĩnh cửu.'}"
            </p>
          </div>

          {/* Sender Signature & Recipient Details */}
          <div className="mt-6 pt-5 border-t border-rose-200/50 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-600 gap-3">
            <div className="text-left">
              <span className="text-[10px] text-stone-400 block uppercase tracking-wider">Gửi tặng đến:</span>
              <strong className="font-serif text-sm text-stone-900">{delivery.recipientName}</strong>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[10px] text-stone-400 block uppercase tracking-wider">Chữ ký người gửi:</span>
              <span className="font-serif italic text-base font-semibold text-rose-900">
                {delivery.senderName || 'Người gửi ẩn danh'}
              </span>
            </div>
          </div>

          {/* Footer Barcode & Verification */}
          <div className="mt-5 pt-3 border-t border-stone-200/40 flex items-center justify-between text-[10px] text-stone-400 font-mono">
            <span>Mã đơn: #{order.id}</span>
            <span>Ngày giao: {delivery.deliveryDate} ({delivery.deliveryTimeSlot})</span>
            <span>294 Phạm Văn Bạch, Tân Sơn, TP.HCM</span>
          </div>
        </div>

        {/* Modal Info Footer */}
        <div className="mt-5 flex items-center justify-between text-xs text-stone-500 print:hidden">
          <span>Khổ giấy đề xuất: <strong>100 x 150 mm (A6 / Postcard)</strong></span>
          <button
            onClick={handleClose}
            className="text-rose-800 hover:underline cursor-pointer font-medium"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};

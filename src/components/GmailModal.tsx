/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, X, CheckCircle2, Flower2, Calendar, MapPin, ExternalLink, Inbox, ArrowLeft } from 'lucide-react';
import { useStore } from '../store';
import { GmailEmail } from '../types';
import { formatVND } from '../utils/calculations';

export const GmailModal: React.FC = () => {
  const { state, dispatch } = useStore();
  const emails = state.gmailEmails;
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(emails[0] || null);

  if (!state.isGmailOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-stone-200 flex flex-col">
        
        {/* Gmail Webmail Top Bar */}
        <div className="bg-[#F6F8FC] px-4 sm:px-6 py-3 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              M
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <span>Google Mail · Hộp thư điện tử</span>
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                {state.user?.email || 'nguyenthiendoan2@gmail.com'}
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isGmailOpen', isOpen: false } })}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          {emails.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="text-stone-800 text-sm font-semibold mb-1">Hộp thư Gmail chưa có thư mới</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                Khi bạn hoàn tất đặt hoa, thư xác nhận điện tử chính thức kèm hóa đơn chi tiết sẽ được tự động gửi đến <strong>nguyenthiendoan2@gmail.com</strong>.
              </p>
              <button
                onClick={() => {
                  dispatch({ type: 'SET_MODAL', payload: { modal: 'isGmailOpen', isOpen: false } });
                  dispatch({ type: 'SET_MODAL', payload: { modal: 'isCartOpen', isOpen: true } });
                }}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Đặt hoa ngay để nhận email
              </button>
            </div>
          ) : (
            <div>
              {/* Email List selector if multiple emails */}
              {emails.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-stone-200">
                  {emails.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedEmail(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap cursor-pointer transition-all ${
                        selectedEmail?.id === m.id
                          ? 'bg-stone-900 text-white font-medium'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      Đơn #{m.orderId} ({m.date})
                    </button>
                  ))}
                </div>
              )}

              {/* Render Selected Email as Official Floral Boutique Email */}
              {selectedEmail && (
                <div className="bg-[#FAF8F5] rounded-xl border border-stone-200 overflow-hidden shadow-xs">
                  {/* Email Meta Header */}
                  <div className="p-4 bg-white border-b border-stone-200 space-y-2">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-rose-950">Rose Atelier</span>
                        <span>&lt;nguyenthiendoan2@gmail.com&gt;</span>
                      </div>
                      <span>{selectedEmail.date}</span>
                    </div>
                    <div className="text-xs text-stone-600">
                      Đến: <strong>{selectedEmail.to}</strong>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Brand Banner */}
                    <div className="text-center pb-6 border-b border-rose-200">
                      <h1 className="text-2xl font-display font-medium text-rose-950 tracking-tight">
                        Rose
                      </h1>
                      <p className="text-xs text-rose-700 uppercase tracking-widest mt-0.5">
                        Tiệm Hoa Sáp Thơm Vĩnh Cửu · 294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM
                      </p>
                    </div>

                    {/* Greeting & Confirmation Note */}
                    <div className="space-y-2 text-xs sm:text-sm text-stone-700 leading-relaxed">
                      <p>Kính gửi Quý khách <strong>{selectedEmail.recipientName}</strong>,</p>
                      <p>
                        Cảm ơn Quý khách đã tin tưởng lựa chọn <strong>Rose</strong>. Đơn hàng hoa sáp thơm mã số{' '}
                        <strong className="font-mono text-stone-900">{selectedEmail.orderId}</strong> của Quý khách đã được tiệm hoa tại <strong>294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM</strong> tiếp nhận và đang được nghệ nhân hoàn thiện chu đáo.
                      </p>
                    </div>

                    {/* Delivery Summary Box */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs space-y-2">
                      <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-2">
                        Thông Tin Giao Hoa:
                      </h4>
                      <div className="flex items-start gap-2 text-stone-700">
                        <MapPin className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                        <span><strong>Địa chỉ:</strong> {selectedEmail.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-700">
                        <Calendar className="w-4 h-4 text-stone-600 shrink-0" />
                        <span><strong>Thời gian:</strong> {selectedEmail.deliveryTime}</span>
                      </div>
                      {selectedEmail.greetingMessage && (
                        <div className="pt-2 border-t border-stone-100">
                          <span className="text-stone-500 block mb-1">Lời chúc trên thiệp thủ công:</span>
                          <p className="italic text-stone-800 bg-[#FAF8F5] p-2.5 rounded border border-stone-200">
                            "{selectedEmail.greetingMessage}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Items table */}
                    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                          <tr>
                            <th className="p-3">Sản phẩm</th>
                            <th className="p-3 text-center">SL</th>
                            <th className="p-3 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {selectedEmail.itemsSummary.map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-3">
                                <span className="font-medium text-stone-900 block">{item.name}</span>
                                <span className="text-[10px] text-stone-500">{item.variant}</span>
                              </td>
                              <td className="p-3 text-center font-mono">{item.quantity}</td>
                              <td className="p-3 text-right font-mono font-medium">{formatVND(item.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-stone-50/80 border-t border-stone-200 font-bold text-stone-900">
                          <tr>
                            <td colSpan={2} className="p-3 text-right">Tổng thanh toán:</td>
                            <td className="p-3 text-right font-mono text-sm text-rose-800">
                              {formatVND(selectedEmail.totalAmount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Action link inside email */}
                    <div className="text-center pt-2">
                      <button
                        onClick={() => {
                          dispatch({ type: 'SET_MODAL', payload: { modal: 'isGmailOpen', isOpen: false } });
                          dispatch({ type: 'SET_TRACKING_ORDER_ID', payload: selectedEmail.orderId });
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Xem Trực Tuyến Tiến Độ Giao Hoa</span>
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-6 border-t border-rose-200 text-[11px] text-stone-500 space-y-1">
                      <p>Hotline/Zalo 24/7: 0888 208 306 · Email: nguyenthiendoan2@gmail.com</p>
                      <p>© 2026 Rose - Tiệm Hoa Sáp Thơm (294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM).</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

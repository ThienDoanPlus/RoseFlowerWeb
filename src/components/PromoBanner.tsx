/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, X, Gift } from 'lucide-react';
import { useStore } from '../store';

export const PromoBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { dispatch } = useStore();

  if (isDismissed) return null;

  return (
    <aside aria-label="Khuyến mãi đặc biệt" className="bg-rose-950 text-rose-100 text-xs py-2 px-4 border-b border-rose-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 text-center flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-medium text-rose-300">
            <Gift className="w-3.5 h-3.5 text-rose-400" />
            Rose (294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM):
          </span>
          <span className="text-rose-200">
            Nhập mã <strong className="text-white bg-rose-900 px-1.5 py-0.5 rounded font-mono">ROSE10</strong> giảm 10% · Hoa sáp thơm lưu hương 3-5 năm · Giao hỏa tốc 45 phút
          </span>
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCartOpen', isOpen: true } })}
            className="underline hover:text-white ml-2 transition-colors cursor-pointer text-rose-100"
          >
            Xem giỏ hàng
          </button>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-rose-400 hover:text-rose-100 p-1 cursor-pointer transition-colors"
          title="Đóng thông báo"
          aria-label="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

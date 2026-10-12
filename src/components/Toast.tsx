/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../store';

export const Toast: React.FC = () => {
  const { state, dispatch } = useStore();
  const toast = state.toast;

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm animate-in slide-in-from-bottom-3 duration-200">
      <div className="bg-stone-900 text-white rounded-xl p-3.5 shadow-2xl border border-stone-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span className="font-medium text-stone-100">{toast.message}</span>
        </div>

        <button
          onClick={() => dispatch({ type: 'SHOW_TOAST', payload: null })}
          className="text-stone-400 hover:text-white p-0.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

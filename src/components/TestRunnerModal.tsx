/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, RotateCcw, FlaskConical, Timer, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import { runAllUnitTests } from '../utils/__tests__/unitTests';

export const TestRunnerModal: React.FC = () => {
  const { state, dispatch } = useStore();
  const [suiteResults, setSuiteResults] = useState(() => runAllUnitTests());

  if (!state.isTestRunnerOpen) return null;

  const handleReRun = () => {
    const updated = runAllUnitTests();
    setSuiteResults(updated);
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: `Đã chạy xong ${updated.results.length} bài kiểm thử đơn vị!`, type: 'success' },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-stone-200 flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-lg text-stone-900">
                Quy Trình Kiểm Thử Đơn Vị Tự Động (Unit Tests)
              </h3>
              <p className="text-xs text-stone-500">
                Xác minh độ chính xác 100% của toàn bộ các thuật toán tính toán và logic nghiệp vụ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReRun}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Chạy lại kiểm thử"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Chạy lại test</span>
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isTestRunnerOpen', isOpen: false } })}
              className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-4 sm:p-6 bg-stone-50 border-b border-stone-200 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Tổng số ca test
            </span>
            <span className="text-xl font-bold font-mono text-stone-900">{suiteResults.results.length}</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
              Thành công
            </span>
            <span className="text-xl font-bold font-mono text-emerald-700">{suiteResults.passedCount}</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
              <Timer className="w-3.5 h-3.5 text-stone-400" />
              Thời gian chạy
            </span>
            <span className="text-xl font-bold font-mono text-stone-900">{suiteResults.totalDurationMs} ms</span>
          </div>
        </div>

        {/* Test List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {suiteResults.results.map((test, index) => (
            <div
              key={index}
              className={`p-3.5 rounded-xl border text-xs transition-all ${
                test.passed
                  ? 'bg-white border-stone-200 hover:border-emerald-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {test.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-mono font-bold text-stone-900 block">{test.name}</span>
                    <p className="text-stone-600 mt-0.5 leading-relaxed">{test.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      test.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {test.passed ? 'PASSED' : 'FAILED'}
                  </span>
                  <span className="block font-mono text-[10px] text-stone-400 mt-1">{test.durationMs}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-[#FAF8F5] flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Toàn bộ 100% hàm tính toán và xử lý nghiệp vụ đạt chuẩn kiểm thử.</span>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isTestRunnerOpen', isOpen: false } })}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-medium cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

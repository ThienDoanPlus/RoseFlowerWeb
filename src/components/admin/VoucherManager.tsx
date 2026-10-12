/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Tag, Edit, Trash2, Calendar, Sparkles, X, CheckCircle, Percent, AlertCircle } from 'lucide-react';
import { useStore } from '../../store';
import { Voucher } from '../../types';
import { formatVND } from '../../utils/calculations';

export const VoucherManager: React.FC = () => {
  const { state, dispatch } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [deleteCandidateCode, setDeleteCandidateCode] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Voucher>>({
    code: '',
    title: '',
    description: '',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrderValue: 500000,
    maxDiscountAmount: 150000,
    minQuantity: 1,
    isHolidaySpecial: false,
    holidayTag: 'Quốc Tế Phụ Nữ 8/3',
    validUntil: '2026-12-31',
  });

  const handleOpenAdd = () => {
    setEditingVoucher(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: 15,
      minOrderValue: 500000,
      maxDiscountAmount: 200000,
      minQuantity: 1,
      isHolidaySpecial: false,
      holidayTag: 'Dịp Lễ Đặc Biệt',
      validUntil: '2026-12-31',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({ ...voucher });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code?.trim() || !formData.title?.trim()) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: 'Vui lòng nhập mã và tiêu đề voucher', type: 'error' },
      });
      return;
    }

    const cleanCode = formData.code.toUpperCase().trim();

    const voucherPayload: Voucher = {
      code: cleanCode,
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      discountType: formData.discountType || 'PERCENT',
      discountValue: Number(formData.discountValue) || 10,
      minOrderValue: Number(formData.minOrderValue) || 0,
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
      minQuantity: formData.minQuantity ? Number(formData.minQuantity) : undefined,
      isHolidaySpecial: formData.isHolidaySpecial ?? false,
      holidayTag: formData.holidayTag || undefined,
      validUntil: formData.validUntil || '2026-12-31',
    };

    if (editingVoucher) {
      dispatch({ type: 'UPDATE_VOUCHER', payload: voucherPayload });
    } else {
      dispatch({ type: 'ADD_VOUCHER', payload: voucherPayload });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteCandidateCode) {
      dispatch({ type: 'DELETE_VOUCHER', payload: deleteCandidateCode });
      setDeleteCandidateCode(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-display font-medium text-stone-900">
            Quản Lý Khuyến Mãi & Voucher Dịp Lễ
          </h2>
          <p className="text-xs text-stone-500">
            Cấu hình mã giảm giá ngày lễ (8/3, 20/10, Valentine, 20/11) và chính sách chiết khấu mua số lượng lớn.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Mã Voucher Mới</span>
        </button>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Mã Voucher</th>
                <th className="py-3.5 px-3">Tên Khuyến Mãi</th>
                <th className="py-3.5 px-3">Mức Chiết Khấu</th>
                <th className="py-3.5 px-3">Đơn Tối Thiểu</th>
                <th className="py-3.5 px-3">Dịp Lễ / Phân Loại</th>
                <th className="py-3.5 px-3">Hạn Dùng</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {state.vouchers.map((voucher) => (
                <tr key={voucher.code} className="hover:bg-rose-50/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-rose-950">
                    <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-md text-xs">
                      {voucher.code}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-stone-900 block">{voucher.title}</span>
                    <span className="text-[11px] text-stone-500 line-clamp-1">{voucher.description}</span>
                  </td>

                  <td className="py-3 px-3">
                    {voucher.discountType === 'PERCENT' ? (
                      <span className="font-mono font-bold text-rose-800">
                        Giảm {voucher.discountValue}%
                        {voucher.maxDiscountAmount && (
                          <span className="block text-[10px] text-stone-400 font-normal">
                            (tối đa {formatVND(voucher.maxDiscountAmount)})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-emerald-700">
                        Giảm {formatVND(voucher.discountValue)}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono text-stone-700">
                    {formatVND(voucher.minOrderValue)}
                    {voucher.minQuantity && voucher.minQuantity > 1 && (
                      <span className="block text-[10px] text-amber-700 font-sans">
                        ≥ {voucher.minQuantity} bó hoa
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    {voucher.isHolidaySpecial ? (
                      <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full font-semibold text-[10px] border border-rose-300">
                        <Sparkles className="w-3 h-3 text-rose-600" />
                        {voucher.holidayTag || 'Dịp Lễ'}
                      </span>
                    ) : (
                      <span className="text-stone-500 text-[11px]">Thường kỳ</span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                    {voucher.validUntil}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(voucher)}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                        title="Sửa voucher"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidateCode(voucher.code)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Xóa voucher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <h3 className="font-display font-medium text-lg text-stone-900">
                {editingVoucher ? `Chỉnh Sửa Mã ${editingVoucher.code}` : 'Tạo Mã Giảm Giá Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mã Code (In hoa)</label>
                  <input
                    type="text"
                    required
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="VD: WOMENSDAY83, VALENTINE142..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-rose-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tiêu Đề Voucher</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VD: Tri Ân Phụ Nữ 8/3"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mô Tả Chi Tiết</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="VD: Giảm ngay 15% tối đa 150k cho các đơn hoa sáp tình yêu"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Hình Thức Giảm</label>
                  <select
                    value={formData.discountType || 'PERCENT'}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENT' | 'FIXED' })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (₫)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Mức Giảm {formData.discountType === 'PERCENT' ? '(%)' : '(₫)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue || 0}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Giảm Tối Đa (₫)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Bỏ trống nếu không giới hạn"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Đơn Tối Thiểu (₫)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderValue || 0}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Số Lượng Bó Tối Thiểu</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.minQuantity || 1}
                    onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                    placeholder="VD: 3 bó cho đơn lớn"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Hạn Sử Dụng</label>
                  <input
                    type="date"
                    value={formData.validUntil || '2026-12-31'}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isHolidaySpecial ?? false}
                    onChange={(e) => setFormData({ ...formData, isHolidaySpecial: e.target.checked })}
                    className="rounded text-rose-800"
                  />
                  <span className="font-semibold text-stone-700">Đây là mã ngày lễ đặc biệt (Holiday Special)</span>
                </label>

                {formData.isHolidaySpecial && (
                  <div className="mt-2">
                    <label className="block font-semibold text-stone-700 mb-1">Tên Dịp Lễ</label>
                    <input
                      type="text"
                      value={formData.holidayTag || ''}
                      onChange={(e) => setFormData({ ...formData, holidayTag: e.target.value })}
                      placeholder="VD: 8/3 Quốc Tế Phụ Nữ, 20/10, Valentine 14/2, 20/11..."
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-rose-900 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {editingVoucher ? 'Cập Nhật Voucher' : 'Tạo Mã Giảm Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidateCode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center">
            <h4 className="font-display font-medium text-lg text-stone-900 mb-2">
              Xóa Mã Giảm Giá {deleteCandidateCode}?
            </h4>
            <p className="text-xs text-stone-500 mb-6">
              Khách hàng sẽ không còn áp dụng được mã voucher này khi thanh toán giỏ hàng.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteCandidateCode(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

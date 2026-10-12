/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  X,
  Image,
  DollarSign,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../store';
import { Flower } from '../../types';
import { formatVND } from '../../utils/calculations';

export const FlowerManager: React.FC = () => {
  const { state, dispatch } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFlower, setEditingFlower] = useState<Flower | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Flower>>({
    name: '',
    botanicalName: '',
    categoryId: 'hoa-hong-sap',
    basePrice: 500000,
    salePrice: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    shortDescription: '',
    description: '',
    meaning: '',
    careGuide: '',
    occasions: ['Sinh nhật', 'Valentine'],
    isInStock: true,
    isFeatured: false,
  });

  const filteredFlowers = state.flowers.filter((f) => {
    if (selectedCat !== 'all' && f.categoryId !== selectedCat) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      return (
        f.name.toLowerCase().includes(q) ||
        f.botanicalName.toLowerCase().includes(q) ||
        f.meaning.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingFlower(null);
    setFormData({
      id: `flower-custom-${Date.now()}`,
      name: '',
      botanicalName: '',
      categoryId: state.categories[1]?.id || 'hoa-hong-sap',
      basePrice: 650000,
      salePrice: 550000,
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      gallery: [],
      shortDescription: 'Bó hoa sáp thơm nghệ thuật cao cấp',
      description: 'Được gia công tỉ mỉ bằng hoa sáp 5 lớp cánh mềm mịn lưu hương vĩnh cửu.',
      meaning: 'Tình yêu nồng cháy và sự trân trọng vĩnh cửu.',
      careGuide: 'Bảo quản nơi khô ráo, tránh nước và ánh nắng trực tiếp.',
      occasions: ['Sinh nhật', 'Valentine', 'Kỷ niệm'],
      ratingAvg: 5.0,
      reviewsCount: 0,
      isInStock: true,
      isFeatured: false,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (flower: Flower) => {
    setEditingFlower(flower);
    setFormData({ ...flower });
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: 'Vui lòng nhập tên sản phẩm hoa', type: 'error' },
      });
      return;
    }

    if (editingFlower) {
      dispatch({
        type: 'UPDATE_FLOWER',
        payload: { ...(editingFlower as Flower), ...(formData as Flower) },
      });
    } else {
      const newFlower: Flower = {
        id: formData.id || `flower-${Date.now()}`,
        name: formData.name || 'Hoa Sáp Mới',
        botanicalName: formData.botanicalName || 'Everlasting Soap Rose',
        categoryId: formData.categoryId || 'hoa-hong-sap',
        basePrice: Number(formData.basePrice) || 500000,
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        gallery: [formData.imageUrl || ''],
        shortDescription: formData.shortDescription || '',
        description: formData.description || '',
        meaning: formData.meaning || '',
        careGuide: formData.careGuide || '',
        occasions: formData.occasions || ['Sinh nhật'],
        ratingAvg: 5.0,
        reviewsCount: 0,
        isInStock: formData.isInStock ?? true,
        isFeatured: formData.isFeatured ?? false,
      };
      dispatch({ type: 'ADD_FLOWER', payload: newFlower });
    }
    setIsEditModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteCandidateId) {
      dispatch({ type: 'DELETE_FLOWER', payload: deleteCandidateId });
      setDeleteCandidateId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sản phẩm hoa..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="text-xs py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg text-stone-700 focus:outline-none"
          >
            <option value="all">Tất cả danh mục</option>
            {state.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Flowers Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Sản Phẩm</th>
                <th className="py-3.5 px-3">Danh Mục</th>
                <th className="py-3.5 px-3">Giá Gốc / Khuyến Mãi</th>
                <th className="py-3.5 px-3">Trạng Thái Kho</th>
                <th className="py-3.5 px-3">Nổi Bật</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {filteredFlowers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-stone-400">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                filteredFlowers.map((flower) => (
                  <tr key={flower.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={flower.imageUrl}
                        alt={flower.name}
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-stone-900 block">{flower.name}</span>
                        <span className="text-[11px] text-stone-500 italic block">{flower.botanicalName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                        {flower.categoryId}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div>
                        {flower.salePrice ? (
                          <>
                            <span className="font-mono font-bold text-rose-900 text-xs">
                              {formatVND(flower.salePrice)}
                            </span>
                            <span className="font-mono text-stone-400 line-through text-[11px] block">
                              {formatVND(flower.basePrice)}
                            </span>
                          </>
                        ) : (
                          <span className="font-mono font-bold text-stone-900">
                            {formatVND(flower.basePrice)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {flower.isInStock ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[11px] border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Còn hàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-medium text-[11px] border border-red-200">
                          <XCircle className="w-3 h-3" />
                          Tạm hết
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {flower.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium text-[11px] border border-amber-200">
                          <Sparkles className="w-3 h-3" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(flower)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidateId(flower.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Flower Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <h3 className="font-display font-medium text-lg text-stone-900">
                {editingFlower ? 'Chỉnh Sửa Sản Phẩm Hoa' : 'Thêm Mới Sản Phẩm Hoa'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tên Bó Hoa</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Rose Signature Charm - Đỏ Nhung (Mẫu 1)"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tên Tiếng Anh / Thực Vật</label>
                  <input
                    type="text"
                    value={formData.botanicalName || ''}
                    onChange={(e) => setFormData({ ...formData, botanicalName: e.target.value })}
                    placeholder="VD: Everlasting Soap Rose 99 Stems"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Danh Mục</label>
                  <select
                    value={formData.categoryId || 'hoa-hong-sap'}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  >
                    {state.categories.filter((c) => c.id !== 'tat-ca').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Giá Gốc (₫)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.basePrice || 0}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Giá Khuyến Mãi (₫)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.salePrice || ''}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Bỏ trống nếu không sale"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Link Ảnh Sản Phẩm (URL)</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Ý Nghĩa Của Hoa</label>
                  <textarea
                    rows={2}
                    value={formData.meaning || ''}
                    onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                    placeholder="VD: Biểu trưng cho tình yêu 99 năm vĩnh cửu..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Hướng Dẫn Chăm Sóc</label>
                  <textarea
                    rows={2}
                    value={formData.careGuide || ''}
                    onChange={(e) => setFormData({ ...formData, careGuide: e.target.value })}
                    placeholder="VD: Tránh tiếp xúc với nước, để nơi thoáng khí..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isInStock ?? true}
                    onChange={(e) => setFormData({ ...formData, isInStock: e.target.checked })}
                    className="rounded text-rose-800"
                  />
                  <span className="font-semibold text-stone-700">Còn hàng trong kho</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured ?? false}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-rose-800"
                  />
                  <span className="font-semibold text-stone-700">Sản phẩm nổi bật (Featured)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-rose-900 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  {editingFlower ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidateId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-display font-medium text-lg text-stone-900 mb-1">
              Xác Nhận Xóa Sản Phẩm?
            </h4>
            <p className="text-xs text-stone-500 mb-6">
              Hành động này sẽ gỡ vĩnh viễn sản phẩm khỏi danh mục hiển thị cho khách hàng.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteCandidateId(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Xóa Sản Phẩm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

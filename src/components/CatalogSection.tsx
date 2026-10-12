/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Filter,
  Heart,
  Palette,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  User,
  X,
  Layers,
  Flower as FlowerIcon,
} from 'lucide-react';
import { useStore } from '../store';
import { FlowerCard } from './FlowerCard';

export const OCCASIONS_LIST = [
  { id: 'tat-ca', label: 'Tất cả các dịp' },
  { id: 'sinh-nhat', label: 'Sinh nhật', subtitle: 'Bạn bè, người yêu, ba mẹ, đồng nghiệp' },
  { id: 'ky-niem', label: 'Kỷ niệm / Lãng mạn', subtitle: 'Ngày cưới, tỏ tình, kỷ niệm ngày yêu' },
  { id: 'ngay-le', label: 'Ngày lễ lớn', subtitle: '8/3, 20/10, 14/2, 20/11, Giáng sinh, Tết' },
  { id: 'khai-truong', label: 'Chúc mừng / Khai trương', subtitle: 'Thăng chức, tốt nghiệp, khai trương shop/công ty' },
  { id: 'chia-buon', label: 'Chia buồn / Tang lễ', subtitle: 'Vòng hoa kính viếng, tone màu trang nhã' },
  { id: 'ngay-thuong', label: 'Ngày thường / Không nhân dịp gì', subtitle: 'Tặng bất ngờ, “để làm lành”' },
];

export const RECIPIENTS_LIST = [
  { id: 'tat-ca', label: 'Tất cả người nhận' },
  { id: 'nguoi-yeu', label: 'Người yêu / Crush', subtitle: 'Lãng mạn, ngọt ngào: hồng, tulip, baby' },
  { id: 'vo-chong', label: 'Vợ / Chồng', subtitle: 'Sâu sắc, son sắt và bền lâu' },
  { id: 'me-ba', label: 'Mẹ / Bà', subtitle: 'Ấm áp, kính trọng: cẩm chướng, hướng dương' },
  { id: 'doi-tac', label: 'Sếp / Đối tác / Khách hàng', subtitle: 'Sang trọng, lịch sự: lẵng hoa, lan hồ điệp' },
  { id: 'ban-be', label: 'Bạn bè / Đồng nghiệp', subtitle: 'Trẻ trung, năng động, mix màu rạng rỡ' },
];

export const DESIGN_STYLES_LIST = [
  { id: 'tat-ca', label: 'Tất cả kiểu dáng' },
  { id: 'bo-hoa', label: 'Bó hoa cầm tay', subtitle: 'Tiện tặng trực tiếp, chụp ảnh kỷ niệm' },
  { id: 'gio-hop', label: 'Giỏ hoa / Hộp hoa (Flower box)', subtitle: 'Để bàn làm việc, sang trọng, dễ bảo quản' },
  { id: 'lang-ke', label: 'Lẵng hoa / Kệ hoa lớn', subtitle: 'Dùng cho khai trương, sự kiện, hội nghị' },
  { id: 'chau-hoa', label: 'Chậu hoa / Lan hồ điệp', subtitle: 'Bền lâu, cao cấp, decor dài lâu' },
];

export const PRICE_RANGES_LIST = [
  { id: 'tat-ca', label: 'Tất cả mức giá', min: 0, max: 99999999 },
  { id: 'duoi-300k', label: 'Dưới 300.000đ', subtitle: 'Phù hợp học sinh, sinh viên, tặng bạn bè', min: 0, max: 299999 },
  { id: '300k-500k', label: '300.000đ – 500.000đ', subtitle: 'Phổ biến, dễ mua, bán chạy nhất', min: 300000, max: 500000 },
  { id: '500k-1tr', label: '500.000đ – 1.000.000đ', subtitle: 'Đẹp, trang trọng, số lượng bông lớn', min: 500000, max: 1000000 },
  { id: 'tren-1tr', label: 'Trên 1.000.000đ', subtitle: 'Cao cấp, 99 bông đại tiệc, thiết kế riêng', min: 1000001, max: 99999999 },
];

export const COLOR_TONES_LIST = [
  { id: 'tat-ca', label: 'Tất cả tone màu', dotClass: 'bg-stone-300' },
  { id: 'pastel', label: 'Tone Pastel', subtitle: 'Nhẹ nhàng, hiện đại, Hàn Quốc', dotClass: 'bg-rose-200' },
  { id: 'do-hong', label: 'Tone Đỏ / Hồng', subtitle: 'Nồng nàn, yêu thương, rực rỡ', dotClass: 'bg-rose-600' },
  { id: 'vang-cam', label: 'Tone Vàng / Cam', subtitle: 'Rực rỡ, năng lượng, khai trương', dotClass: 'bg-amber-500' },
  { id: 'trang', label: 'Tone Trắng / Tinh khôi', subtitle: 'Thanh lịch, trang nhã', dotClass: 'bg-stone-100 border border-stone-300' },
  { id: 'xanh-tim', label: 'Tone Xanh / Tím', subtitle: 'Hoàng gia, chung thủy, hy vọng', dotClass: 'bg-sky-600' },
];

export const FLOWER_TYPES_LIST = [
  { id: 'tat-ca', label: 'Tất cả loại hoa' },
  { id: 'hoa-hong', label: 'Hoa hồng sáp', subtitle: 'Biểu tượng tình yêu vĩnh cửu' },
  { id: 'tulip', label: 'Hoa tulip sáp', subtitle: 'Kiêu sa, thanh thuần, ngọt ngào' },
  { id: 'huong-duong', label: 'Hoa hướng dương sáp', subtitle: 'Ấm áp, rực rỡ, may mắn' },
  { id: 'cam-chuong', label: 'Hoa cẩm chướng / Tú cầu', subtitle: 'Ấm áp, kính trọng, biết ơn' },
  { id: 'baby', label: 'Hoa baby', subtitle: 'Mộng mơ, thuần khiết như mây trắng' },
  { id: 'mix', label: 'Mix nhiều loại hoa', subtitle: 'Phối màu nghệ thuật, sinh động' },
];

export const CatalogSection: React.FC = () => {
  const { state, dispatch } = useStore();
  const {
    flowers,
    categories,
    selectedCategory,
    selectedOccasion,
    selectedRecipient,
    selectedDesignStyle,
    selectedPriceRangeId,
    selectedColorTone,
    selectedFlowerType,
    searchQuery,
    sortBy,
  } = state;

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Check if any filter is active
  const hasActiveFilters =
    selectedCategory !== 'tat-ca' ||
    selectedOccasion !== 'tat-ca' ||
    selectedRecipient !== 'tat-ca' ||
    selectedDesignStyle !== 'tat-ca' ||
    selectedPriceRangeId !== 'tat-ca' ||
    selectedColorTone !== 'tat-ca' ||
    selectedFlowerType !== 'tat-ca' ||
    searchQuery.trim().length > 0;

  // Count number of active filters
  const activeFiltersCount = [
    selectedCategory !== 'tat-ca',
    selectedOccasion !== 'tat-ca',
    selectedRecipient !== 'tat-ca',
    selectedDesignStyle !== 'tat-ca',
    selectedPriceRangeId !== 'tat-ca',
    selectedColorTone !== 'tat-ca',
    selectedFlowerType !== 'tat-ca',
    Boolean(searchQuery.trim()),
  ].filter(Boolean).length;

  // Filter calculation using 100% real product properties
  const filteredFlowers = useMemo(() => {
    let list = [...flowers];

    // 1. Danh mục chính
    if (selectedCategory && selectedCategory !== 'tat-ca') {
      list = list.filter((f) => f.categoryId === selectedCategory);
    }

    // 2. Tìm kiếm tự do
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.botanicalName.toLowerCase().includes(q) ||
          f.meaning.toLowerCase().includes(q) ||
          f.shortDescription.toLowerCase().includes(q) ||
          (f.occasions && f.occasions.some((occ) => occ.toLowerCase().includes(q)))
      );
    }

    // 3. Dịp tặng (Occasion)
    if (selectedOccasion && selectedOccasion !== 'tat-ca') {
      list = list.filter((f) => f.occasions && f.occasions.includes(selectedOccasion));
    }

    // 4. Người nhận (Recipient)
    if (selectedRecipient && selectedRecipient !== 'tat-ca') {
      list = list.filter((f) => f.recipients && f.recipients.includes(selectedRecipient));
    }

    // 5. Kiểu dáng thiết kế (Style)
    if (selectedDesignStyle && selectedDesignStyle !== 'tat-ca') {
      list = list.filter((f) => f.designStyle === selectedDesignStyle);
    }

    // 6. Mức giá (Price Range)
    if (selectedPriceRangeId && selectedPriceRangeId !== 'tat-ca') {
      const rangeDef = PRICE_RANGES_LIST.find((r) => r.id === selectedPriceRangeId);
      if (rangeDef) {
        list = list.filter((f) => {
          const p = f.salePrice || f.basePrice;
          return p >= rangeDef.min && p <= rangeDef.max;
        });
      }
    }

    // 7. Tone màu (Color Palette)
    if (selectedColorTone && selectedColorTone !== 'tat-ca') {
      list = list.filter((f) => f.colorTone === selectedColorTone);
    }

    // 8. Loại hoa chính (Flower Type)
    if (selectedFlowerType && selectedFlowerType !== 'tat-ca') {
      list = list.filter((f) => f.flowerType === selectedFlowerType);
    }

    // 9. Sắp xếp (Sort)
    if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.ratingAvg - a.ratingAvg);
    }

    return list;
  }, [
    flowers,
    selectedCategory,
    searchQuery,
    selectedOccasion,
    selectedRecipient,
    selectedDesignStyle,
    selectedPriceRangeId,
    selectedColorTone,
    selectedFlowerType,
    sortBy,
  ]);

  return (
    <section id="collection" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-rose-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Kho Hoa Sáp Thực Tế 294 Phạm Văn Bạch (TP.HCM)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-medium text-rose-950 tracking-tight">
            Bộ Sưu Tập Hoa Sáp Thơm Vĩnh Cửu
          </h2>
          <p className="mt-2 text-stone-600 text-sm max-w-2xl">
            Tất cả hình ảnh &amp; giá tiền được lấy trực tiếp từ sản phẩm thực tế của xưởng hoa. Chọn nhanh theo dịp tặng, người nhận, kiểu dáng hoặc tone màu yêu thích.
          </p>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
              placeholder="Tìm kiếm hoa sáp, tone màu, dịp tặng..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-rose-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-800 focus:border-rose-800 transition-colors shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) =>
                dispatch({
                  type: 'SET_SORT',
                  payload: e.target.value as 'popular' | 'price-asc' | 'price-desc' | 'rating',
                })
              }
              className="py-2 px-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 cursor-pointer shadow-xs"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Categories Carousel / Segmented Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => dispatch({ type: 'SET_CATEGORY', payload: cat.id })}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-950 text-white shadow-sm ring-2 ring-rose-950 ring-offset-1'
                  : 'bg-white border border-rose-200/80 text-stone-700 hover:text-rose-900 hover:bg-rose-50/60'
              }`}
            >
              {cat.name}
              {cat.flowerCount !== undefined && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  {cat.flowerCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 6-Dimensional Multi-Category Filter Bar */}
      <div className="bg-white rounded-2xl border border-rose-200/90 p-4 sm:p-5 shadow-sm mb-6 transition-all">
        {/* Filter Bar Header & Quick Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-800">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                Bộ Lọc Nâng Cao Theo 6 Tiêu Chí
                {activeFiltersCount > 0 && (
                  <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount} đang chọn
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500">
                Lọc trực tiếp từ 78 mẫu hoa thực tế trong kho: Dịp tặng, Người nhận, Kiểu dáng, Mức giá, Tone màu, Loại hoa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={() => dispatch({ type: 'RESET_ALL_FILTERS' })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại tất cả</span>
              </button>
            )}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <span>{isFilterPanelOpen ? 'Thu gọn bộ lọc' : 'Mở rộng chi tiết'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterPanelOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* 6 Quick Dropdown Selectors (Visible on desktop & mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3">
          {/* 1. Dịp tặng */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-rose-700" />
              <span>1. Dịp tặng</span>
            </label>
            <select
              value={selectedOccasion}
              onChange={(e) => dispatch({ type: 'SET_OCCASION', payload: e.target.value })}
              className={`w-full py-1.5 px-2.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                selectedOccasion !== 'tat-ca'
                  ? 'border-rose-700 bg-rose-50/50 text-rose-950 font-medium'
                  : 'border-stone-200 bg-white text-stone-700'
              }`}
            >
              {OCCASIONS_LIST.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Người nhận */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-rose-700" />
              <span>2. Người nhận</span>
            </label>
            <select
              value={selectedRecipient}
              onChange={(e) => dispatch({ type: 'SET_RECIPIENT', payload: e.target.value })}
              className={`w-full py-1.5 px-2.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                selectedRecipient !== 'tat-ca'
                  ? 'border-rose-700 bg-rose-50/50 text-rose-950 font-medium'
                  : 'border-stone-200 bg-white text-stone-700'
              }`}
            >
              {RECIPIENTS_LIST.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Kiểu dáng thiết kế */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-rose-700" />
              <span>3. Kiểu dáng</span>
            </label>
            <select
              value={selectedDesignStyle}
              onChange={(e) => dispatch({ type: 'SET_DESIGN_STYLE', payload: e.target.value })}
              className={`w-full py-1.5 px-2.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                selectedDesignStyle !== 'tat-ca'
                  ? 'border-rose-700 bg-rose-50/50 text-rose-950 font-medium'
                  : 'border-stone-200 bg-white text-stone-700'
              }`}
            >
              {DESIGN_STYLES_LIST.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Mức giá */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-rose-700" />
              <span>4. Mức giá</span>
            </label>
            <select
              value={selectedPriceRangeId}
              onChange={(e) => dispatch({ type: 'SET_PRICE_RANGE_ID', payload: e.target.value })}
              className={`w-full py-1.5 px-2.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                selectedPriceRangeId !== 'tat-ca'
                  ? 'border-rose-700 bg-rose-50/50 text-rose-950 font-medium'
                  : 'border-stone-200 bg-white text-stone-700'
              }`}
            >
              {PRICE_RANGES_LIST.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Tone màu */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
              <Palette className="w-3 h-3 text-rose-700" />
              <span>5. Tone màu</span>
            </label>
            <select
              value={selectedColorTone}
              onChange={(e) => dispatch({ type: 'SET_COLOR_TONE', payload: e.target.value })}
              className={`w-full py-1.5 px-2.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                selectedColorTone !== 'tat-ca'
                  ? 'border-rose-700 bg-rose-50/50 text-rose-950 font-medium'
                  : 'border-stone-200 bg-white text-stone-700'
              }`}
            >
              {COLOR_TONES_LIST.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Loại hoa chính */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
              <FlowerIcon className="w-3 h-3 text-rose-700" />
              <span>6. Loại hoa</span>
            </label>
            <select
              value={selectedFlowerType}
              onChange={(e) => dispatch({ type: 'SET_FLOWER_TYPE', payload: e.target.value })}
              className={`w-full py-1.5 px-2.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                selectedFlowerType !== 'tat-ca'
                  ? 'border-rose-700 bg-rose-50/50 text-rose-950 font-medium'
                  : 'border-stone-200 bg-white text-stone-700'
              }`}
            >
              {FLOWER_TYPES_LIST.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Detailed Expandable Panel (Rich pills with subtitles) */}
        {isFilterPanelOpen && (
          <div className="mt-5 pt-4 border-t border-stone-200/80 space-y-5 animate-in fade-in duration-200">
            {/* Tone màu trực quan */}
            <div>
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                🎨 Tone Màu Hoa Sáp Nổi Bật:
              </span>
              <div className="flex flex-wrap gap-2">
                {COLOR_TONES_LIST.map((item) => {
                  const isSelected = selectedColorTone === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => dispatch({ type: 'SET_COLOR_TONE', payload: item.id })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-rose-900 bg-rose-950 text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${item.dotClass}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dịp tặng chi tiết */}
            <div>
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                🎈 Gợi Ý Theo Dịp Tặng:
              </span>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS_LIST.map((item) => {
                  const isSelected = selectedOccasion === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => dispatch({ type: 'SET_OCCASION', payload: item.id })}
                      className={`text-left px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-rose-800 bg-rose-900 text-white shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-rose-50/50'
                      }`}
                    >
                      <span className="font-semibold block">{item.label}</span>
                      {item.subtitle && (
                        <span className={`text-[10px] block opacity-80 ${isSelected ? 'text-rose-100' : 'text-stone-500'}`}>
                          {item.subtitle}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Người nhận chi tiết */}
            <div>
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                💝 Gợi Ý Theo Người Nhận:
              </span>
              <div className="flex flex-wrap gap-2">
                {RECIPIENTS_LIST.map((item) => {
                  const isSelected = selectedRecipient === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => dispatch({ type: 'SET_RECIPIENT', payload: item.id })}
                      className={`text-left px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-rose-800 bg-rose-900 text-white shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-rose-50/50'
                      }`}
                    >
                      <span className="font-semibold block">{item.label}</span>
                      {item.subtitle && (
                        <span className={`text-[10px] block opacity-80 ${isSelected ? 'text-rose-100' : 'text-stone-500'}`}>
                          {item.subtitle}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-100 text-xs">
            <span className="text-stone-500 font-medium">Đang lọc theo:</span>

            {selectedCategory !== 'tat-ca' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-medium">
                📁 {categories.find((c) => c.id === selectedCategory)?.name}
                <button
                  onClick={() => dispatch({ type: 'SET_CATEGORY', payload: 'tat-ca' })}
                  className="hover:text-rose-950 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedOccasion !== 'tat-ca' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-medium">
                🎈 Dịp: {OCCASIONS_LIST.find((o) => o.id === selectedOccasion)?.label}
                <button
                  onClick={() => dispatch({ type: 'SET_OCCASION', payload: 'tat-ca' })}
                  className="hover:text-rose-950 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedRecipient !== 'tat-ca' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-medium">
                💝 Tặng: {RECIPIENTS_LIST.find((r) => r.id === selectedRecipient)?.label}
                <button
                  onClick={() => dispatch({ type: 'SET_RECIPIENT', payload: 'tat-ca' })}
                  className="hover:text-rose-950 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDesignStyle !== 'tat-ca' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-medium">
                🎀 Kiểu: {DESIGN_STYLES_LIST.find((s) => s.id === selectedDesignStyle)?.label}
                <button
                  onClick={() => dispatch({ type: 'SET_DESIGN_STYLE', payload: 'tat-ca' })}
                  className="hover:text-rose-950 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPriceRangeId !== 'tat-ca' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-medium">
                🏷️ Giá: {PRICE_RANGES_LIST.find((p) => p.id === selectedPriceRangeId)?.label}
                <button
                  onClick={() => dispatch({ type: 'SET_PRICE_RANGE_ID', payload: 'tat-ca' })}
                  className="hover:text-rose-950 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedColorTone !== 'tat-ca' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-medium">
                🎨 Tone: {COLOR_TONES_LIST.find((t) => t.id === selectedColorTone)?.label}
                <button
                  onClick={() => dispatch({ type: 'SET_COLOR_TONE', payload: 'tat-ca' })}
                  className="hover:text-rose-950 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedFlowerType !== 'tat-ca' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-medium">
                🌸 Loại hoa: {FLOWER_TYPES_LIST.find((f) => f.id === selectedFlowerType)?.label}
                <button
                  onClick={() => dispatch({ type: 'SET_FLOWER_TYPE', payload: 'tat-ca' })}
                  className="hover:text-rose-950 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-900 font-medium">
                🔍 Từ khóa: "{searchQuery}"
                <button
                  onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })}
                  className="hover:text-stone-950 cursor-pointer p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count & Real Data Indicator */}
      <div className="flex items-center justify-between text-xs text-stone-500 mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Tìm thấy <strong>{filteredFlowers.length}</strong> / <strong>{flowers.length}</strong> thiết kế hoa sáp thật trong kho
          </span>
        </div>
        <span className="hidden sm:inline text-stone-400">
          Chất liệu cánh sáp dập 5 lớp • Lưu hương 3-5 năm • Giao hỏa tốc TP.HCM 45-60p
        </span>
      </div>

      {/* Product Cards Grid */}
      {filteredFlowers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredFlowers.map((flower) => (
            <FlowerCard key={flower.id} flower={flower} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center text-rose-700">
            <Filter className="w-8 h-8 opacity-70" />
          </div>
          <p className="text-stone-800 font-semibold text-lg mb-2">Không tìm thấy mẫu hoa phù hợp với bộ lọc</p>
          <p className="text-stone-500 text-xs mb-6 max-w-md mx-auto leading-relaxed">
            Hiện chưa có mẫu hoa nào thỏa mãn đồng thời tất cả các tiêu chí bạn vừa chọn. Vui lòng đặt lại bộ lọc để xem toàn bộ 78 thiết kế hoa sáp thực tế.
          </p>
          <button
            onClick={() => dispatch({ type: 'RESET_ALL_FILTERS' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-950 text-white text-xs font-semibold rounded-xl hover:bg-rose-900 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại tất cả bộ lọc (Xem 78 mẫu)</span>
          </button>
        </div>
      )}
    </section>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, Plus, Eye, Check } from 'lucide-react';
import { Flower } from '../types';
import { useStore } from '../store';
import { formatVND } from '../utils/calculations';

interface FlowerCardProps {
  flower: Flower;
}

export const FlowerCard: React.FC<FlowerCardProps> = ({ flower }) => {
  const { dispatch } = useStore();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const displayPrice = flower.salePrice || flower.basePrice;
  const hasDiscount = Boolean(flower.salePrice && flower.salePrice < flower.basePrice);

  return (
    <article
      className="group relative bg-white rounded-xl border border-stone-200/90 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div
        className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => dispatch({ type: 'SELECT_FLOWER', payload: flower })}
      >
        {!imageError ? (
          <img
            src={flower.imageUrl}
            alt={flower.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Zero-broken-image resilient botanical fallback */
          <div className="w-full h-full bg-gradient-to-br from-rose-50 via-stone-100 to-amber-50 flex flex-col items-center justify-center p-6 text-center">
            <span className="font-display text-lg text-stone-700 italic">{flower.name}</span>
            <span className="text-xs text-stone-400 mt-1">{flower.botanicalName}</span>
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'SELECT_FLOWER', payload: flower });
            }}
            className="px-3.5 py-2 bg-white/95 hover:bg-white text-stone-900 text-xs font-medium rounded-lg shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            title="Xem chi tiết & ý nghĩa hoa"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Chi tiết</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch({
                type: 'ADD_TO_CART',
                payload: {
                  flower,
                  sizeVariant: 'standard',
                  quantity: 1,
                },
              });
            }}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            title="Thêm nhanh vào giỏ"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Chọn nhanh</span>
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: Category and Rating (Clean unboxed text, no pills) */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="uppercase tracking-wider text-[11px] font-medium text-stone-500">
              {flower.categoryId.replace(/-/g, ' ')}
            </span>
            <div className="flex items-center gap-1 text-stone-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-xs font-mono">{flower.ratingAvg.toFixed(1)}</span>
              <span className="text-stone-400 text-[11px]">({flower.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => dispatch({ type: 'SELECT_FLOWER', payload: flower })}
            className="font-medium text-stone-900 text-base leading-snug hover:text-stone-700 transition-colors cursor-pointer line-clamp-1 mb-1"
          >
            {flower.name}
          </h3>

          {/* Botanical subtitle */}
          <p className="text-xs text-stone-500 italic mb-2 line-clamp-1">{flower.botanicalName}</p>

          {/* Meaning excerpt */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {flower.meaning}
          </p>

          {/* Mini attributes tags */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {flower.colorTone && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                {flower.colorTone === 'do-hong'
                  ? 'Tone Đỏ / Hồng'
                  : flower.colorTone === 'vang-cam'
                  ? 'Tone Vàng / Cam'
                  : flower.colorTone === 'xanh-tim'
                  ? 'Tone Xanh / Tím'
                  : flower.colorTone === 'trang'
                  ? 'Tone Trắng'
                  : 'Tone Pastel'}
              </span>
            )}
            {flower.flowerType && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-100">
                {flower.flowerType === 'hoa-hong'
                  ? 'Hồng sáp'
                  : flower.flowerType === 'tulip'
                  ? 'Tulip sáp'
                  : flower.flowerType === 'huong-duong'
                  ? 'Hướng dương'
                  : flower.flowerType === 'cam-chuong'
                  ? 'Cẩm chướng'
                  : flower.flowerType === 'baby'
                  ? 'Hoa baby'
                  : 'Mix nhiều loại'}
              </span>
            )}
            {flower.designStyle && flower.designStyle !== 'bo-hoa' && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-100">
                {flower.designStyle === 'gio-hop' ? 'Hộp / Giỏ hoa' : flower.designStyle === 'lang-ke' ? 'Lẵng kệ lớn' : 'Chậu hoa'}
              </span>
            )}
          </div>
        </div>

        {/* Pricing and Action baseline */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-semibold text-stone-900 tabular-nums">
              {formatVND(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="font-mono text-xs text-stone-400 line-through tabular-nums">
                {formatVND(flower.basePrice)}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              dispatch({
                type: 'ADD_TO_CART',
                payload: {
                  flower,
                  sizeVariant: 'standard',
                  quantity: 1,
                },
              });
            }}
            className="p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title="Thêm vào giỏ"
            aria-label="Thêm vào giỏ"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </article>
  );
};

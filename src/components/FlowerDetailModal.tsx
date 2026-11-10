/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Star, Heart, Check, Clock, Shield, Sparkles, Send, Calendar, MessageSquare, Flower2, Share2, Truck } from 'lucide-react';
import { useStore } from '../store';
import { SizeVariant } from '../types';
import { formatVND } from '../utils/calculations';

export const FlowerDetailModal: React.FC = () => {
  const { state, dispatch } = useStore();
  const flower = state.selectedFlower;

  const [selectedVariant, setSelectedVariant] = useState<SizeVariant>('standard');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [personalCardMessage, setPersonalCardMessage] = useState(state.greetingCardMessage);
  const [selectedDate, setSelectedDate] = useState(state.deliveryDate);
  const [selectedSlot, setSelectedSlot] = useState(state.deliveryTimeSlot);

  // Review submission state
  const [reviewerName, setReviewerName] = useState(state.user?.name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_FLOWER', payload: null });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  // Reset image index when flower changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [flower?.id]);

  if (!flower) return null;

  const reviews = state.reviewsMap[flower.id] || [];
  const gallery = flower.gallery.length > 0 ? flower.gallery : [flower.imageUrl];

  let multiplier = 1;
  if (selectedVariant === 'deluxe') multiplier = 1.35;
  if (selectedVariant === 'premium') multiplier = 1.75;

  const baseUnitPrice = flower.salePrice || flower.basePrice;
  const currentUnitPrice = Math.round(baseUnitPrice * multiplier);

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        flower,
        sizeVariant: selectedVariant,
        quantity,
        cardMessage: personalCardMessage,
      },
    });
    dispatch({ type: 'SELECT_FLOWER', payload: null });
  };

  const handleBuyNow = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        flower,
        sizeVariant: selectedVariant,
        quantity,
        cardMessage: personalCardMessage,
      },
    });
    dispatch({ type: 'SELECT_FLOWER', payload: null });
    dispatch({ type: 'SET_MODAL', payload: { modal: 'isCheckoutOpen', isOpen: true } });
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    try {
      const shareUrl = `${window.location.origin}/san-pham/${flower.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: `Đã sao chép link sản phẩm: ${flower.name}`,
            type: 'success',
          },
        });
      }).catch(() => {
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: `Link sản phẩm: /san-pham/${flower.id}`,
            type: 'info',
          },
        });
      });
    } catch {
      // ignore
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    setTimeout(() => {
      dispatch({
        type: 'ADD_REVIEW',
        payload: {
          id: `rev-${Date.now()}`,
          flowerId: flower.id,
          authorName: reviewerName.trim() || 'Khách hàng',
          rating: reviewRating,
          comment: reviewComment.trim(),
          date: new Date().toLocaleDateString('vi-VN'),
          isVerifiedBuyer: true,
        },
      });
      setReviewComment('');
      setIsSubmittingReview(false);
    }, 300);
  };

  const sampleMessages = [
    'Chúc em sinh nhật vui vẻ, luôn rạng rỡ và hạnh phúc!',
    'Kính chúc Quý Công Ty Khai Trương Hồng Phát - Vạn Sự Hanh Thông!',
    'Kỷ niệm ngày yêu nhau, cảm ơn em đã luôn bên anh!',
    'Chúc mẹ yêu luôn mạnh khỏe, bình an bên con cháu!',
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          dispatch({ type: 'SELECT_FLOWER', payload: null });
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200">
        
        {/* Sticky Action Buttons */}
        <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleCopyShareLink}
            className="p-2 bg-white/95 hover:bg-white text-stone-700 hover:text-stone-950 rounded-full shadow-md transition-colors cursor-pointer border border-stone-200"
            title="Sao chép link chia sẻ sản phẩm"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700 hover:text-rose-900" />
          </button>
          <button
            onClick={() => dispatch({ type: 'SELECT_FLOWER', payload: null })}
            className="p-2 bg-white/95 hover:bg-white text-stone-700 hover:text-stone-950 rounded-full shadow-md transition-colors cursor-pointer border border-stone-200"
            title="Đóng cửa sổ (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 p-4 sm:p-6 sm:p-8">
          
          {/* Left Column: Gallery & Care Guide */}
          <div className="md:col-span-6 space-y-4">
            {/* Main Image */}
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm relative">
              <img
                src={gallery[activeImageIndex] || flower.imageUrl}
                alt={flower.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-2.5 right-2.5 bg-stone-900/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium">
                Xưởng hoa 294 Phạm Văn Bạch
              </div>
            </div>

            {/* Thumbnail selector */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-rose-900 shadow-sm ring-1 ring-rose-900' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Commitments */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5 bg-rose-50/60 p-2 rounded-lg border border-rose-100">
                <Truck className="w-3.5 h-3.5 text-rose-800 shrink-0" />
                <span className="font-medium text-stone-800">Giao hỏa tốc 45p</span>
              </div>
              <div className="flex items-center gap-1.5 bg-rose-50/60 p-2 rounded-lg border border-rose-100">
                <Shield className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                <span className="font-medium text-stone-800">Lưu hương 3-5 năm</span>
              </div>
            </div>

            {/* Flower Meaning & Care Guide */}
            <div className="bg-stone-50 rounded-xl p-3.5 sm:p-4 border border-stone-200/80 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Flower2 className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  <span>Ý nghĩa loài hoa</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">{flower.meaning}</p>
              </div>

              <div className="pt-2 border-t border-stone-200/60">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Hướng dẫn bảo quản hoa sáp thơm</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">{flower.careGuide}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              {/* Header Info */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-stone-500 mb-1.5 sm:mb-2 pr-20 sm:pr-24">
                <span className="uppercase tracking-wider font-semibold text-[10px] sm:text-xs text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 shrink-0">
                  {flower.categoryId.replace(/-/g, ' ')}
                </span>
                <span className="text-stone-300">·</span>
                <span className="italic text-stone-500 text-[11px] sm:text-xs font-serif break-words">
                  {flower.botanicalName}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-display font-medium text-stone-900 mb-2 leading-snug sm:leading-tight pr-20 sm:pr-24 break-words">
                {flower.name}
              </h2>

              {/* Price & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-stone-200 mb-3.5 sm:mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-rose-900">
                    {formatVND(currentUnitPrice)}
                  </span>
                  {flower.salePrice && (
                    <span className="text-xs sm:text-sm font-mono text-stone-400 line-through">
                      {formatVND(Math.round(flower.basePrice * multiplier))}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-700 bg-amber-50/70 px-2.5 py-1 rounded-full border border-amber-200/50 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-bold font-mono text-stone-900">{flower.ratingAvg.toFixed(1)}</span>
                  <span className="text-stone-500 text-[11px]">({reviews.length} đánh giá)</span>
                </div>
              </div>

              {/* Short description */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-3.5 sm:mb-4 break-words">
                {flower.shortDescription}
              </p>

              {/* Size Variant Selector */}
              <div className="mb-3.5 sm:mb-4">
                <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                  Chọn kích cỡ bó hoa:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['standard', 'deluxe', 'premium'] as SizeVariant[]).map((variant) => {
                    const isSelected = selectedVariant === variant;
                    const label = variant === 'standard' ? 'Tiêu chuẩn' : variant === 'deluxe' ? 'Thịnh soạn' : 'Vương giả';
                    const variantMultiplier = variant === 'deluxe' ? 1.35 : variant === 'premium' ? 1.75 : 1;
                    const variantPrice = Math.round(baseUnitPrice * variantMultiplier);

                    const customDesc = flower.flowerCountDescription?.[variant]?.trim();
                    const desc = customDesc || (
                      variant === 'standard'
                        ? 'Bó hoa chuẩn theo mẫu thiết kế'
                        : variant === 'deluxe'
                        ? 'Bó lớn đầy đặn, tăng 35% hoa & phụ kiện nơ lụa'
                        : 'Bó đại VIP, tăng 75% hoa kèm phụ kiện sang trọng'
                    );

                    return (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-full relative ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-md ring-1 ring-stone-900'
                            : 'border-stone-200 bg-white hover:border-stone-300 text-stone-800 hover:bg-stone-50'
                        }`}
                      >
                        <div className="w-full">
                          <div className="flex items-baseline justify-between gap-1.5 mb-1.5">
                            <span className={`text-xs font-bold tracking-wide ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                              {label}
                            </span>
                            <span className={`text-[11px] font-mono font-semibold ${isSelected ? 'text-rose-200' : 'text-rose-800'}`}>
                              {formatVND(variantPrice)}
                            </span>
                          </div>
                          <p className={`text-[11px] leading-relaxed break-words ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                            {desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Handwritten Greeting Card Input */}
              <div className="mb-3.5 sm:mb-4 bg-rose-50/50 p-3 sm:p-3.5 rounded-xl border border-rose-100">
                <label className="block text-xs font-semibold text-stone-900 mb-1.5 flex items-center justify-between flex-wrap gap-1">
                  <span className="flex items-center gap-1.5 text-rose-900">
                    <MessageSquare className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                    <span>Thiệp viết tay gửi kèm (Miễn phí):</span>
                  </span>
                  <span className="text-[10px] text-rose-600 font-medium">Miễn phí 100%</span>
                </label>
                <textarea
                  rows={2}
                  value={personalCardMessage}
                  onChange={(e) => setPersonalCardMessage(e.target.value)}
                  placeholder="Nhập lời chúc gửi gắm đến người nhận..."
                  className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sampleMessages.map((msg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPersonalCardMessage(msg)}
                      className="text-[10px] sm:text-[11px] bg-white hover:bg-rose-100 text-stone-700 px-2.5 py-1 rounded-lg border border-rose-200/60 transition-colors cursor-pointer text-left leading-snug shadow-2xs"
                    >
                      + {msg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5 sm:mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-500 shrink-0" />
                    <span>Ngày giao hoa:</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-500 shrink-0" />
                    <span>Khung giờ giao:</span>
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="Giao hỏa tốc 45-60 phút">Giao hỏa tốc 45-60 phút</option>
                    <option value="08:00 - 10:00 (Sáng)">08:00 - 10:00 (Sáng)</option>
                    <option value="10:00 - 12:00 (Trưa)">10:00 - 12:00 (Trưa)</option>
                    <option value="14:00 - 16:00 (Chiều)">14:00 - 16:00 (Chiều)</option>
                    <option value="18:00 - 20:00 (Tối)">18:00 - 20:00 (Tối)</option>
                  </select>
                </div>
              </div>

              {/* Quantity Stepper & Temporary Total */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-5 bg-stone-50/80 p-2.5 sm:p-3 rounded-xl border border-stone-200/80">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Số lượng:</span>
                  <div className="flex items-center border border-stone-300 rounded-lg bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-1.5 text-stone-600 hover:text-stone-900 text-sm cursor-pointer transition-colors active:bg-stone-100"
                      title="Giảm số lượng"
                    >
                      -
                    </button>
                    <span className="px-3.5 py-1.5 font-mono text-xs font-bold text-stone-900 border-x border-stone-200 min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3.5 py-1.5 text-stone-600 hover:text-stone-900 text-sm cursor-pointer transition-colors active:bg-stone-100"
                      title="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-xs text-stone-600 font-mono">
                  Tạm tính: <strong className="text-rose-900 text-sm font-bold">{formatVND(currentUnitPrice * quantity)}</strong>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-3 border-t border-stone-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3 px-4 bg-white border border-stone-900 text-stone-900 hover:bg-stone-100 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer text-center active:scale-98 shadow-xs"
                >
                  Thêm vào giỏ hàng
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer text-center shadow-md active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <span>Mua ngay</span>
                  <span className="font-mono">({formatVND(currentUnitPrice * quantity)})</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span>Cần tư vấn mẫu riêng?</span>
                <a
                  href="https://zalo.me/0888208306"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-800 font-semibold hover:underline"
                >
                  Zalo: 0888 208 306
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Comments Section */}
        <div className="border-t border-stone-200 p-4 sm:p-6 sm:p-8 bg-[#FCFAF7]">
          <h3 className="text-base sm:text-lg font-display font-medium text-stone-900 mb-4 flex items-center justify-between">
            <span>Đánh Giá Từ Khách Hàng ({reviews.length})</span>
            <span className="text-xs font-mono font-bold text-amber-600">
              {flower.ratingAvg.toFixed(1)} / 5.0 ★
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
            {/* Review List */}
            <div className="md:col-span-7 space-y-3 max-h-64 overflow-y-auto pr-1 sm:pr-2">
              {reviews.length === 0 ? (
                <p className="text-xs text-stone-500 italic py-4">Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-white rounded-xl border border-stone-200 text-xs shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">{rev.authorName}</span>
                        {rev.isVerifiedBuyer && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                            Đã mua hoa
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                        />
                      ))}
                    </div>

                    <p className="text-stone-700 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Submit Review Form */}
            <div className="md:col-span-5 bg-white p-4 rounded-xl border border-stone-200">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
                Gửi Đánh Giá Của Bạn
              </h4>
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Tên của bạn:</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Xếp hạng số sao:</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-stone-700 ml-2">{reviewRating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">Cảm nhận về hoa:</label>
                  <textarea
                    required
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Chất lượng hoa tươi, độ bền, dịch vụ giao hàng..."
                    className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

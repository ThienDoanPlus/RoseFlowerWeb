/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Star, Heart, Check, Clock, Shield, Sparkles, Send, Calendar, MessageSquare, Flower2 } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200">
        
        {/* Sticky Close Button */}
        <button
          onClick={() => dispatch({ type: 'SELECT_FLOWER', payload: null })}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 rounded-full shadow-md transition-colors cursor-pointer"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          
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
            </div>

            {/* Thumbnail selector */}
            {gallery.length > 1 && (
              <div className="flex gap-2">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      activeImageIndex === idx ? 'border-stone-900 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Flower Meaning & Care Guide Tabs */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Flower2 className="w-3.5 h-3.5 text-rose-700" />
                  Ý nghĩa loài hoa
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">{flower.meaning}</p>
              </div>

              <div className="pt-2 border-t border-stone-200/60">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  Hướng dẫn bảo quản hoa sáp thơm
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">{flower.careGuide}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div>
              {/* Header Info */}
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span className="uppercase tracking-wider font-medium">{flower.categoryId.replace(/-/g, ' ')}</span>
                <span>·</span>
                <span className="italic">{flower.botanicalName}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-medium text-stone-900 mb-2">
                {flower.name}
              </h2>

              {/* Price & Rating */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-stone-900">
                    {formatVND(currentUnitPrice)}
                  </span>
                  {flower.salePrice && (
                    <span className="text-sm font-mono text-stone-400 line-through">
                      {formatVND(Math.round(flower.basePrice * multiplier))}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-700">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold font-mono text-stone-900">{flower.ratingAvg.toFixed(1)}</span>
                  <span className="text-stone-400">({reviews.length} đánh giá)</span>
                </div>
              </div>

              {/* Short description */}
              <p className="text-xs text-stone-600 leading-relaxed mb-5">
                {flower.shortDescription}
              </p>

              {/* Size Variant Selector */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                  Chọn kích cỡ bó hoa:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['standard', 'deluxe', 'premium'] as SizeVariant[]).map((variant) => {
                    const isSelected = selectedVariant === variant;
                    const label = variant === 'standard' ? 'Tiêu chuẩn' : variant === 'deluxe' ? 'Thịnh soạn' : 'Vương giả';
                    const desc = flower.flowerCountDescription?.[variant];

                    return (
                      <button
                        key={variant}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                            : 'border-stone-200 bg-white hover:border-stone-300 text-stone-800'
                        }`}
                      >
                        <span className="block text-xs font-semibold">{label}</span>
                        {desc && (
                          <span className={`block text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                            {desc}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Handwritten Greeting Card Input */}
              <div className="mb-5 bg-rose-50/50 p-3.5 rounded-xl border border-rose-100">
                <label className="block text-xs font-semibold text-stone-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-rose-900">
                    <MessageSquare className="w-3.5 h-3.5 text-rose-700" />
                    Thiệp viết tay gửi kèm (Miễn phí):
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={personalCardMessage}
                  onChange={(e) => setPersonalCardMessage(e.target.value)}
                  placeholder="Nhập lời chúc gửi gắm đến người nhận..."
                  className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Số lượng:</span>
                <div className="flex items-center border border-stone-300 rounded-lg bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-stone-600 hover:text-stone-900 text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-mono text-xs font-bold text-stone-900 border-x border-stone-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-stone-600 hover:text-stone-900 text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-4 border-t border-stone-200">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="py-3 px-4 bg-white border border-stone-900 text-stone-900 hover:bg-stone-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                >
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={handleBuyNow}
                  className="py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center shadow-sm"
                >
                  Mua ngay ({formatVND(currentUnitPrice * quantity)})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Comments Section */}
        <div className="border-t border-stone-200 p-6 sm:p-8 bg-[#FCFAF7]">
          <h3 className="text-lg font-display font-medium text-stone-900 mb-4 flex items-center gap-2">
            <span>Đánh Giá Từ Khách Hàng Đã Mua ({reviews.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Review List */}
            <div className="md:col-span-7 space-y-3 max-h-64 overflow-y-auto pr-2">
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

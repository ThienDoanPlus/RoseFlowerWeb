/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  Star,
  Shield,
  Truck,
  Sparkles,
  Flower2,
  MessageSquare,
  Calendar,
  Clock,
  Check,
  ChevronRight,
  Heart,
  Eye,
  Plus,
  Send,
  CheckCircle2,
  Store
} from 'lucide-react';
import { Flower, SizeVariant } from '../types';
import { useStore } from '../store';
import { formatVND } from '../utils/calculations';

interface ProductDetailPageProps {
  flower: Flower;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ flower }) => {
  const { state, dispatch } = useStore();

  const [selectedVariant, setSelectedVariant] = useState<SizeVariant>('standard');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [personalCardMessage, setPersonalCardMessage] = useState(state.greetingCardMessage);
  const [selectedDate, setSelectedDate] = useState(state.deliveryDate);
  const [selectedSlot, setSelectedSlot] = useState(state.deliveryTimeSlot);
  const [activeTab, setActiveTab] = useState<'desc' | 'meaning' | 'care'>('desc');

  // Review submission state
  const [reviewerName, setReviewerName] = useState(state.user?.name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Reset image index when flower changes
  useEffect(() => {
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [flower.id]);

  const reviews = state.reviewsMap[flower.id] || [];
  const gallery = flower.gallery && flower.gallery.length > 0 ? flower.gallery : [flower.imageUrl];

  let multiplier = 1;
  if (selectedVariant === 'deluxe') multiplier = 1.35;
  if (selectedVariant === 'premium') multiplier = 1.75;

  const baseUnitPrice = flower.salePrice || flower.basePrice;
  const currentUnitPrice = Math.round(baseUnitPrice * multiplier);
  const originalUnitPrice = Math.round(flower.basePrice * multiplier);
  const hasDiscount = Boolean(flower.salePrice && flower.salePrice < flower.basePrice);

  const handleBackToStore = () => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' });
    dispatch({ type: 'SELECT_FLOWER', payload: null });
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  // Preset message quick choices
  const sampleMessages = [
    'Chúc em sinh nhật vui vẻ, luôn rực rỡ và hạnh phúc!',
    'Kính chúc Quý Công Ty Khai Trương Hồng Phát - Vạn Sự Hanh Thông!',
    'Kỷ niệm ngày yêu nhau, cảm ơn em đã luôn bên anh!',
    'Chúc mẹ yêu luôn mạnh khỏe, bình an và hạnh phúc!',
  ];

  // Related products: ưu tiên cùng tone màu hoặc cùng dịp lễ
  const relatedFlowers = state.flowers
    .filter(
      (f) =>
        f.id !== flower.id &&
        (f.colorTone === flower.colorTone ||
          f.occasions?.some((occ) => flower.occasions?.includes(occ)) ||
          f.categoryId === flower.categoryId ||
          f.flowerType === flower.flowerType)
    )
    .slice(0, 4);

  return (
    <div className="bg-[#FFF5F7] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-rose-200/80">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-stone-600 flex-wrap">
            <button
              onClick={handleBackToStore}
              className="hover:text-rose-900 transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-rose-700" />
              <span>Trang Chủ</span>
            </button>
            <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
            <button
              onClick={handleBackToStore}
              className="hover:text-rose-900 transition-colors font-medium cursor-pointer"
            >
              Bộ Sưu Tập
            </button>
            <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="text-stone-500 uppercase text-[11px] font-semibold tracking-wider">
              {flower.categoryId.replace(/-/g, ' ')}
            </span>
            <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="text-rose-950 font-semibold line-clamp-1 max-w-[200px] sm:max-w-xs">
              {flower.name}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToStore}
              className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Quay lại danh mục hoa"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={handleCopyShareLink}
              className="px-3.5 py-1.5 bg-rose-900 hover:bg-rose-800 text-white text-xs font-medium rounded-lg shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title="Sao chép đường dẫn chia sẻ sản phẩm này"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ link</span>
            </button>
          </div>
        </div>

        {/* Main Product Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-5 sm:p-8 lg:p-10 shadow-sm border border-rose-200/80 mb-10">
          
          {/* Left Column: Image Gallery & Guarantees */}
          <div className="lg:col-span-6 space-y-5">
            {/* Main Featured Photo */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-sm relative group">
              <img
                src={gallery[activeImageIndex] || flower.imageUrl}
                alt={flower.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-rose-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
                  Giảm giá đặc biệt
                </div>
              )}

              <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                Ảnh chụp thật xưởng hoa 294 Phạm Văn Bạch
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {gallery.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-rose-900 ring-2 ring-rose-900/30 shadow-md scale-98'
                        : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-400'
                    }`}
                  >
                    <img src={img} alt={`Góc nhìn ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Boutique Service Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-start gap-3">
                <Truck className="w-5 h-5 text-rose-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-950">Giao Hỏa Tốc 45-60 Phút</h4>
                  <p className="text-[11px] text-stone-600 mt-0.5">Nội thành TP.HCM, bảo quản hoa cẩn thận nguyên vẹn.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-950">Hoa Sáp Lưu Hương 3-5 Năm</h4>
                  <p className="text-[11px] text-stone-600 mt-0.5">Cánh sáp mềm dập nổi chân thật, tỏa hương thơm ngát.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-950">Tặng Thiệp &amp; Viết Tay</h4>
                  <p className="text-[11px] text-stone-600 mt-0.5">Thiệp thiết kế riêng nắn nót từng lời chúc yêu thương.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-950">Chụp Ảnh Duyệt Trước Khi Giao</h4>
                  <p className="text-[11px] text-stone-600 mt-0.5">Gửi ảnh qua Zalo để khách hàng an tâm tuyệt đối.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Purchase Configuration */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Category & Botanical Name */}
              <div className="flex items-center gap-2 mb-2">
                <span className="uppercase tracking-wider font-semibold text-[11px] text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200/80">
                  {flower.categoryId.replace(/-/g, ' ')}
                </span>
                <span className="text-stone-300">·</span>
                <span className="italic text-xs text-stone-500 font-serif">
                  {flower.botanicalName}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-stone-950 mb-3 leading-tight">
                {flower.name}
              </h1>

              {/* Price Block & Ratings */}
              <div className="flex flex-wrap items-baseline justify-between gap-3 pb-5 border-b border-stone-200/80 mb-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-rose-900">
                    {formatVND(currentUnitPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm sm:text-base font-mono text-stone-400 line-through">
                      {formatVND(originalUnitPrice)}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Tiết kiệm {formatVND(originalUnitPrice - currentUnitPrice)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-700 bg-amber-50/80 px-3 py-1 rounded-full border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-bold font-mono text-stone-900">{flower.ratingAvg.toFixed(1)}</span>
                  <span className="text-stone-500 text-[11px]">({reviews.length} đánh giá khách mua)</span>
                </div>
              </div>

              {/* Short Summary Description */}
              <p className="text-sm text-stone-700 leading-relaxed mb-6 font-normal">
                {flower.shortDescription}
              </p>

              {/* Size Variant Selector */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
                  Chọn Kích Thước Bó Hoa:
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
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-full relative ${
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

              {/* Handwritten Greeting Card Message Input */}
              <div className="mb-6 bg-rose-50/50 p-4 rounded-2xl border border-rose-200/80">
                <label className="block text-xs font-bold text-rose-950 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>Nội Dung Thiệp Viết Tay (Tặng Kèm Miễn Phí):</span>
                  </span>
                  <span className="text-[11px] text-rose-600 font-normal">Miễn phí 100%</span>
                </label>
                <textarea
                  rows={2}
                  value={personalCardMessage}
                  onChange={(e) => setPersonalCardMessage(e.target.value)}
                  placeholder="Nhập lời nhắn gửi gắm yêu thương đến người nhận hoa..."
                  className="w-full text-xs sm:text-sm p-3 bg-white border border-rose-200 rounded-xl text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />

                {/* Quick Message Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sampleMessages.map((msg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPersonalCardMessage(msg)}
                      className="text-[10px] bg-white text-stone-700 hover:bg-rose-100 hover:text-rose-950 px-2 py-1 rounded-md border border-rose-200/60 transition-colors cursor-pointer"
                    >
                      + {msg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Timing & Quantity Stepper */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-600" />
                    <span>Ngày Giao Hoa:</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-600" />
                    <span>Khung Giờ Giao:</span>
                  </label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                  >
                    <option value="Giao hỏa tốc 45-60 phút">Giao hỏa tốc 45-60 phút</option>
                    <option value="08:00 - 10:00 (Sáng sớm)">08:00 - 10:00 (Sáng sớm)</option>
                    <option value="10:00 - 12:00 (Trưa)">10:00 - 12:00 (Trưa)</option>
                    <option value="14:00 - 16:00 (Chiều)">14:00 - 16:00 (Chiều)</option>
                    <option value="18:00 - 20:00 (Tối hẹn hò)">18:00 - 20:00 (Tối hẹn hò)</option>
                  </select>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between sm:justify-start gap-4 mb-6">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Số lượng:</span>
                <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-stone-600 hover:text-stone-900 text-sm font-bold cursor-pointer transition-colors"
                    title="Giảm số lượng"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-mono text-xs font-bold text-stone-900 border-x border-stone-200 min-w-[42px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-stone-600 hover:text-stone-900 text-sm font-bold cursor-pointer transition-colors"
                    title="Tăng số lượng"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs text-stone-500 font-mono">
                  Tổng tạm tính: <strong className="text-stone-900 font-bold">{formatVND(currentUnitPrice * quantity)}</strong>
                </div>
              </div>
            </div>

            {/* Sticky Action CTAs */}
            <div className="space-y-3 pt-4 border-t border-stone-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-4 bg-white border-2 border-stone-900 text-stone-900 hover:bg-stone-50 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-center shadow-2xs active:scale-98 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Vào Giỏ Hàng</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-4 bg-rose-900 hover:bg-rose-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-center shadow-lg active:scale-98 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Mua Ngay ({formatVND(currentUnitPrice * quantity)})</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span>Cần tư vấn thiết kế hoa riêng?</span>
                <a
                  href="https://zalo.me/0888208306"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-800 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Chat Zalo Florist: 0888 208 306</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed In-Depth Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-rose-200/80 mb-12">
          <div className="flex border-b border-stone-200 gap-4 sm:gap-8 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-3 text-sm font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'desc' ? 'border-rose-900 text-rose-950' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Mô Tả &amp; Cảm Hứng Thiết Kế
            </button>
            <button
              onClick={() => setActiveTab('meaning')}
              className={`pb-3 text-sm font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'meaning' ? 'border-rose-900 text-rose-950' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Ý Nghĩa Loài Hoa
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-3 text-sm font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'care' ? 'border-rose-900 text-rose-950' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Bảo Quản Hoa Sáp Bền Đẹp
            </button>
          </div>

          <div className="text-sm text-stone-700 leading-relaxed">
            {activeTab === 'desc' && (
              <div className="space-y-4">
                <p>{flower.description}</p>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Thông Số Kỹ Thuật &amp; Xuất Xứ:</h4>
                  <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                    <li>Xuất xứ hoa: Tuyển chọn hoa sáp thơm cao cấp loại 1</li>
                    <li>Độ bền màu &amp; hương thơm: Lưu hương từ 3 đến 5 năm</li>
                    <li>Phong cách gói: Phong cách Hàn Quốc xếp ly bồng bềnh, phối nơ ruy băng lụa kép</li>
                    <li>Địa điểm hoàn thiện: Xưởng hoa Rose Flowers 294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'meaning' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex items-start gap-3">
                  <Flower2 className="w-5 h-5 text-rose-800 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-rose-950 text-sm mb-1">Thông Điệp Yêu Thương</h4>
                    <p className="text-stone-700">{flower.meaning}</p>
                  </div>
                </div>
                <p className="text-stone-600 text-xs">
                  Hoa sáp vĩnh cửu biểu trưng cho một tình cảm bất diệt, không phai tàn theo thời gian, là món quà hoàn hảo cho ngày kỷ niệm, ngày sinh nhật hoặc những dịp tôn vinh đặc biệt.
                </p>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-stone-950 text-sm mb-1">Hướng Dẫn Bảo Quản Từ Nghệ Nhân</h4>
                    <p className="text-stone-700">{flower.careGuide}</p>
                  </div>
                </div>
                <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
                  <li>Tránh để hoa tiếp xúc trực tiếp với nước hoặc môi trường ẩm ướt cao.</li>
                  <li>Tránh ánh nắng mặt trời chiếu gắt trong thời gian dài để bảo toàn độ tươi sáng của màu sáp.</li>
                  <li>Nếu có bụi bám, chỉ cần dùng cọ trang điểm mềm hoặc máy sấy tóc chế độ gió mát nhẹ để vệ sinh.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews & Ratings */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-rose-200/80 mb-12">
          <h3 className="text-xl sm:text-2xl font-display font-medium text-stone-900 mb-6 flex items-center justify-between">
            <span>Đánh Giá Của Khách Hàng ({reviews.length})</span>
            <div className="flex items-center gap-1 text-sm font-sans font-bold text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{flower.ratingAvg.toFixed(1)} / 5.0</span>
            </div>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-3 max-h-96 overflow-y-auto pr-2">
              {reviews.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-sm italic">
                  Chưa có nhận xét nào cho mẫu hoa này. Hãy là người đầu tiên để lại cảm nhận của bạn!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200 text-xs sm:text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{rev.authorName}</span>
                        {rev.isVerifiedBuyer && (
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                            Đã mua hàng
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                        />
                      ))}
                    </div>

                    <p className="text-stone-700 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Review Submission Form */}
            <div className="lg:col-span-5 bg-stone-50 p-5 sm:p-6 rounded-2xl border border-stone-200">
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
                Chia Sẻ Cảm Nhận Của Bạn
              </h4>
              <form onSubmit={handleSubmitReview} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Đánh giá số sao:</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold font-mono text-stone-700 ml-2">
                      {reviewRating} sao
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tên của bạn:</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="VD: Anh Minh, Chị Lan..."
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl text-stone-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nhận xét thực tế:</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Mẫu hoa đẹp, độ hoàn thiện tinh tế, giao hàng đúng hẹn..."
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl text-stone-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá Ngay'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedFlowers.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-medium text-stone-950">
                  Có Thể Bạn Cũng Thích
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Các thiết kế hoa sáp cùng phong cách tại Rose Flowers 294 Phạm Văn Bạch
                </p>
              </div>
              <button
                onClick={handleBackToStore}
                className="text-xs font-semibold text-rose-900 hover:underline cursor-pointer"
              >
                Xem tất cả mẫu hoa &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {relatedFlowers.map((rf) => (
                <div
                  key={rf.id}
                  className="bg-white rounded-2xl border border-rose-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <a
                    href={`/san-pham/${rf.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch({ type: 'NAVIGATE_TO_PRODUCT_PAGE', payload: rf });
                      window.history.pushState({ flowerId: rf.id }, '', `/san-pham/${rf.id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="block aspect-[4/3] overflow-hidden bg-stone-100 cursor-pointer"
                  >
                    <img
                      src={rf.imageUrl}
                      alt={rf.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </a>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-rose-800 tracking-wider mb-1">
                        {rf.categoryId.replace(/-/g, ' ')}
                      </div>
                      <h4 className="text-sm font-semibold text-stone-900 line-clamp-1 group-hover:text-rose-900 transition-colors">
                        <a
                          href={`/san-pham/${rf.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch({ type: 'NAVIGATE_TO_PRODUCT_PAGE', payload: rf });
                            window.history.pushState({ flowerId: rf.id }, '', `/san-pham/${rf.id}`);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {rf.name}
                        </a>
                      </h4>
                      <p className="text-xs text-stone-500 italic mt-0.5 line-clamp-1">{rf.botanicalName}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
                      <span className="font-mono font-bold text-sm text-stone-900">
                        {formatVND(rf.salePrice || rf.basePrice)}
                      </span>
                      <button
                        onClick={() => {
                          dispatch({ type: 'NAVIGATE_TO_PRODUCT_PAGE', payload: rf });
                          window.history.pushState({ flowerId: rf.id }, '', `/san-pham/${rf.id}`);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

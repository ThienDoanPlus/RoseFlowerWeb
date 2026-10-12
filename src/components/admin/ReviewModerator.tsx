/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, CheckCircle, EyeOff, Trash2, MessageSquare, ShieldCheck, Filter } from 'lucide-react';
import { useStore } from '../../store';

export const ReviewModerator: React.FC = () => {
  const { state, dispatch } = useStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'hidden'>('all');

  // Flatten all reviews across products with flower metadata
  const allReviewsWithFlower = Object.entries(state.reviewsMap).flatMap(([flowerId, reviews]) => {
    const flower = state.flowers.find((f) => f.id === flowerId);
    return reviews.map((r) => ({
      ...r,
      flowerId,
      flowerName: flower?.name || 'Hoa Sáp Rose Flowers',
      flowerImage: flower?.imageUrl || '',
    }));
  });

  const filteredReviews = allReviewsWithFlower.filter((r) => {
    const isAppr = r.isApproved ?? true;
    if (filterStatus === 'approved') return isAppr;
    if (filterStatus === 'hidden') return !isAppr;
    return true;
  });

  const handleModerate = (flowerId: string, reviewId: string, action: 'approve' | 'hide' | 'delete') => {
    dispatch({
      type: 'MODERATE_REVIEW',
      payload: { flowerId, reviewId, action },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-display font-medium text-stone-900">
            Kiểm Duyệt Đánh Giá & Bình Luận (Review Moderation)
          </h2>
          <p className="text-xs text-stone-500">
            Kiểm tra chất lượng phản hồi từ khách hàng đã mua (*Verified Buyer*), ẩn hoặc loại bỏ các bài viết spam.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              filterStatus === 'all'
                ? 'bg-rose-900 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tất cả ({allReviewsWithFlower.length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              filterStatus === 'approved'
                ? 'bg-rose-900 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Đang hiển thị
          </button>
          <button
            onClick={() => setFilterStatus('hidden')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              filterStatus === 'hidden'
                ? 'bg-rose-900 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Đã ẩn
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-stone-400 text-xs border border-stone-200">
            Không có đánh giá nào phù hợp với bộ lọc
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isApproved = rev.isApproved ?? true;

            return (
              <div
                key={rev.id}
                className={`bg-white rounded-xl p-4 sm:p-5 border transition-all text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isApproved ? 'border-stone-200 shadow-2xs' : 'border-amber-300 bg-amber-50/20 opacity-75'
                }`}
              >
                {/* Left: Review Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {rev.flowerImage && (
                      <img
                        src={rev.flowerImage}
                        alt={rev.flowerName}
                        className="w-7 h-7 rounded-md object-cover border border-stone-200 shrink-0"
                      />
                    )}
                    <span className="font-semibold text-rose-950 text-xs">{rev.flowerName}</span>

                    <span className="text-stone-300">•</span>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>

                    {rev.isVerifiedBuyer && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Đã mua hàng
                      </span>
                    )}

                    {!isApproved && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-medium border border-amber-300">
                        <EyeOff className="w-3 h-3" />
                        Đang ẩn
                      </span>
                    )}
                  </div>

                  <p className="text-stone-800 text-xs sm:text-sm italic leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-stone-500">
                    <span className="font-medium text-stone-700">{rev.authorName}</span>
                    <span>•</span>
                    <span>{rev.date || 'Gần đây'}</span>
                  </div>
                </div>

                {/* Right: Moderation Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 w-full sm:w-auto justify-end">
                  {isApproved ? (
                    <button
                      onClick={() => handleModerate(rev.flowerId, rev.id, 'hide')}
                      className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ẩn bình luận</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerate(rev.flowerId, rev.id, 'approve')}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Phê duyệt</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleModerate(rev.flowerId, rev.id, 'delete')}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa vĩnh viễn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

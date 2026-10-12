/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Clock, ShieldCheck, HeartHandshake, QrCode } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { FLOWERS } from '../data/mockData';
import { formatVND } from '../utils/calculations';

export const HeroSection: React.FC = () => {
  const { state, dispatch } = useStore();
  const flowerList = state.flowers.length > 0 ? state.flowers : FLOWERS;
  const featuredHeroFlower = flowerList.find((f) => f.basePrice === 679000) || flowerList[0];

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-rose-200/60 bg-gradient-to-b from-[#FFF5F7] via-[#FFF0F4] to-[#FFF5F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-xs uppercase tracking-widest text-rose-700 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Rose · 294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-rose-950 leading-[1.15] tracking-tight mb-6 text-balance">
              Hoa sáp thơm vĩnh cửu trao gửi yêu thương đong đầy
            </h1>

            <p className="text-base sm:text-lg text-stone-700 max-w-2xl leading-relaxed mb-8">
              Tuyển tập những đóa <strong>hoa sáp thơm cao cấp</strong> cánh dập nổi 5 lớp mềm mịn, giữ form cánh vĩnh cửu và lưu hương tinh dầu tự nhiên 3-5 năm không tàn. 
              Giao hỏa tốc 30-45 phút từ cửa hàng <strong>Rose tại 294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
              <a
                href="#collection"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-900 hover:bg-rose-800 text-white text-sm font-medium rounded-lg transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>Xem bộ sưu tập hoa sáp</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#branches"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-rose-50 text-rose-950 border border-rose-300 text-sm font-medium rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                <span>Ghé 294 Phạm Văn Bạch, TP.HCM</span>
              </a>
            </div>

            {/* Quick Metrics / Guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-rose-200/80">
              <div className="flex items-center gap-2 text-stone-800">
                <Clock className="w-4 h-4 text-rose-700 shrink-0" />
                <span className="text-xs font-medium">Hỏa tốc 30-45'</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-xs font-medium">Vĩnh cửu 3-5 năm</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800">
                <HeartHandshake className="w-4 h-4 text-rose-700 shrink-0" />
                <span className="text-xs font-medium">Tặng thiệp & túi quà</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800">
                <QrCode className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium">VietQR & Ví điện tử</span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Botanical Showcase Card */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative bg-white rounded-2xl overflow-hidden border border-rose-200 shadow-xl group cursor-pointer"
              onClick={() => dispatch({ type: 'SELECT_FLOWER', payload: featuredHeroFlower })}
            >
              <div className="aspect-[4/3] sm:aspect-[1/1] overflow-hidden bg-rose-50 relative">
                <img
                  src={featuredHeroFlower.imageUrl}
                  alt={featuredHeroFlower.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] uppercase tracking-wider text-rose-300 font-semibold block mb-1">
                    Bán chạy nhất tại Rose
                  </span>
                  <h3 className="text-xl font-display font-medium text-white mb-1">
                    {featuredHeroFlower.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-rose-100">
                    <span className="font-mono text-base font-semibold text-white">
                      {formatVND(featuredHeroFlower.salePrice || featuredHeroFlower.basePrice)}
                      {featuredHeroFlower.salePrice && (
                        <span className="text-rose-300 line-through text-xs font-normal ml-1.5">
                          {formatVND(featuredHeroFlower.basePrice)}
                        </span>
                      )}
                    </span>
                    <span className="underline group-hover:text-rose-200 transition-colors">
                      Xem chi tiết bó hoa sáp →
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

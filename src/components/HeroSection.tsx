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
    <section className="relative overflow-hidden pt-6 sm:pt-8 pb-12 sm:pb-16 lg:py-20 border-b border-rose-200/60 bg-gradient-to-b from-[#FFF5F7] via-[#FFF0F4] to-[#FFF5F7]">
      {/* Ambient Luxury Lighting Orbs (Shine & Glossy Light Pools - GPU Accelerated) */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] ambient-glow-rose rounded-full blur-xl pointer-events-none -z-0 transform-gpu" />
      <div className="absolute top-1/3 -left-36 w-[380px] h-[380px] ambient-glow-gold rounded-full blur-xl pointer-events-none -z-0 transform-gpu" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] ambient-glow-rose rounded-full blur-lg pointer-events-none -z-0 opacity-60 transform-gpu" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-xs uppercase tracking-widest text-rose-700 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Rose · 294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-rose-950 leading-[1.2] sm:leading-[1.15] tracking-tight mb-4 sm:mb-6 text-balance">
              Hoa sáp thơm vĩnh cửu trao gửi yêu thương đong đầy
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-stone-700 max-w-2xl leading-relaxed mb-6 sm:mb-8">
              Tuyển tập những đóa <strong>hoa sáp thơm cao cấp</strong> cánh dập nổi 5 lớp mềm mịn, giữ form cánh vĩnh cửu và lưu hương tinh dầu tự nhiên 3-5 năm không tàn. 
              Giao hỏa tốc 30-45 phút từ cửa hàng <strong>Rose tại 294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
              {/* Primary CTA with Continuous Luxury Shine Sweep */}
              <a
                href="#collection"
                className="shine-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 hover:from-rose-800 hover:to-rose-900 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-rose-900/30 active:scale-98 cursor-pointer relative group/cta"
              >
                <span className="relative z-10">Xem bộ sưu tập hoa sáp</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover/cta:translate-x-1 transition-transform" />
              </a>

              <a
                href="#branches"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/90 hover:bg-white text-rose-950 border border-rose-300 text-sm font-medium rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-sm"
              >
                <span>Ghé 294 Phạm Văn Bạch, TP.HCM</span>
              </a>
            </div>

            {/* Quick Metrics / Guarantees with Glassmorphism Specular Touch */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-4 sm:pt-6 border-t border-rose-200/80">
              <div className="flex items-center gap-2 text-stone-800 bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-rose-100 shadow-2xs">
                <Clock className="w-4 h-4 text-rose-700 shrink-0" />
                <span className="text-xs font-medium">Hỏa tốc 30-45'</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800 bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-rose-100 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-xs font-medium">Vĩnh cửu 3-5 năm</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800 bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-rose-100 shadow-2xs">
                <HeartHandshake className="w-4 h-4 text-rose-700 shrink-0" />
                <span className="text-xs font-medium">Tặng thiệp & túi quà</span>
              </div>
              <div className="flex items-center gap-2 text-stone-800 bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-rose-100 shadow-2xs">
                <QrCode className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-xs font-medium">VietQR chuyển khoản</span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Botanical Showcase Card with Glossy Card & Shine Effect */}
          <div className="lg:col-span-5 relative">
            {/* Luminous ambient backdrop glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-rose-400/25 via-pink-300/35 to-amber-300/25 rounded-3xl blur-2xl -z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative glossy-card rounded-2xl overflow-hidden border border-rose-200 shadow-2xl group cursor-pointer transition-transform duration-500 hover:-translate-y-1.5"
              onClick={() => dispatch({ type: 'SELECT_FLOWER', payload: featuredHeroFlower })}
            >
              <div className="aspect-[4/3] sm:aspect-[1/1] overflow-hidden bg-rose-50 relative glossy-shine-sweep">
                <img
                  src={featuredHeroFlower.imageUrl}
                  alt={featuredHeroFlower.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/85 via-rose-950/20 to-transparent" />
                
                {/* Top Glass Specular Reflection Highlight Line */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-rose-200 font-semibold mb-1 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                    Bán chạy nhất tại Rose
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-medium text-white mb-1 drop-shadow-sm">
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

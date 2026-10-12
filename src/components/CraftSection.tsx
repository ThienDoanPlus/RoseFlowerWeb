/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Shield, Heart, Feather, Droplets, Clock } from 'lucide-react';

export const CraftSection: React.FC = () => {
  return (
    <section id="craft" className="py-16 sm:py-24 bg-[#FFF0F4] border-b border-rose-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-rose-700 font-semibold block mb-2">
            Rose Artisanal Quality
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-medium text-rose-950 tracking-tight mb-4">
            Vì Sao Hoa Sáp Rose Được Yêu Thích?
          </h2>
          <p className="text-stone-700 text-sm leading-relaxed">
            Hoa sáp thơm cao cấp tại tiệm Rose (294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM) khắc phục trọn vẹn nhược điểm nhanh tàn của hoa tươi, 
            mang đến kỷ niệm vĩnh cửu đi cùng năm tháng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-800 mb-6">
                <Droplets className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="font-display font-medium text-xl text-stone-900 mb-3">
                1. Cánh Sáp 5 Lớp Mềm Mịn Tự Nhiên
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                Từng cánh hoa được chế tác từ phôi xà phòng thực vật cao cấp, dập gân cánh tỉ mỉ, mềm mại và chân thật đến 98% so với hoa hồng tươi nhập khẩu.
              </p>
            </div>
            <span className="text-xs font-mono text-rose-400">01 / REALISTIC TOUCH</span>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-amber-800 mb-6">
                <Feather className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-display font-medium text-xl text-stone-900 mb-3">
                2. Lưu Hương Tinh Dầu Tự Nhiên 3-5 Năm
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                Được ướp tinh dầu hoa hồng thiên nhiên dịu ngọt, an toàn cho sức khỏe. Đặt trong phòng ngủ hay bàn làm việc giúp không gian luôn thơm mát thư thái.
              </p>
            </div>
            <span className="text-xs font-mono text-rose-400">02 / LONG-LASTING AROMA</span>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-emerald-800 mb-6">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-display font-medium text-xl text-stone-900 mb-3">
                3. Bó Hoa Thủ Công Tại 294 Phạm Văn Bạch
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                Từng bó hoa được nghệ nhân phối giấy lụa Hàn Quốc cao cấp, xếp ly bồng bềnh và thắt nơ satin sang trọng. Tặng kèm thiệp viết tay nắn nót và túi quà trong suốt.
              </p>
            </div>
            <span className="text-xs font-mono text-rose-400">03 / ATELIER CRAFT</span>
          </div>

        </div>

      </div>
    </section>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Navigation, Phone, Clock, Compass, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { BRANCHES } from '../data/mockData';
import { calculateShippingFee, formatVND } from '../utils/calculations';

export const GoogleMapsSection: React.FC = () => {
  const { state, dispatch } = useStore();
  const [selectedBranchId, setSelectedBranchId] = useState(state.selectedBranch.id);
  const [customTestAddress, setCustomTestAddress] = useState('294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM');
  const [testedDistance, setTestedDistance] = useState(1.5);

  const currentBranch = BRANCHES.find((b) => b.id === selectedBranchId) || BRANCHES[0];
  const fee = calculateShippingFee(testedDistance);

  const sampleDistricts = [
    { name: 'Khu vực lân cận Phạm Văn Bạch, Tân Sơn (< 3 km)', km: 1.5, desc: 'Freeship hỏa tốc 30 phút' },
    { name: 'Gò Vấp, Tân Bình, Quận 12 (Bán kính 5.5 km)', km: 5.5, desc: 'Phí giao 25.000 ₫ (giao 45 phút)' },
    { name: 'Phú Nhuận, Tân Phú, Bình Thạnh (Bán kính 9.2 km)', km: 9.2, desc: 'Phí giao 25.000 ₫ (giao 60 phút)' },
    { name: 'Quận 1, Quận 3, Thủ Đức, Bình Tân (14.5 km)', km: 14.5, desc: 'Phí giao 45.000 ₫ đóng thùng bảo vệ' },
  ];

  return (
    <section id="branches" className="py-16 sm:py-20 bg-white border-b border-rose-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-rose-200/80">
          <div>
            <span className="text-xs uppercase tracking-widest text-rose-700 font-semibold block mb-2">
              Rose · Hệ Thống Cửa Hàng & Bán Kính Giao Hỏa Tốc
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-medium text-rose-950 tracking-tight">
              Địa Chỉ Cửa Hàng: 294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
            Kính mời Quý khách ghé trực tiếp cửa hàng Rose để ngắm và chọn những bó hoa sáp thơm ưng ý nhất. Chúng tôi giao hỏa tốc 30-45 phút khắp các quận TP.HCM.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Branch Cards & Distance Calculator */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              Chọn chi nhánh phục vụ:
            </h3>

            {BRANCHES.map((branch) => {
              const isSelected = branch.id === currentBranch.id;

              return (
                <div
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranchId(branch.id);
                    dispatch({ type: 'SET_BRANCH', payload: branch });
                  }}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-stone-900 bg-[#FAF8F5] ring-1 ring-stone-900 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm text-stone-900">{branch.name}</h4>
                    {isSelected && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Đang chọn
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <a href={`tel:${branch.phone}`} className="hover:underline font-mono">
                        {branch.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span>{branch.operatingHours}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live Distance Estimator Tool */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 mt-6">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-stone-900" />
                Kiểm tra cước vận chuyển theo cự ly
              </h4>

              <div className="space-y-2 mb-3">
                {sampleDistricts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTestedDistance(item.km);
                      dispatch({
                        type: 'UPDATE_DELIVERY_INFO',
                        payload: { distanceKm: item.km },
                      });
                    }}
                    className={`w-full p-2 rounded-lg text-left text-xs border transition-all cursor-pointer flex items-center justify-between ${
                      testedDistance === item.km
                        ? 'border-stone-900 bg-white font-medium text-stone-900 shadow-2xs'
                        : 'border-stone-200 bg-white/70 hover:bg-white text-stone-600'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="font-mono text-stone-900 font-semibold">{item.km} km</span>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                <span className="text-stone-600">Phí giao dự tính:</span>
                <span className="font-mono font-bold text-stone-900 text-sm">
                  {fee === 0 ? 'Miễn phí (Freeship)' : formatVND(fee)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Google Maps Interactive Canvas Simulation */}
          <div className="lg:col-span-7 bg-stone-100 rounded-2xl overflow-hidden border border-stone-300 shadow-md relative min-h-[420px] flex flex-col justify-between">
            {/* Map Header Toolbar */}
            <div className="bg-white/95 backdrop-blur-md px-4 py-3 border-b border-stone-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-700 animate-spin duration-1000" />
                <span className="text-xs font-semibold text-stone-900">
                  Google Maps Platform Integration · {currentBranch.city}
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-500">
                Tọa độ: {currentBranch.lat.toFixed(4)}, {currentBranch.lng.toFixed(4)}
              </span>
            </div>

            {/* Stylized Interactive Map Graphic */}
            <div className="relative flex-1 bg-[#E8ECE9] flex items-center justify-center overflow-hidden p-8 select-none">
              {/* Map grid lines simulation */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #78857c 1px, transparent 1px), linear-gradient(to bottom, #78857c 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {/* River / Road curve simulation */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" preserveAspectRatio="none">
                <path d="M0,150 Q250,50 450,220 T900,100" fill="none" stroke="#a3c4dc" strokeWidth="24" />
                <path d="M50,0 Q180,260 500,280 T800,450" fill="none" stroke="#ffffff" strokeWidth="8" />
              </svg>

              {/* Delivery Radius Circle */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-2 border-dashed border-rose-400 bg-rose-500/10 flex items-center justify-center animate-pulse">
                    <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider bg-white/90 px-2 py-0.5 rounded shadow">
                      Bán kính hỏa tốc 5km
                    </span>
                  </div>

                  {/* Center Store Pin */}
                  <div className="absolute flex flex-col items-center -translate-y-4">
                    <div className="p-2.5 bg-stone-900 text-white rounded-full shadow-xl ring-4 ring-rose-200">
                      <MapPin className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="bg-white/95 px-3 py-1 rounded-md shadow-md border border-stone-200 mt-1.5 text-center">
                      <p className="text-xs font-bold text-stone-900">{currentBranch.name}</p>
                      <p className="text-[10px] text-stone-500">{currentBranch.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Footer Action */}
            <div className="bg-white p-3.5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-stone-600">
                Địa chỉ: <strong>{currentBranch.address}</strong>
              </span>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${currentBranch.name} ${currentBranch.address}`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Mở trên Google Maps</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

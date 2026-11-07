/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-rose-950 text-rose-200 pt-12 sm:pt-16 pb-24 md:pb-12 border-t border-rose-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <h3 className="text-2xl font-display font-medium text-white tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-serif text-sm">R</span>
              <span>Rose</span>
            </h3>
            <p className="text-xs text-rose-300 leading-relaxed">
              Thương hiệu hoa sáp thơm nghệ thuật cao cấp. 
              Mỗi tác phẩm lưu giữ trọn vẹn tình cảm ngọt ngào, không bao giờ phai tàn theo thời gian.
            </p>
          </div>

          {/* Col 2: Chi nhánh */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Địa Chỉ Cửa Hàng Trực Tiếp
            </h4>
            <div className="space-y-2 text-xs text-rose-300">
              <div>
                <strong className="text-white block">Rose Flagship Store:</strong>
                <span>294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM</span>
              </div>
              <div>
                <strong className="text-white block">Thời gian mở cửa:</strong>
                <span>08:00 - 22:00 (Mở cửa tất cả các ngày trong tuần)</span>
              </div>
              <div>
                <strong className="text-white block">Dịch vụ:</strong>
                <span>Giao hoa sáp hỏa tốc 30-45' nội thành TP.HCM</span>
              </div>
            </div>
          </div>

          {/* Col 3: Hỗ trợ khách hàng */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Chăm Sóc Khách Hàng
            </h4>
            <ul className="space-y-2 text-xs text-rose-300">
              <li>
                <a href="#branches" className="hover:text-white transition-colors">Giao hỏa tốc từ 294 Phạm Văn Bạch</a>
              </li>
              <li>
                <a href="#vouchers" className="hover:text-white transition-colors">Ưu đãi hoa sáp sự kiện & số lượng lớn</a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">Đổi mới miễn phí nếu cấn móp khi vận chuyển</a>
              </li>
              <li>
                <a href="#craft" className="hover:text-white transition-colors">Hướng dẫn bảo quản hoa sáp thơm bền đẹp</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Liên hệ & Thanh toán */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Liên Hệ & Thanh Toán Bảo Mật
            </h4>
            <div className="space-y-2 text-xs text-rose-300">
              <div>
             https://scontent.fsgn2-6.fna.fbcdn.net/v/t39.30808-6/892255153_1158324637180437_4440753215310423620_n.jpg?stp=dst-jpg_tt6&cstp=mx1592x782&ctp=s1592x782&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=aa7b47&_nc_eui2=AeFoKM1j1vxTQ6B0piCFJpq7wKQdRPsaAM7ApB1E-xoAzv6xC54i1z3sK7ZFvCGeNP0U7r-N-wi-iJ4dYZ4uVrlJ&_nc_ohc=pTKJKtgjsVIQ7kNvwH5I4e0&_nc_oc=AdqxbauHvhB2xyVpPfKDGpGqOddqZ2eRIbGVRhfa0sVoWOBt7Ke-QLiQYF2A2MR5SiXW6ozNuFq_6D_Q6lSJEuGO&_nc_zt=23&_nc_ht=scontent.fsgn2-6.fna&_nc_gid=TlVq3XJbCSunQ7Z9Yif90A&_nc_ss=7b2a8&oh=00_AQSf87oY21q8IdhdwIcSGUJhm94Dnn8h1T22xpwdAQBsBg&oe=6AF50970   Hotline/Zalo: <a href="https://zalo.me/0888208306" target="_blank" rel="noreferrer" className="text-white font-mono hover:underline font-bold">0888 208 306</a>
              </div>
              <div>
                Email: <a href="mailto:nguyenthiendoan2@gmail.com" className="text-white font-mono hover:underline">nguyenthiendoan2@gmail.com</a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-rose-900 flex flex-col sm:flex-row items-center justify-between text-xs text-rose-400 gap-4">
          <p>© 2026 Rose - Tiệm Hoa Sáp Thơm Vĩnh Cửu (294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM).</p>
        </div>

      </div>
    </footer>
  );
};

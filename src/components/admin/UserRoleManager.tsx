/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ArrowRight,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../../store';
import { Role } from '../../types';

export const UserRoleManager: React.FC = () => {
  const { state, dispatch } = useStore();

  const handleRoleChange = (userId: string, newRole: Role) => {
    dispatch({
      type: 'UPDATE_USER_ROLE',
      payload: { userId, role: newRole },
    });
  };

  const handleQuickSwitchActiveRole = (role: Role) => {
    dispatch({ type: 'SET_CURRENT_ROLE', payload: role });
  };

  return (
    <div className="space-y-6">
      
      {/* Interactive RBAC Switcher Bar */}
      <div className="bg-gradient-to-r from-rose-900 to-rose-950 text-white rounded-2xl p-6 shadow-md border border-rose-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-rose-200 border border-white/20 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Công Cụ Thử Nghiệm Ma Trận Phân Quyền 3 Vai Trò (RBAC Simulator)
            </span>
            <h3 className="text-xl font-display font-medium text-white">
              Chuyển Đổi Nhanh Góc Nhìn Vai Trò Người Dùng
            </h3>
            <p className="text-xs text-rose-200/90 mt-1 max-w-xl">
              Chọn vai trò bên dưới để kiểm tra trải nghiệm giao diện và phân quyền theo chuẩn nghiệp vụ: Khách hàng mua hoa (`CUSTOMER`), Thợ cắm hoa (`STAFF`) hoặc Quản trị viên (`ADMIN`).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleQuickSwitchActiveRole('CUSTOMER')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                state.currentRole === 'CUSTOMER'
                  ? 'bg-white text-rose-950 ring-2 ring-rose-400'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              👤 Khách Hàng (CUSTOMER)
            </button>

            <button
              onClick={() => handleQuickSwitchActiveRole('STAFF')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                state.currentRole === 'STAFF'
                  ? 'bg-white text-rose-950 ring-2 ring-rose-400'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              🌸 Nhân Viên Florist (STAFF)
            </button>

            <button
              onClick={() => handleQuickSwitchActiveRole('ADMIN')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                state.currentRole === 'ADMIN'
                  ? 'bg-white text-rose-950 ring-2 ring-rose-400'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              👑 Quản Lý Tiệm (ADMIN)
            </button>
          </div>
        </div>
      </div>

      {/* RBAC Permission Matrix Reference */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
        <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
          Ma Trận Phân Quyền Hệ Thống Rose Flowers
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2 mb-2 font-semibold text-stone-900">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Khách Hàng (CUSTOMER)
            </div>
            <ul className="space-y-1 text-stone-600 text-[11px]">
              <li>✓ Xem hoa, tìm kiếm, lọc theo dịp tặng</li>
              <li>✓ Giỏ hàng, áp mã giảm giá ngày lễ</li>
              <li>✓ Chọn vị trí Maps, thanh toán VietQR / MoMo</li>
              <li>✓ Tra cứu đơn thời gian thực & đánh giá</li>
              <li className="text-red-600">✗ Không có quyền truy cập Staff & Admin</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200">
            <div className="flex items-center gap-2 mb-2 font-semibold text-rose-950">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              Nhân Viên Florist (STAFF)
            </div>
            <ul className="space-y-1 text-stone-600 text-[11px]">
              <li>✓ Bảng Kanban tiếp nhận đơn theo thời gian thực</li>
              <li>✓ In thiệp chúc mừng trang trọng cho khách</li>
              <li>✓ Cập nhật tiến độ cắm hoa & bàn giao shipper</li>
              <li>✓ Trực cửa sổ tư vấn trực tuyến cho khách</li>
              <li className="text-red-600">✗ Không được xóa hoa, không xem doanh thu</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center gap-2 mb-2 font-semibold text-amber-950">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              Quản Lý Tiệm (ADMIN)
            </div>
            <ul className="space-y-1 text-stone-600 text-[11px]">
              <li>✓ Toàn quyền bảng điều khiển tài chính & KPI</li>
              <li>✓ Thêm / Sửa / Xóa sản phẩm hoa tươi</li>
              <li>✓ Tạo mã voucher ngày lễ & chiết khấu sỉ</li>
              <li>✓ Phân quyền nhân sự & quản lý tài khoản</li>
              <li>✓ Kiểm duyệt / Ẩn các đánh giá vi phạm</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-display font-medium text-sm text-stone-900">
              Danh Sách Tài Khoản & Phân Bổ Quyền Hạn
            </h3>
            <p className="text-[11px] text-stone-500">
              Tổng cộng {state.usersList.length} tài khoản thành viên trong hệ thống
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Thành Viên</th>
                <th className="py-3.5 px-3">Email</th>
                <th className="py-3.5 px-3">Số Điện Thoại</th>
                <th className="py-3.5 px-3">Vai Trò Hiện Tại</th>
                <th className="py-3.5 px-3">Ngày Gia Nhập</th>
                <th className="py-3.5 px-4 text-right">Phân Quyền Vai Trò</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {state.usersList.map((user) => (
                <tr key={user.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-rose-300 shrink-0"
                    />
                    <div>
                      <span className="font-semibold text-stone-900 block">{user.name}</span>
                      <span className="text-[11px] text-stone-500 font-mono">{user.id}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-stone-700">
                    {user.email}
                  </td>

                  <td className="py-3 px-3 font-mono text-stone-600">
                    {user.phone || '0908 123 456'}
                  </td>

                  <td className="py-3 px-3">
                    {user.role === 'ADMIN' && (
                      <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border border-amber-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                        Quản lý (ADMIN)
                      </span>
                    )}
                    {user.role === 'STAFF' && (
                      <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border border-rose-300">
                        <UserCheck className="w-3.5 h-3.5 text-rose-700" />
                        Florist (STAFF)
                      </span>
                    )}
                    {user.role === 'CUSTOMER' && (
                      <span className="inline-flex items-center gap-1 text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full font-medium text-[11px] border border-stone-200">
                        Khách mua (CUSTOMER)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                    {user.dateJoined || '2026-01-10'}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      className="text-xs p-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-rose-800 cursor-pointer"
                    >
                      <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                      <option value="STAFF">Nhân viên Florist (STAFF)</option>
                      <option value="ADMIN">Quản lý (ADMIN)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

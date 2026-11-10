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
  Lock,
  Unlock,
  Search,
  Filter,
  History,
  X,
  Plus,
} from 'lucide-react';
import { useStore } from '../../store';
import { Role, User } from '../../types';

interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  targetUser: string;
  detail: string;
}

export const UserRoleManager: React.FC = () => {
  const { state, dispatch } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [lockedUserIds, setLockedUserIds] = useState<Record<string, boolean>>({});

  // Form State for Adding New Staff Member
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('STAFF');
  const [newUserShift, setNewUserShift] = useState('Ca Sáng (08:00 - 16:00)');

  // Initial Audit Logs for executive governance
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: '10/11/2026 14:30',
      adminName: state.user?.name || 'Nguyễn Thiện Đoàn (Admin)',
      action: 'Bổ nhiệm Florist',
      targetUser: 'Trần Thị Mai (mai.tran@roseflower.vn)',
      detail: 'Cấp quyền STAFF phụ trách cắm hoa & duyệt in thiệp tại chi nhánh 294 Phạm Văn Bạch',
    },
    {
      id: 'log-2',
      timestamp: '09/11/2026 10:15',
      adminName: state.user?.name || 'Nguyễn Thiện Đoàn (Admin)',
      action: 'Xác thực tài khoản',
      targetUser: 'Lê Hoàng Nam (nam.le@gmail.com)',
      detail: 'Khách hàng thành viên hoàn tất xác thực số điện thoại và địa chỉ giao hỏa tốc',
    },
  ]);

  const handleRoleChange = (userId: string, newRole: Role) => {
    const target = state.usersList.find((u) => u.id === userId);
    dispatch({
      type: 'UPDATE_USER_ROLE',
      payload: { userId, role: newRole },
    });

    if (target) {
      const nowStr = new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        adminName: state.user?.name || 'Admin',
        action: `Đổi vai trò thành ${newRole}`,
        targetUser: `${target.name} (${target.email})`,
        detail: `Admin đã điều chỉnh quyền từ ${target.role} sang ${newRole}`,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleToggleLockUser = (userId: string) => {
    const isCurrentlyLocked = !!lockedUserIds[userId];
    const target = state.usersList.find((u) => u.id === userId);
    setLockedUserIds((prev) => ({
      ...prev,
      [userId]: !isCurrentlyLocked,
    }));

    dispatch({
      type: 'SHOW_TOAST',
      payload: {
        message: !isCurrentlyLocked
          ? `Đã tạm khóa tài khoản của ${target?.name || userId}`
          : `Đã mở khóa tài khoản của ${target?.name || userId}`,
        type: !isCurrentlyLocked ? 'warning' : 'success',
      },
    });

    if (target) {
      const nowStr = new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        adminName: state.user?.name || 'Admin',
        action: !isCurrentlyLocked ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
        targetUser: `${target.name} (${target.email})`,
        detail: !isCurrentlyLocked
          ? 'Tạm dừng toàn bộ quyền đăng nhập và thao tác'
          : 'Khôi phục quyền truy cập hệ thống bình thường',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: 'Vui lòng nhập họ tên và email nhân sự.', type: 'error' },
      });
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '0888 208 306',
      role: newUserRole,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      dateJoined: new Date().toLocaleDateString('vi-VN'),
      savedAddress: `Chi nhánh 294 Phạm Văn Bạch (${newUserShift})`,
    };

    dispatch({ type: 'ADD_USER', payload: newUser });

    const nowStr = new Date().toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: nowStr,
      adminName: state.user?.name || 'Admin',
      action: `Thêm nhân sự (${newUserRole})`,
      targetUser: `${newUser.name} (${newUser.email})`,
      detail: `Phân bổ vào ${newUserShift}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Reset form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setIsAddUserModalOpen(false);
  };

  // Filtered users
  const filteredUsers = state.usersList.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery)) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const adminCount = state.usersList.filter((u) => u.role === 'ADMIN').length;
  const staffCount = state.usersList.filter((u) => u.role === 'STAFF').length;
  const customerCount = state.usersList.filter((u) => u.role === 'CUSTOMER').length;

  return (
    <div className="space-y-6">
      {/* RBAC Header Bar */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-stone-900 text-white rounded-2xl p-6 shadow-md border border-rose-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-rose-200 border border-white/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              Bảo Mật Phân Quyền 3 Cấp Độ (RBAC Governance)
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-medium text-white">
              Phân Quyền & Quản Trị Nhân Sự Tiệm Hoa
            </h3>
            <p className="text-xs text-rose-200/90 mt-1 max-w-2xl leading-relaxed">
              Thiết lập quyền truy cập chặt chẽ: Khách hàng (`CUSTOMER`), Thợ cắm hoa Florist (`STAFF`) hoặc Quản trị viên điều hành toàn quyền (`ADMIN`).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-stone-950" />
              <span>Thêm Nhân Sự Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Staff Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider block font-semibold">Tổng Thành Viên</span>
          <span className="text-2xl font-bold font-mono text-stone-900 block mt-1">{state.usersList.length}</span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Đã đăng ký tài khoản</span>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-900 uppercase tracking-wider font-semibold">Quản Trị Viên (ADMIN)</span>
            <ShieldCheck className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-950 block mt-1">{adminCount}</span>
          <span className="text-[11px] text-amber-800 mt-0.5 block">Toàn quyền kiểm soát & tài chính</span>
        </div>

        <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-rose-900 uppercase tracking-wider font-semibold">Florist (STAFF)</span>
            <UserCheck className="w-4 h-4 text-rose-700" />
          </div>
          <span className="text-2xl font-bold font-mono text-rose-950 block mt-1">{staffCount}</span>
          <span className="text-[11px] text-rose-800 mt-0.5 block">Cắm hoa, in thiệp, tiếp nhận đơn</span>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-blue-900 uppercase tracking-wider font-semibold">Khách Hàng (CUSTOMER)</span>
            <Users className="w-4 h-4 text-blue-700" />
          </div>
          <span className="text-2xl font-bold font-mono text-blue-950 block mt-1">{customerCount}</span>
          <span className="text-[11px] text-blue-800 mt-0.5 block">Mua hoa & nhận ưu đãi lễ</span>
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
              <li>✓ Chọn vị trí Maps, thanh toán VietQR</li>
              <li>✓ Tra cứu đơn thời gian thực & đánh giá</li>
              <li className="text-rose-700 font-semibold">✗ Không có quyền truy cập Staff & Admin</li>
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
              <li>✓ Xem ghi chú cắm hoa riêng biệt</li>
              <li className="text-rose-700 font-semibold">✗ Không xem doanh thu, không xóa hoa, không duyệt tiền</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center gap-2 mb-2 font-semibold text-amber-950">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              Quản Trị Điều Hành (ADMIN)
            </div>
            <ul className="space-y-1 text-stone-600 text-[11px]">
              <li>✓ Toàn quyền bảng điều khiển tài chính & charts KPIs</li>
              <li>✓ Phê duyệt chuyển khoản VietQR vào tài khoản Vietcombank</li>
              <li>✓ Thêm / Sửa / Xóa sản phẩm hoa sáp & cập nhật kho</li>
              <li>✓ Quản lý chiến dịch voucher ngày lễ (8/3, 20/10, Valentine)</li>
              <li>✓ Phân quyền nhân sự, khóa tài khoản, nhật ký kiểm soát</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Users Table with Filter & Search */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-medium text-sm text-stone-900">
              Danh Sách Nhân Sự & Tài Khoản Thành Viên
            </h3>
            <p className="text-[11px] text-stone-500">
              Hiển thị {filteredUsers.length} / {state.usersList.length} tài khoản
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên, email, SĐT..."
                className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-800"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="text-xs py-1.5 px-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ADMIN">Chỉ Admin</option>
              <option value="STAFF">Chỉ Staff</option>
              <option value="CUSTOMER">Chỉ Khách Hàng</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Thành Viên</th>
                <th className="py-3.5 px-3">Email</th>
                <th className="py-3.5 px-3">Số Điện Thoại</th>
                <th className="py-3.5 px-3">Vai Trò</th>
                <th className="py-3.5 px-3">Trạng Thái</th>
                <th className="py-3.5 px-3">Ngày Gia Nhập</th>
                <th className="py-3.5 px-4 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {filteredUsers.map((user) => {
                const isLocked = !!lockedUserIds[user.id];
                return (
                  <tr key={user.id} className={`transition-colors ${isLocked ? 'bg-stone-100/60 opacity-60' : 'hover:bg-rose-50/30'}`}>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-rose-300 shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-stone-900 block flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {isLocked && <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 rounded">Khóa</span>}
                        </span>
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

                    <td className="py-3 px-3">
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                          <Lock className="w-3 h-3" />
                          Tạm khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Hoạt động
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                      {user.dateJoined || '2026-01-10'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          disabled={isLocked}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                          className="text-xs p-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-rose-800 cursor-pointer disabled:opacity-50"
                        >
                          <option value="CUSTOMER">Khách hàng</option>
                          <option value="STAFF">Florist (STAFF)</option>
                          <option value="ADMIN">Quản lý (ADMIN)</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleToggleLockUser(user.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isLocked
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-stone-50 border-stone-300 text-stone-600 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Section (Nhật Ký Phân Quyền & Kiểm Soát Chặt Chẽ) */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-rose-800" />
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Nhật Ký Kiểm Soát Phân Quyền & Thao Tác Hệ Thống (Audit Trail)
            </h4>
          </div>
          <span className="text-[11px] text-stone-400">Ghi nhận bảo mật thời gian thực</span>
        </div>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900">{log.action}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-rose-900 font-medium">{log.targetUser}</span>
                </div>
                <p className="text-[11px] text-stone-600">{log.detail}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-stone-400 block font-mono">{log.timestamp}</span>
                <span className="text-[10px] text-amber-800 font-medium">Bởi: {log.adminName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Thêm Nhân Sự Mới */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddUserModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h4 className="font-display font-medium text-base text-stone-900">
                  Thêm Nhân Sự Vào Hệ Thống
                </h4>
                <p className="text-xs text-stone-500">Phân quyền làm việc tại tiệm hoa Rose</p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Họ và Tên Nhân Viên:
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ví dụ: Lê Thị Ngọc Anh"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Đăng Nhập / Gmail:
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Ví dụ: ngocanh.florist@gmail.com"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Số Điện Thoại:
                  </label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-rose-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Vai Trò Bổ Nhiệm:
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-semibold cursor-pointer"
                  >
                    <option value="STAFF">Florist (STAFF)</option>
                    <option value="ADMIN">Quản Trị (ADMIN)</option>
                    <option value="CUSTOMER">Khách Hàng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ca Làm Việc Phân Bổ:
                </label>
                <select
                  value={newUserShift}
                  onChange={(e) => setNewUserShift(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 cursor-pointer"
                >
                  <option value="Ca Sáng (08:00 - 16:00)">Ca Sáng (08:00 - 16:00)</option>
                  <option value="Ca Chiều - Tối (14:00 - 22:00)">Ca Chiều - Tối (14:00 - 22:00)</option>
                  <option value="Toàn Thời Gian (Fulltime)">Toàn Thời Gian (Fulltime)</option>
                  <option value="Xưởng Gia Công Gò Vấp">Xưởng Gia Công Gò Vấp</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Xác Nhận Thêm Nhân Sự
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

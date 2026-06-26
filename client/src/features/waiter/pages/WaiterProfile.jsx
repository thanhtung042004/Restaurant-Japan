import React from 'react';
import { UserCog, Mail, Phone, Shield, CheckCircle } from 'lucide-react';

/**
 * Trang hiển thị đơn giản cho nhân viên phục vụ (waiter).
 * Chức năng vận hành đã được tích hợp vào giao diện Quản Lý.
 * Trang này chỉ hiển thị thông tin tài khoản của nhân viên.
 */
export default function WaiterProfile({ user, onLogout }) {
  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .slice(-2)
    .join('')
    .toUpperCase() || 'NV';

  return (
    <div className="space-y-6 animate-fade-up max-w-xl">
      {/* Header */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <UserCog size={16} className="text-blue-400" />
          Thông Tin Nhân Viên
        </h1>
        <p className="section-subtitle mt-1">Tài khoản phục vụ · Sakura Restaurant</p>
      </div>

      {/* Profile Card */}
      <div className="glass-panel-luxury p-6 space-y-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-400/10 border-2 border-blue-400/30 flex items-center justify-center font-serif text-2xl text-blue-300 shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="font-serif text-xl text-cream tracking-wide">{user?.name}</h2>
            <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 text-[11px] text-blue-300">
              <UserCog size={11} />
              Nhân viên phục vụ
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-3 pt-2 border-t border-gold/10">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={14} className="text-muted shrink-0" />
            <span className="text-muted text-[11px] w-20 shrink-0">Email</span>
            <span className="text-cream text-[13px]">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone size={14} className="text-muted shrink-0" />
            <span className="text-muted text-[11px] w-20 shrink-0">Điện thoại</span>
            <span className="text-cream text-[13px]">{user?.phone || '—'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield size={14} className="text-muted shrink-0" />
            <span className="text-muted text-[11px] w-20 shrink-0">Vai trò</span>
            <span className="text-cream text-[13px] capitalize">Phục vụ (Waiter)</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle size={14} className="text-green-400 shrink-0" />
            <span className="text-muted text-[11px] w-20 shrink-0">Trạng thái</span>
            <span className="text-green-400 text-[13px]">Đang hoạt động</span>
          </div>
        </div>
      </div>

      {/* Info notice */}
      <div className="glass-panel-luxury p-4 border border-gold/10 bg-gold/3">
        <p className="text-[12px] text-muted leading-relaxed">
          <span className="text-gold font-medium">Lưu ý:</span> Các chức năng vận hành như quản lý bàn,
          gọi món và hóa đơn được quản lý bởi bộ phận quản lý nhà hàng.
          Vui lòng liên hệ quản lý nếu cần hỗ trợ.
        </p>
      </div>

      <button onClick={onLogout} className="btn-ghost flex items-center gap-2 text-wine-light hover:text-wine-bright">
        Đăng xuất
      </button>
    </div>
  );
}

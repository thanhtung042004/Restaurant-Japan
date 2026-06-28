import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Edit, Trash2, Shield, Lock, Key, Eye, EyeOff,
  RefreshCw, CheckCircle2, UserX, Search, ChevronLeft, ChevronRight,
  X, AlertCircle, Phone, Mail, Calendar, Clock
} from 'lucide-react';
import { userAPI } from '../../../../api';
import toast from 'react-hot-toast';

const ROLE_LABELS = { waiter: 'Phục Vụ', manager: 'Quản Lý', admin: 'Admin', customer: 'Khách Hàng' };
const ROLE_BADGE = { waiter: 'badge-role-waiter', manager: 'badge-role-manager', admin: 'badge-role-admin', customer: 'badge-role-customer' };
const PAGE_SIZE = 10;

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

/* ── User Detail Slide Panel ──────────────────────────── */
function UserDetailPanel({ user, onClose, onEdit, onResetPw, onDelete }) {
  if (!user) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-full w-full sm:w-96 bg-bg-2 border-l border-gold/15 z-50 flex flex-col shadow-luxury-lg animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gold/10 flex items-center gap-3 sticky top-0 bg-bg-2 z-10">
          <div className="w-12 h-12 rounded-full border border-gold/30 bg-gradient-to-br from-wood to-bg-3 flex items-center justify-center font-serif text-gold text-xl shrink-0">
            {user.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-cream truncate">{user.name}</div>
            <span className={`status-badge ${ROLE_BADGE[user.role] || ''} inline-flex items-center gap-1 mt-0.5`}>
              <Shield size={8} /> {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-cream transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Info */}
          <div className="space-y-2">
            <h4 className="luxury-label">Thông tin tài khoản</h4>
            {[
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Phone, label: 'SĐT', value: user.phone || '—' },
              { icon: Calendar, label: 'Ngày tạo', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—' },
              { icon: Clock, label: 'Cập nhật', value: user.updatedAt ? timeAgo(user.updatedAt) : '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-gold/6">
                <Icon size={13} className="text-muted shrink-0" />
                <span className="text-[10px] text-muted w-20 shrink-0">{label}</span>
                <span className="text-[11px] text-cream truncate">{value}</span>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <h4 className="luxury-label">Trạng thái</h4>
            <div className={`status-badge inline-flex items-center gap-1.5 ${user.isActive ? 'status-available' : 'status-occupied'}`}>
              {user.isActive ? <><CheckCircle2 size={10} /> Đang hoạt động</> : <><UserX size={10} /> Đã khóa</>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gold/10 flex gap-2 sticky bottom-0 bg-bg-2">
          <button onClick={() => { onEdit(user); onClose(); }} className="btn-gold flex-1 flex items-center justify-center gap-1.5">
            <Edit size={12} /> Chỉnh sửa
          </button>
          <button onClick={() => { onResetPw(user._id); onClose(); }}
            className="w-10 h-9 rounded-lg border border-blue-500/20 text-muted hover:text-blue-400 hover:border-blue-500/40 flex items-center justify-center transition-all" title="Đặt lại mật khẩu">
            <Key size={13} />
          </button>
          <button onClick={() => { onDelete(user._id); onClose(); }}
            className="w-10 h-9 rounded-lg border border-wine/20 text-muted hover:text-red-400 hover:border-wine/40 flex items-center justify-center transition-all" title="Xóa">
            <Trash2 size={13} />
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Forms
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('waiter');
  const [showPassword, setShowPassword] = useState(false);

  const [resetTargetId, setResetTargetId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const [detailUser, setDetailUser] = useState(null);

  const loadUsers = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== '') params.isActive = statusFilter;
      const res = await userAPI.getUsers(params);
      if (res.success) {
        setUsers(res.data);
        setPagination(res.pagination || { total: res.data.length, page: p, pages: 1 });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);
  useEffect(() => { loadUsers(page); }, [page, search, roleFilter, statusFilter]);

  const clearForm = () => { setUserName(''); setUserEmail(''); setUserPassword(''); setUserPhone(''); setUserRole('waiter'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editUser
        ? await userAPI.updateUser(editUser._id, { name: userName, phone: userPhone, role: userRole })
        : await userAPI.createUser({ name: userName, email: userEmail, password: userPassword, phone: userPhone, role: userRole });
      if (res.success) {
        toast.success(editUser ? 'Cập nhật thành công' : 'Tạo tài khoản thành công');
        setShowUserForm(false); setEditUser(null); clearForm(); loadUsers(page);
      }
    } catch (err) { toast.error(err.message); }
  };

  const handleToggle = async (id, cur) => {
    try {
      const res = await userAPI.updateUser(id, { isActive: !cur });
      if (res.success) { toast.success('Cập nhật trạng thái'); loadUsers(page); }
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa/vô hiệu hóa tài khoản này?')) return;
    try {
      const res = await userAPI.deleteUser(id);
      if (res.success) { toast.success('Đã xóa tài khoản'); loadUsers(page); }
    } catch (err) { toast.error(err.message); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { toast.error('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    try {
      const res = await userAPI.resetPassword(resetTargetId, { newPassword });
      if (res.success) { toast.success('Đã đặt lại mật khẩu'); setShowResetForm(false); setResetTargetId(null); setNewPassword(''); }
    } catch (err) { toast.error(err.message); }
  };

  const openEdit = (u) => { setEditUser(u); setUserName(u.name); setUserEmail(u.email); setUserPhone(u.phone || ''); setUserRole(u.role); setShowUserForm(true); };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2"><Users size={16} /> Quản Lý Tài Khoản</h1>
          <p className="section-subtitle mt-1">Tổng {pagination.total} tài khoản</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => loadUsers(page)} className="btn-ghost flex items-center gap-1.5 text-[11px]"><RefreshCw size={11} /></button>
          <button onClick={() => { setEditUser(null); clearForm(); setShowUserForm(s => !s); }} className="btn-gold flex items-center gap-1.5">
            <Plus size={12} /> Tạo Tài Khoản
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="luxury-input pl-9 text-[11px]"
            placeholder="Tìm theo tên, email, SĐT..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="luxury-input luxury-select text-[11px] w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="manager">Quản Lý</option>
          <option value="waiter">Phục Vụ</option>
          <option value="customer">Khách Hàng</option>
        </select>
        <select className="luxury-input luxury-select text-[11px] w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã khóa</option>
        </select>
        {(search || roleFilter || statusFilter) && (
          <button onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); }} className="btn-ghost text-[11px] flex items-center gap-1">
            <X size={11} /> Xóa lọc
          </button>
        )}
      </div>

      {/* User Form */}
      {showUserForm && (
        <form onSubmit={handleSubmit} className="glass-panel-luxury p-6 space-y-4 max-w-2xl">
          <h4 className="section-title">{editUser ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="luxury-label">Họ và tên</label><input className="luxury-input" value={userName} onChange={e => setUserName(e.target.value)} required /></div>
            <div><label className="luxury-label">Email</label><input type="email" className="luxury-input" value={userEmail} onChange={e => setUserEmail(e.target.value)} disabled={!!editUser} required={!editUser} /></div>
            {!editUser && (
              <div><label className="luxury-label">Mật khẩu</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} className="luxury-input pr-10" value={userPassword} onChange={e => setUserPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold">
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            )}
            <div><label className="luxury-label">Số điện thoại</label><input className="luxury-input" value={userPhone} onChange={e => setUserPhone(e.target.value)} /></div>
            <div><label className="luxury-label">Vai trò</label>
              <select className="luxury-input luxury-select" value={userRole} onChange={e => setUserRole(e.target.value)}>
                <option value="customer">Khách Hàng</option>
                <option value="waiter">Phục Vụ</option>
                <option value="manager">Quản Lý</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => { setShowUserForm(false); setEditUser(null); }} className="btn-ghost">Hủy</button>
            <button type="submit" className="btn-gold">Lưu tài khoản</button>
          </div>
        </form>
      )}

      {/* Reset password form */}
      {showResetForm && resetTargetId && (
        <form onSubmit={handleResetPassword} className="glass-panel-luxury p-5 space-y-3 max-w-sm border border-wine/20">
          <h4 className="section-title flex items-center gap-2"><Key size={13} /> Đặt lại mật khẩu</h4>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} className="luxury-input pr-10"
              placeholder="Mật khẩu mới (≥6 ký tự)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold">
              {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowResetForm(false); setNewPassword(''); }} className="btn-ghost">Hủy</button>
            <button type="submit" className="btn-gold">Xác nhận</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="glass-panel-luxury overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-xs text-muted">{error}</p>
            <button onClick={() => loadUsers(page)} className="btn-ghost text-[11px]">Thử lại</button>
          </div>
        ) : (
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th className="hidden sm:table-cell">Liên hệ</th>
                <th className="text-center">Vai trò</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-center hidden md:table-cell">Ngày tạo</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><div className="h-4 bg-bg-3/60 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-muted text-xs">
                  {search || roleFilter || statusFilter ? 'Không tìm thấy tài khoản phù hợp' : 'Chưa có tài khoản nào'}
                </td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="cursor-pointer hover:bg-gold/3" onClick={() => setDetailUser(u)}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-wood to-bg-3 border border-gold/20 flex items-center justify-center font-serif text-gold text-sm shrink-0">
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-cream">{u.name}</div>
                        <div className="text-[10px] text-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell"><span className="text-[11px]">{u.phone || '—'}</span></td>
                  <td className="text-center">
                    <span className={`status-badge ${ROLE_BADGE[u.role] || ''} inline-flex items-center gap-1`}>
                      <Shield size={8} /> {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="text-center">
                    <button onClick={e => { e.stopPropagation(); handleToggle(u._id, u.isActive); }}
                      className={`status-badge cursor-pointer inline-flex items-center gap-1 ${u.isActive ? 'status-available' : 'status-occupied'}`}>
                      {u.isActive ? <><CheckCircle2 size={9} /> Hoạt động</> : <><UserX size={9} /> Đã khóa</>}
                    </button>
                  </td>
                  <td className="text-center text-[11px] text-muted hidden md:table-cell">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="text-right">
                    <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(u)} className="w-7 h-7 rounded border border-gold/15 text-muted hover:text-gold hover:border-gold/30 flex items-center justify-center transition-all" title="Sửa">
                        <Edit size={12} />
                      </button>
                      <button onClick={() => { setResetTargetId(u._id); setShowResetForm(true); setShowUserForm(false); }}
                        className="w-7 h-7 rounded border border-blue-500/15 text-muted hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center transition-all" title="Đặt lại mật khẩu">
                        <Key size={12} />
                      </button>
                      <button onClick={() => handleDelete(u._id)}
                        className="w-7 h-7 rounded border border-wine/15 text-muted hover:text-red-400 hover:border-wine/30 flex items-center justify-center transition-all" title="Xóa">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted">
            Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)} / {pagination.total}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded border border-gold/15 text-muted hover:text-gold disabled:opacity-30 flex items-center justify-center transition-all">
              <ChevronLeft size={13} />
            </button>
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded border text-[11px] transition-all ${page === i + 1 ? 'border-gold bg-gold/10 text-gold' : 'border-gold/15 text-muted hover:text-gold'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="w-8 h-8 rounded border border-gold/15 text-muted hover:text-gold disabled:opacity-30 flex items-center justify-center transition-all">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      <UserDetailPanel
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onEdit={openEdit}
        onResetPw={(id) => { setResetTargetId(id); setShowResetForm(true); }}
        onDelete={handleDelete}
      />
    </div>
  );
}

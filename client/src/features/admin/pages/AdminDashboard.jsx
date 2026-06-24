import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Users, FileText, Settings, Activity, Plus, Edit, Trash2,
  Shield, Lock, Unlock, AlertCircle, CheckCircle2, Clock,
  Database, Server, Key, Eye, EyeOff, RefreshCw,
  BarChart3, TrendingUp, UserCheck, UserX
} from 'lucide-react';
import { invoiceAPI, menuAPI, tableAPI, userAPI } from '../../../api';

const ROLE_LABELS = { waiter: 'Phục Vụ', manager: 'Quản Lý', admin: 'Admin', customer: 'Khách Hàng' };
const ROLE_BADGE  = { waiter: 'badge-role-waiter', manager: 'badge-role-manager', admin: 'badge-role-admin', customer: 'badge-role-customer' };

const SYSTEM_LOGS = [
  { time: '16:32', icon: '🔐', msg: 'Admin đăng nhập hệ thống', type: 'info' },
  { time: '16:20', icon: '📊', msg: 'Xuất báo cáo doanh thu tháng 6', type: 'success' },
  { time: '15:58', icon: '👤', msg: 'Tạo tài khoản nhân viên mới: Trần Văn B', type: 'success' },
  { time: '15:34', icon: '⚠️', msg: 'Cảnh báo: 3 hóa đơn chưa được thanh toán', type: 'warning' },
  { time: '14:47', icon: '🍽️', msg: 'Cập nhật thực đơn: thêm 2 món mới', type: 'info' },
  { time: '14:12', icon: '🔄', msg: 'Sao lưu dữ liệu tự động thành công', type: 'success' },
  { time: '12:30', icon: '📦', msg: 'Cập nhật hệ thống v2.4.1', type: 'info' },
];

export default function AdminDashboard({ activeTab: propTab, onTabChange: propOnTabChange }) {
  const [subTab, setSubTab] = useState(propTab || 'users');

  // Keep local tab in sync with sidebar navigation
  React.useEffect(() => {
    if (propTab && ['users', 'logs', 'config', 'security'].includes(propTab)) {
      setSubTab(propTab);
    }
  }, [propTab]);

  const setTabWrapper = (tab) => {
    setSubTab(tab);
    propOnTabChange?.(tab);
  };
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // User form
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('waiter');
  const [showPassword, setShowPassword] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [userRes, sumRes] = await Promise.all([
        userAPI.getUsers({ limit: 200 }),
        invoiceAPI.getStatistics()
      ]);
      if (userRes.success) setUsers(userRes.data);
      if (sumRes.success) setSummary(sumRes.data);
    } catch (err) { toast.error('Lỗi tải dữ liệu: ' + err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const clearUserForm = () => { setUserName(''); setUserEmail(''); setUserPassword(''); setUserPhone(''); setUserRole('waiter'); };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editUser
        ? await userAPI.updateUser(editUser._id, { name: userName, phone: userPhone, role: userRole })
        : await userAPI.createUser({ name: userName, email: userEmail, password: userPassword, phone: userPhone, role: userRole });
      if (res.success) { toast.success(editUser ? 'Cập nhật thành công' : 'Tạo tài khoản thành công'); setShowUserForm(false); setEditUser(null); clearUserForm(); loadUsers(); }
    } catch (err) { toast.error(err.message); }
  };

  const handleToggleUser = async (id, cur) => {
    try { const res = await userAPI.updateUser(id, { isActive: !cur }); if (res.success) { toast.success('Cập nhật trạng thái'); loadUsers(); } } catch (err) { toast.error(err.message); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Xóa tài khoản này?')) return;
    try { const res = await userAPI.deleteUser(id); if (res.success) { toast.success('Đã xóa tài khoản'); loadUsers(); } } catch (err) { toast.error(err.message); }
  };

  // Reset password state
  const [resetTargetId, setResetTargetId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { toast.error('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    try {
      const res = await userAPI.resetPassword(resetTargetId, { newPassword });
      if (res.success) { toast.success('Đã đặt lại mật khẩu'); setShowResetForm(false); setResetTargetId(null); setNewPassword(''); }
    } catch (err) { toast.error(err.message); }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const staffCount = users.filter(u => u.role !== 'customer').length;
  const customerCount = users.filter(u => u.role === 'customer').length;

  const TAB_ITEMS = [
    { id: 'users', icon: Users, label: 'Tài Khoản' },
    { id: 'logs', icon: Activity, label: 'Nhật Ký' },
    { id: 'config', icon: Settings, label: 'Cấu Hình' },
    { id: 'security', icon: Shield, label: 'Bảo Mật' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title flex items-center gap-2"><Shield size={16} /> Admin Control Center</h1>
        <p className="section-subtitle mt-1">Quản trị hệ thống · Phân quyền · Bảo mật</p>
      </div>

      {/* System KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Tổng Tài Khoản', value: totalUsers, icon: Users, color: 'text-gold', bg: 'bg-gold/8' },
          { label: 'Đang Hoạt Động', value: activeUsers, icon: UserCheck, color: 'text-green-400', bg: 'bg-green-400/8' },
          { label: 'Nhân Viên', value: staffCount, icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/8' },
          { label: 'Khách Hàng', value: customerCount, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/8' },
        ].map((s, i) => (
          <div key={i} className="kpi-card p-4">
            <div className={`w-8 h-8 rounded-lg ${s.bg} border border-${s.color.replace('text-','')}/20 flex items-center justify-center mb-3`}>
              <s.icon size={15} className={s.color} />
            </div>
            <div className={`font-serif text-2xl ${s.color} tabular-nums`}>{s.value}</div>
            <div className="text-[10px] text-muted uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gold/10 gap-0.5 overflow-x-auto no-scrollbar">
        {TAB_ITEMS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTabWrapper(id)} className={`luxury-tab ${subTab === id ? 'active' : ''}`}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* ── USERS ── */}
      {subTab === 'users' && (
        <div className="space-y-5 animate-fade-up">
          <div className="flex justify-between items-center">
            <h3 className="section-title">Quản Lý Tài Khoản <span className="text-muted/60 normal-case text-xs ml-2">({totalUsers} tài khoản)</span></h3>
            <div className="flex gap-2">
              <button onClick={loadUsers} className="btn-ghost flex items-center gap-1.5 text-[11px]"><RefreshCw size={11} /></button>
              <button onClick={() => { setEditUser(null); clearUserForm(); setShowUserForm(true); }} className="btn-gold flex items-center gap-1.5">
                <Plus size={12} /> Tạo Tài Khoản
              </button>
            </div>
          </div>

          {showUserForm && (
            <form onSubmit={handleUserSubmit} className="glass-panel-luxury p-6 space-y-4 max-w-2xl">
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
                <div><label className="luxury-label">Vai trò (Role)</label>
                  <select className="luxury-input luxury-select" value={userRole} onChange={e => setUserRole(e.target.value)}>
                    <option value="customer">Khách Hàng</option>
                    <option value="waiter">Phục Vụ</option>
                    <option value="manager">Quản Lý</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowUserForm(false)} className="btn-ghost">Hủy</button>
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

          <div className="glass-panel-luxury overflow-hidden">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Liên hệ</th>
                  <th className="text-center">Vai trò</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-center">Ngày tạo</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-muted text-xs">Đang tải...</td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
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
                    <td><span className="text-[11px]">{u.phone || '—'}</span></td>
                    <td className="text-center">
                      <span className={`status-badge ${ROLE_BADGE[u.role] || ''} inline-flex items-center gap-1`}>
                        <Shield size={8} /> {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="text-center">
                      <button onClick={() => handleToggleUser(u._id, u.isActive)}
                        className={`status-badge cursor-pointer inline-flex items-center gap-1 ${u.isActive ? 'status-available' : 'status-occupied'}`}>
                        {u.isActive ? <><CheckCircle2 size={9} /> Hoạt động</> : <><UserX size={9} /> Đã khóa</>}
                      </button>
                    </td>
                    <td className="text-center text-[11px] text-muted">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => { setEditUser(u); setUserName(u.name); setUserEmail(u.email); setUserPhone(u.phone||''); setUserRole(u.role); setShowUserForm(true); }}
                          className="w-7 h-7 rounded border border-gold/15 text-muted hover:text-gold hover:border-gold/30 flex items-center justify-center transition-all" title="Sửa">
                          <Edit size={12} />
                        </button>
                        <button onClick={() => { setResetTargetId(u._id); setShowResetForm(true); setShowUserForm(false); }}
                          className="w-7 h-7 rounded border border-blue-500/15 text-muted hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center transition-all" title="Đặt lại mật khẩu">
                          <Key size={12} />
                        </button>
                        <button onClick={() => handleDeleteUser(u._id)}
                          className="w-7 h-7 rounded border border-wine/15 text-muted hover:text-red-400 hover:border-wine/30 flex items-center justify-center transition-all" title="Xóa">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LOGS ── */}
      {subTab === 'logs' && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex justify-between items-center">
            <h3 className="section-title">Nhật Ký Hoạt Động Hệ Thống</h3>
            <button className="btn-ghost text-[11px] flex items-center gap-1.5"><RefreshCw size={11} /> Làm mới</button>
          </div>
          <div className="glass-panel-luxury p-5">
            <div className="relative space-y-0">
              <div className="absolute left-[6px] top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-gold/10 to-transparent" />
              {SYSTEM_LOGS.map((log, i) => (
                <div key={i} className="flex gap-4 pb-5 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="relative z-10 w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 flex items-center justify-center" style={{
                    background: log.type === 'success' ? 'rgba(34,197,94,0.2)' : log.type === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(201,164,71,0.2)',
                    border: `1px solid ${log.type === 'success' ? 'rgba(34,197,94,0.5)' : log.type === 'warning' ? 'rgba(245,158,11,0.5)' : 'rgba(201,164,71,0.5)'}`
                  }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{
                      background: log.type === 'success' ? '#22c55e' : log.type === 'warning' ? '#f59e0b' : '#c9a447'
                    }} />
                  </div>
                  <div className="flex-1 flex items-start justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">{log.icon}</span>
                      <span className="text-xs text-cream-dim">{log.msg}</span>
                    </div>
                    <span className="text-[10px] text-muted shrink-0 font-mono">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIG ── */}
      {subTab === 'config' && (
        <div className="space-y-5 animate-fade-up">
          <h3 className="section-title">Cấu Hình Hệ Thống</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: Database, title: 'Sao Lưu Dữ Liệu', desc: 'Backup tự động hàng ngày lúc 02:00 AM. Giữ 30 bản sao gần nhất.', action: 'Sao Lưu Ngay', color: 'text-gold' },
              { icon: Server, title: 'Cấu Hình AI', desc: 'Gemini AI đang kết nối. Model: gemini-2.0-flash. Tokens/ngày: 1M.', action: 'Kiểm tra', color: 'text-blue-400' },
              { icon: Settings, title: 'Thông Tin Nhà Hàng', desc: 'Sakura Japanese Restaurant · Ho Chi Minh City · +84 28 3xxx xxxx', action: 'Chỉnh sửa', color: 'text-purple-400' },
              { icon: Activity, title: 'Trạng Thái Hệ Thống', desc: 'Server: Online · DB: Connected · Socket.IO: Active · Uptime: 99.8%', action: 'Xem chi tiết', color: 'text-green-400' },
            ].map((c, i) => (
              <div key={i} className="glass-card p-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-bg-3 border border-gold/15 flex items-center justify-center shrink-0">
                    <c.icon size={16} className={c.color} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-cream">{c.title}</h4>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
                <button className="btn-ghost text-[11px] self-end">{c.action}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECURITY ── */}
      {subTab === 'security' && (
        <div className="space-y-5 animate-fade-up">
          <h3 className="section-title">Bảo Mật Hệ Thống</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={14} className="text-gold" />
                <h4 className="text-xs font-semibold text-cream">Xác Thực JWT</h4>
                <span className="status-badge status-available ml-auto">Đang bật</span>
              </div>
              <div className="space-y-2">
                {['Token hết hạn: 7 ngày', 'Refresh token: 30 ngày', 'Bcrypt rounds: 12'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-muted"><CheckCircle2 size={11} className="text-green-400" /> {item}</div>
                ))}
              </div>
            </div>
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-gold" />
                <h4 className="text-xs font-semibold text-cream">Phân Quyền RBAC</h4>
                <span className="status-badge status-available ml-auto">Đang bật</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { role: 'Admin', perm: 'Toàn quyền hệ thống', badge: 'badge-role-admin' },
                  { role: 'Manager', perm: 'Quản lý vận hành', badge: 'badge-role-manager' },
                  { role: 'Waiter/Chef', perm: 'Vận hành ca', badge: 'badge-role-waiter' },
                  { role: 'Customer', perm: 'Xem & đặt bàn', badge: 'badge-role-customer' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className={`status-badge ${r.badge}`}>{r.role}</span>
                    <span className="text-muted">{r.perm}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-5 md:col-span-2 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Key size={14} className="text-gold" />
                <h4 className="text-xs font-semibold text-cream">Phiên Đăng Nhập Gần Đây</h4>
              </div>
              <div className="space-y-2">
                {[
                  { user: 'Admin', ip: '192.168.1.1', time: '16:32 hôm nay', ok: true },
                  { user: 'Manager', ip: '192.168.1.5', time: '08:14 hôm nay', ok: true },
                  { user: 'Unknown', ip: '103.21.x.x', time: '02:17 hôm nay', ok: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gold/6 text-xs">
                    <div className="flex items-center gap-2">
                      {s.ok ? <CheckCircle2 size={12} className="text-green-400" /> : <AlertCircle size={12} className="text-red-400 animate-pulse" />}
                      <span className={s.ok ? 'text-cream' : 'text-red-300 font-medium'}>{s.user}</span>
                    </div>
                    <span className="text-muted font-mono text-[10px]">{s.ip}</span>
                    <span className="text-muted text-[10px]">{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

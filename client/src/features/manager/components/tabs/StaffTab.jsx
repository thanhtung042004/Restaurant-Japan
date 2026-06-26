import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Edit, Trash2, Shield, UserCog, User,
  ArrowUpCircle, Search, ChevronDown, CheckCircle2,
  Users, UserCheck, X
} from 'lucide-react';
import { userAPI } from '../../../../api';

// ─────────────────────────────────────────────
// Sub-panel: Danh sách nhân viên (waiter/manager)
// ─────────────────────────────────────────────
function StaffPanel({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('waiter');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => { loadStaff(); }, []);

  const loadStaff = async () => {
    try {
      const res = await userAPI.getUsers({ limit: 200 });
      if (res.success) {
        const staff = res.data.filter(u =>
          ['waiter', 'manager'].includes(u.role)
        );
        setUsers(staff);
      }
    } catch (err) { toast.error('Lỗi tải danh sách nhân viên'); }
  };

  const clearForm = () => {
    setName(''); setEmail(''); setPassword(''); setPhone('');
    setRole('waiter'); setIsActive(true);
  };

  const handleEditClick = (u) => {
    setEditUser(u);
    setName(u.name); setEmail(u.email); setPassword('');
    setPhone(u.phone || ''); setRole(u.role); setIsActive(u.isActive);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { name, email, phone, role, isActive };
      if (password) data.password = password;
      const res = editUser
        ? await userAPI.updateUser(editUser._id, data)
        : await userAPI.createUser({ ...data, password: password || '123456' });
      if (res.success) {
        toast.success(editUser ? 'Đã cập nhật nhân viên' : 'Đã tạo tài khoản nhân viên');
        setShowForm(false); setEditUser(null); clearForm(); loadStaff();
      }
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa nhân viên này? Hành động này không thể hoàn tác.')) return;
    try {
      const res = await userAPI.deleteUser(id);
      if (res.success) { toast.success('Đã xóa nhân viên'); loadStaff(); }
    } catch (err) { toast.error(err.message); }
  };

  const ROLE_CONFIG = {
    manager: { icon: Shield, color: 'text-gold', label: 'Quản lý', bg: 'bg-gold/10 border-gold/20' },
    waiter:  { icon: UserCog, color: 'text-blue-400', label: 'Phục vụ', bg: 'bg-blue-400/10 border-blue-400/20' },
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="section-title">Danh Sách Nhân Viên</h3>
          <p className="text-[11px] text-muted mt-0.5">{users.length} nhân viên đang quản lý</p>
        </div>
        <button
          onClick={() => { setEditUser(null); clearForm(); setShowForm(true); }}
          className="btn-gold flex items-center gap-1.5"
        >
          <Plus size={12} /> Thêm Nhân Viên
        </button>
      </div>

      {/* Form tạo/chỉnh sửa */}
      {showForm && (
        <div className="glass-panel-luxury p-6 space-y-4 max-w-2xl border border-gold/20 animate-fade-up">
          <div className="flex items-center justify-between">
            <h4 className="section-title">{editUser ? '✏️ Cập nhật nhân viên' : '➕ Tạo tài khoản mới'}</h4>
            <button onClick={() => { setShowForm(false); setEditUser(null); }} className="text-muted hover:text-cream">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="luxury-label">Họ tên</label><input className="luxury-input" value={name} onChange={e => setName(e.target.value)} required /></div>
              <div><label className="luxury-label">Email</label><input type="email" className="luxury-input" value={email} onChange={e => setEmail(e.target.value)} required /></div>
              <div><label className="luxury-label">Số điện thoại</label><input className="luxury-input" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div><label className="luxury-label">{editUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}</label>
                <input type="password" className="luxury-input" value={password} onChange={e => setPassword(e.target.value)} required={!editUser} /></div>
              <div><label className="luxury-label">Vai trò</label>
                <select className="luxury-input luxury-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="waiter">Phục vụ (Waiter)</option>
                  {currentUser?.role === 'admin' && <option value="manager">Quản lý (Manager)</option>}
                </select>
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 text-sm text-cream cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-gold w-4 h-4" />
                  Tài khoản đang hoạt động
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditUser(null); }} className="btn-ghost">Hủy</button>
              <button type="submit" className="btn-gold">Lưu thông tin</button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng nhân viên */}
      <div className="glass-panel-luxury overflow-hidden">
        <table className="luxury-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Thông tin liên hệ</th>
              <th>Vai trò</th>
              <th className="text-center">Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const cfg = ROLE_CONFIG[u.role];
              const Icon = cfg?.icon || User;
              return (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-serif text-sm ${cfg?.bg || 'bg-gold/10 border-gold/20'} ${cfg?.color || 'text-gold'}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-serif text-cream">{u.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-[11px] text-muted">{u.email}</div>
                    <div className="text-[11px] text-muted/60">{u.phone || '—'}</div>
                  </td>
                  <td>
                    <div className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border ${cfg?.bg || ''}`}>
                      <Icon size={11} className={cfg?.color} />
                      <span className={cfg?.color}>{cfg?.label}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${u.isActive ? 'status-ready' : 'status-occupied'}`}>
                      {u.isActive ? 'Đang làm việc' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleEditClick(u)} className="w-7 h-7 rounded border border-gold/15 text-muted hover:text-gold hover:border-gold/30 flex items-center justify-center transition-all" title="Chỉnh sửa">
                        <Edit size={12} />
                      </button>
                      <button onClick={() => handleDelete(u._id)} className="w-7 h-7 rounded border border-wine/15 text-muted hover:text-red-400 hover:border-wine/30 flex items-center justify-center transition-all" title="Xóa">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-12 text-center text-muted text-xs">Chưa có nhân sự nào</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-panel: Thăng cấp Khách hàng → Nhân viên
// ─────────────────────────────────────────────
function PromotePanel({ onPromoteSuccess }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [promoting, setPromoting] = useState(null); // userId being promoted
  const [confirmModal, setConfirmModal] = useState(null); // { user }

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'customer', limit: 200 });
      if (res.success) setCustomers(res.data);
    } catch (err) { toast.error('Lỗi tải danh sách khách hàng'); }
  };

  const handlePromote = async (u) => {
    setPromoting(u._id);
    try {
      const res = await userAPI.updateUser(u._id, { role: 'waiter' });
      if (res.success) {
        toast.success(`✅ Đã thăng cấp "${u.name}" lên Nhân viên phục vụ!`, { duration: 4000 });
        setConfirmModal(null);
        loadCustomers();
        onPromoteSuccess?.();
      }
    } catch (err) {
      toast.error(err.message || 'Thăng cấp thất bại');
    } finally {
      setPromoting(null);
    }
  };

  const filtered = customers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || '').includes(search)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass-panel-luxury p-5 border border-gold/15 bg-gradient-to-r from-gold/5 to-transparent">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <ArrowUpCircle size={18} className="text-gold" />
          </div>
          <div>
            <h3 className="font-serif text-base text-gold tracking-wide">Thăng Cấp Nhân Viên</h3>
            <p className="text-[12px] text-muted mt-1 leading-relaxed">
              Khi một ứng viên phỏng vấn, họ tạo tài khoản khách hàng. Sau khi trúng tuyển,
              quản lý chuyển tài khoản lên vai trò <span className="text-blue-400">Phục vụ</span>.
              Lần đăng nhập tiếp theo, họ sẽ thấy giao diện nhân viên.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="luxury-input pl-9"
          placeholder="Tìm theo tên, email, SĐT..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Danh sách khách hàng */}
      <div className="glass-panel-luxury overflow-hidden">
        <table className="luxury-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Thông tin liên hệ</th>
              <th className="text-center">Trạng thái</th>
              <th className="text-right">Thăng cấp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id} className="group">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted/10 border border-muted/20 flex items-center justify-center font-serif text-sm text-muted group-hover:border-blue-400/40 group-hover:text-blue-400 transition-all">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-serif text-cream text-sm">{u.name}</div>
                      <div className="text-[10px] text-muted/60 flex items-center gap-1">
                        <User size={9} /> Khách hàng
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="text-[11px] text-muted">{u.email}</div>
                  <div className="text-[11px] text-muted/60">{u.phone || '—'}</div>
                </td>
                <td className="text-center">
                  <span className={`status-badge ${u.isActive ? 'status-ready' : 'status-occupied'}`}>
                    {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => setConfirmModal(u)}
                    disabled={!u.isActive || promoting === u._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded border border-blue-400/20 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    title={!u.isActive ? 'Tài khoản đã bị khóa' : 'Thăng cấp lên Phục vụ'}
                  >
                    <ArrowUpCircle size={12} />
                    {promoting === u._id ? 'Đang xử lý...' : 'Thăng cấp'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <User size={24} className="text-muted mx-auto opacity-40" />
            <p className="text-muted text-xs">
              {search ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có tài khoản khách hàng nào'}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md animate-fade-up">
          <div className="relative w-full max-w-md p-7 bg-bg-2 border border-gold/20 shadow-2xl">
            {/* Decoration */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-400/10 border-2 border-blue-400/30 flex items-center justify-center mx-auto">
                <ArrowUpCircle size={28} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-cream tracking-wide">Xác nhận thăng cấp</h3>
                <p className="text-[12px] text-muted mt-2 leading-relaxed">
                  Bạn sắp chuyển tài khoản
                </p>
              </div>

              {/* User info card */}
              <div className="bg-bg/50 border border-gold/10 p-4 text-left space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-serif text-gold">
                    {confirmModal.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-serif text-cream">{confirmModal.name}</div>
                    <div className="text-[11px] text-muted">{confirmModal.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gold/10">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted px-2 py-1 bg-muted/5 rounded">
                    <User size={11} /> Khách hàng
                  </div>
                  <span className="text-muted">→</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-400 px-2 py-1 bg-blue-400/10 border border-blue-400/20 rounded">
                    <UserCog size={11} /> Nhân viên phục vụ
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted/70 italic">
                Lần đăng nhập tiếp theo, người này sẽ thấy giao diện nhân viên phục vụ.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 btn-ghost"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => handlePromote(confirmModal)}
                  disabled={promoting === confirmModal._id}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs tracking-wider uppercase hover:bg-blue-500/30 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  {promoting === confirmModal._id ? 'Đang xử lý...' : 'Xác nhận thăng cấp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main StaffTab Component
// ─────────────────────────────────────────────
export default function StaffTab({ currentUser }) {
  const [activePanel, setActivePanel] = useState('staff');

  const panels = [
    { id: 'staff', icon: Users, label: 'Nhân viên' },
    { id: 'promote', icon: UserCheck, label: 'Thăng Cấp' },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Panel switcher */}
      <div className="flex gap-1 p-1 bg-bg/40 border border-gold/10 rounded w-fit">
        {panels.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs tracking-wide rounded transition-all ${
              activePanel === id
                ? 'bg-gold/15 border border-gold/30 text-gold'
                : 'text-muted hover:text-cream'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {activePanel === 'staff' && <StaffPanel currentUser={currentUser} />}
      {activePanel === 'promote' && <PromotePanel onPromoteSuccess={() => setActivePanel('staff')} />}
    </div>
  );
}

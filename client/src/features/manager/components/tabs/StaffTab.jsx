import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Shield, UserCog, User } from 'lucide-react';
import { userAPI } from '../../../../api';

export default function StaffTab({ currentUser }) {
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

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await userAPI.getUsers({ limit: 100 });
      if (res.success) {
        // Managers should primarily see staff (waiters) and maybe other managers, but not admins usually.
        // For now, we'll filter out admins to prevent managers from deleting admins.
        const staff = res.data.filter(u => u.role !== 'admin' || currentUser?.role === 'admin');
        setUsers(staff);
      }
    } catch (err) { toast.error('Lỗi tải danh sách nhân viên: ' + err.message); }
  };

  const clearForm = () => {
    setName(''); setEmail(''); setPassword(''); setPhone(''); setRole('waiter'); setIsActive(true);
  };

  const handleEditClick = (u) => {
    setEditUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword(''); // don't load password
    setPhone(u.phone || '');
    setRole(u.role);
    setIsActive(u.isActive);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { name, email, phone, role, isActive };
      if (password) data.password = password; // Only send password if changed

      const res = editUser 
        ? await userAPI.updateUser(editUser._id, data) 
        : await userAPI.createUser({ ...data, password: password || '123456' }); // default password if empty on creation
      
      if (res.success) {
        toast.success(editUser ? 'Đã cập nhật nhân viên' : 'Đã tạo tài khoản nhân viên');
        setShowForm(false);
        setEditUser(null);
        clearForm();
        loadUsers();
      }
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa nhân viên này? Hành động này không thể hoàn tác.')) return;
    try {
      const res = await userAPI.deleteUser(id);
      if (res.success) { toast.success('Đã xóa nhân viên'); loadUsers(); }
    } catch (err) { toast.error(err.message); }
  };

  const ROLE_CONFIG = {
    manager: { icon: Shield, color: 'text-gold', label: 'Quản lý' },
    waiter: { icon: UserCog, color: 'text-blue-400', label: 'Phục vụ' },
    customer: { icon: User, color: 'text-muted', label: 'Khách hàng' }
  };

  // Only show staff (waiter, manager) in this tab primarily, though customers could be fetched.
  const staffUsers = users.filter(u => ['waiter', 'manager'].includes(u.role));

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex justify-between items-center">
        <h3 className="section-title">Quản Lý Nhân Sự <span className="text-muted/60 normal-case text-xs ml-2">({staffUsers.length} nhân viên)</span></h3>
        <button onClick={() => { setEditUser(null); clearForm(); setShowForm(true); }} className="btn-gold flex items-center gap-1.5">
          <Plus size={12} /> Thêm Nhân Viên
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel-luxury p-6 space-y-4 max-w-2xl">
          <h4 className="section-title">{editUser ? 'Cập nhật nhân viên' : 'Tạo tài khoản mới'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="luxury-label">Họ tên</label><input className="luxury-input" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div><label className="luxury-label">Email (Tài khoản đăng nhập)</label><input type="email" className="luxury-input" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><label className="luxury-label">Số điện thoại</label><input className="luxury-input" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div><label className="luxury-label">{editUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}</label><input type="password" className="luxury-input" value={password} onChange={e => setPassword(e.target.value)} required={!editUser} /></div>
            
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
      )}

      <div className="glass-panel-luxury overflow-hidden">
        <table className="luxury-table">
          <thead><tr><th>Nhân viên</th><th>Thông tin liên hệ</th><th>Vai trò</th><th className="text-center">Trạng thái</th><th className="text-right">Thao tác</th></tr></thead>
          <tbody>
            {staffUsers.map(u => {
              const RoleIcon = ROLE_CONFIG[u.role]?.icon || User;
              return (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-serif">
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
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <RoleIcon size={12} className={ROLE_CONFIG[u.role]?.color} />
                      <span className={ROLE_CONFIG[u.role]?.color}>{ROLE_CONFIG[u.role]?.label}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${u.isActive ? 'status-ready' : 'status-occupied'}`}>
                      {u.isActive ? 'Đang làm việc' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleEditClick(u)} className="w-7 h-7 rounded border border-gold/15 text-muted hover:text-gold hover:border-gold/30 flex items-center justify-center transition-all"><Edit size={12} /></button>
                      <button onClick={() => handleDelete(u._id)} className="w-7 h-7 rounded border border-wine/15 text-muted hover:text-red-400 hover:border-wine/30 flex items-center justify-center transition-all"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {staffUsers.length === 0 && (
          <div className="py-12 text-center text-muted text-xs">Chưa có nhân sự nào</div>
        )}
      </div>
    </div>
  );
}

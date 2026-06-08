import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, Utensils, Table2, Users, Plus, Edit, Trash2,
  BarChart3, FileText, Calendar, CalendarDays, Settings,
  AlertTriangle, CheckCircle2, RefreshCw, Eye, ToggleRight,
  ArrowUpRight, ArrowDownRight, Star
} from 'lucide-react';
import { invoiceAPI, menuAPI, tableAPI, categoryAPI, authAPI, userAPI, reservationAPI } from '../../../api';

const CHART_COLORS = ['#c9a447', '#e8c87a', '#8b2020', '#3d2510', '#b8a888', '#c87a3d'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel-luxury p-3 text-xs">
      <p className="text-gold font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? p.value.toLocaleString('vi-VN') + ' ₫' : p.value}</p>
      ))}
    </div>
  );
};

export default function ManagerDashboard() {
  const [subTab, setSubTab] = useState('analytics');

  const [summary, setSummary] = useState(null);
  const [dailyRev, setDailyRev] = useState([]);
  const [monthlyRev, setMonthlyRev] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [peakHours, setPeakHours] = useState([]);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [reservations, setReservations] = useState([]);

  // Menu form
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editMenuItem, setEditMenuItem] = useState(null);
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuDesc, setMenuDesc] = useState('');
  const [menuCat, setMenuCat] = useState('');
  const [menuIngredients, setMenuIngredients] = useState('');
  const [menuSpicy, setMenuSpicy] = useState('0');
  const [menuSeafood, setMenuSeafood] = useState(false);
  const [menuVegetarian, setMenuVegetarian] = useState(false);

  // Table form
  const [showTableForm, setShowTableForm] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [tableCapacity, setTableCapacity] = useState('4');
  const [tableArea, setTableArea] = useState('Tầng 1');
  const [tableDesc, setTableDesc] = useState('');

  // Staff form
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('waiter');

  const loadStats = async () => {
    try {
      const [sumRes, dailyRes, monthlyRes, topRes, peakRes] = await Promise.all([
        invoiceAPI.getStatistics(),
        invoiceAPI.getDailyRevenue(),
        invoiceAPI.getMonthlyRevenue(),
        invoiceAPI.getTopItems(),
        invoiceAPI.getPeakHours()
      ]);
      if (sumRes.success) setSummary(sumRes.data);
      if (dailyRes.success) setDailyRev(dailyRes.data);
      if (monthlyRes.success) setMonthlyRev(monthlyRes.data);
      if (topRes.success) setTopItems(topRes.data);
      if (peakRes.success) setPeakHours(peakRes.data);
    } catch (err) { toast.error('Lỗi tải báo cáo: ' + err.message); }
  };

  const loadCRUDData = async () => {
    try {
      const [menuRes, catRes, tableRes, userRes, invoiceRes, resRes] = await Promise.all([
        menuAPI.getItems({ limit: 100 }),
        categoryAPI.getCategories(),
        tableAPI.getTables(),
        userAPI.getUsers({ limit: 100 }),
        invoiceAPI.getInvoices({ limit: 100 }),
        reservationAPI.getReservations()
      ]);
      if (menuRes.success) setMenuItems(menuRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (tableRes.success) setTables(tableRes.data);
      if (userRes.success) setUsers(userRes.data);
      if (invoiceRes.success) setInvoices(invoiceRes.data);
      if (resRes.success) setReservations(resRes.data);
    } catch (err) { toast.error('Lỗi tải dữ liệu: ' + err.message); }
  };

  useEffect(() => { loadStats(); loadCRUDData(); }, []);

  // Menu actions
  const clearMenuForm = () => { setMenuName(''); setMenuPrice(''); setMenuDesc(''); setMenuCat(categories[0]?._id || ''); setMenuIngredients(''); setMenuSpicy('0'); setMenuSeafood(false); setMenuVegetarian(false); };
  const handleEditClick = (item) => {
    setEditMenuItem(item); setMenuName(item.name); setMenuPrice(item.price); setMenuDesc(item.description);
    setMenuCat(typeof item.category === 'object' ? item.category?._id : item.category);
    setMenuIngredients(item.ingredients?.join(', ') || ''); setMenuSpicy(String(item.spicyLevel));
    setMenuSeafood(item.containsSeafood); setMenuVegetarian(item.isVegetarian); setShowMenuForm(true);
  };
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', menuName); fd.append('price', menuPrice); fd.append('description', menuDesc);
      fd.append('category', menuCat); fd.append('ingredients', menuIngredients); fd.append('spicyLevel', menuSpicy);
      fd.append('containsSeafood', menuSeafood); fd.append('isVegetarian', menuVegetarian);
      const res = editMenuItem ? await menuAPI.updateItem(editMenuItem._id, fd) : await menuAPI.createItem(fd);
      if (res.success) { toast.success(editMenuItem ? 'Cập nhật thành công' : 'Tạo món mới thành công'); setShowMenuForm(false); setEditMenuItem(null); clearMenuForm(); loadCRUDData(); }
    } catch (err) { toast.error(err.message); }
  };
  const handleDeleteMenu = async (id) => {
    if (!confirm('Xóa món ăn này?')) return;
    try { const res = await menuAPI.deleteItem(id); if (res.success) { toast.success('Đã xóa'); loadCRUDData(); } } catch (err) { toast.error(err.message); }
  };
  const handleToggleMenu = async (id) => {
    try { const res = await menuAPI.toggleAvailability(id); if (res.success) { toast.success(res.message); loadCRUDData(); } } catch (err) { toast.error(err.message); }
  };

  // Table actions
  const handleTableSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await tableAPI.createTable({ tableNumber, capacity: Number(tableCapacity), area: tableArea, description: tableDesc });
      if (res.success) { toast.success('Tạo bàn thành công'); setShowTableForm(false); setTableNumber(''); setTableDesc(''); loadCRUDData(); }
    } catch (err) { toast.error(err.message); }
  };
  const handleDeleteTable = async (id) => {
    if (!confirm('Xóa bàn này?')) return;
    try { const res = await tableAPI.deleteTable(id); if (res.success) { toast.success('Đã xóa bàn'); loadCRUDData(); } } catch (err) { toast.error(err.message); }
  };

  // Staff actions
  const clearUserForm = () => { setUserName(''); setUserEmail(''); setUserPassword(''); setUserPhone(''); setUserRole('waiter'); };
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editUser
        ? await userAPI.updateUser(editUser._id, { name: userName, phone: userPhone, role: userRole })
        : await userAPI.createUser({ name: userName, email: userEmail, password: userPassword, phone: userPhone, role: userRole });
      if (res.success) { toast.success(editUser ? 'Cập nhật nhân viên' : 'Tạo tài khoản thành công'); setShowUserForm(false); setEditUser(null); clearUserForm(); loadCRUDData(); }
    } catch (err) { toast.error(err.message); }
  };
  const handleToggleUser = async (id, cur) => {
    try { const res = await userAPI.updateUser(id, { isActive: !cur }); if (res.success) { toast.success('Cập nhật trạng thái'); loadCRUDData(); } } catch (err) { toast.error(err.message); }
  };
  const handleDeleteUser = async (id) => {
    if (!confirm('Xóa tài khoản này?')) return;
    try { const res = await userAPI.deleteUser(id); if (res.success) { toast.success('Đã xóa'); loadCRUDData(); } } catch (err) { toast.error(err.message); }
  };

  const ROLE_LABELS = { waiter: 'Phục Vụ', manager: 'Quản Lý', admin: 'Admin', customer: 'Khách' };
  const ROLE_BADGE = { waiter: 'badge-role-waiter', manager: 'badge-role-manager', admin: 'badge-role-admin', customer: 'badge-role-customer' };

  const TAB_ITEMS = [
    { id: 'analytics', icon: BarChart3, label: 'Tổng Quan' },
    { id: 'menu', icon: Utensils, label: 'Thực Đơn' },
    { id: 'tables', icon: Table2, label: 'Bàn Ăn' },
    { id: 'invoices', icon: FileText, label: 'Hóa Đơn' },
    { id: 'reservations', icon: CalendarDays, label: 'Đặt Bàn' },
    { id: 'staff', icon: Users, label: 'Nhân Viên' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title flex items-center gap-2"><BarChart3 size={16} /> Quản Lý Nhà Hàng</h1>
        <p className="section-subtitle mt-1">Dashboard tổng quản · Vận hành toàn diện</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gold/10 gap-0.5 overflow-x-auto no-scrollbar">
        {TAB_ITEMS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setSubTab(id)} className={`luxury-tab ${subTab === id ? 'active' : ''}`}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* ── ANALYTICS ── */}
      {subTab === 'analytics' && (
        <div className="space-y-6 animate-fade-up">
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Doanh Thu Tháng', value: summary.totalRevenue?.toLocaleString('vi-VN') + ' ₫', icon: TrendingUp, trend: '+12%', up: true },
                { label: 'Hóa Đơn Đã Thu', value: summary.totalInvoices + ' hóa đơn', icon: FileText, trend: '+5%', up: true },
                { label: 'Đơn Nhà Bếp', value: summary.totalOrders + ' đơn', icon: Utensils, trend: '+8%', up: true },
                { label: 'TB Hóa Đơn', value: summary.averageOrderValue?.toLocaleString('vi-VN') + ' ₫', icon: BarChart3, trend: '-2%', up: false },
              ].map((kpi, i) => (
                <div key={i} className="kpi-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/15 flex items-center justify-center">
                      <kpi.icon size={16} className="text-gold" />
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-semibold ${kpi.up ? 'text-green-400' : 'text-red-400'}`}>
                      {kpi.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {kpi.trend}
                    </div>
                  </div>
                  <div className="font-serif text-xl text-gold glow-text leading-none">{kpi.value}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider mt-1.5">{kpi.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Revenue chart */}
            <div className="glass-panel-luxury p-5">
              <h3 className="section-title mb-4">Doanh Thu 7 Ngày</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyRev.filter(d => d.revenue > 0)}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c9a447" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#c9a447" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,164,71,0.06)" />
                    <XAxis dataKey="day" stroke="#7a6040" fontSize={10} tickFormatter={v => `N.${v}`} />
                    <YAxis stroke="#7a6040" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#c9a447" strokeWidth={2} fill="url(#revGrad)" name="Doanh thu" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Peak hours */}
            <div className="glass-panel-luxury p-5">
              <h3 className="section-title mb-4">Giờ Cao Điểm</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,164,71,0.06)" />
                    <XAxis dataKey="hour" stroke="#7a6040" fontSize={10} tickFormatter={v => `${v}h`} />
                    <YAxis stroke="#7a6040" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#c9a447" name="Số hóa đơn" radius={[3,3,0,0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top items pie */}
            <div className="glass-panel-luxury p-5 lg:col-span-2">
              <h3 className="section-title mb-4">Top 5 Món Bán Chạy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={topItems} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="totalRevenue">
                      {topItems.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => v.toLocaleString('vi-VN') + ' ₫'} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5">
                  {topItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-xs text-cream-dim truncate max-w-[180px]">{item.name}</span>
                        <span className="text-[10px] text-muted">×{item.totalQuantity}</span>
                      </div>
                      <span className="text-xs text-gold font-serif ml-2">{item.totalRevenue?.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MENU ── */}
      {subTab === 'menu' && (
        <div className="space-y-5 animate-fade-up">
          <div className="flex justify-between items-center">
            <h3 className="section-title">Quản Lý Thực Đơn <span className="text-muted/60 normal-case text-xs ml-2">({menuItems.length} món)</span></h3>
            <button onClick={() => { setEditMenuItem(null); clearMenuForm(); setShowMenuForm(true); }} className="btn-gold flex items-center gap-1.5">
              <Plus size={12} /> Thêm Món
            </button>
          </div>

          {showMenuForm && (
            <form onSubmit={handleMenuSubmit} className="glass-panel-luxury p-6 space-y-4">
              <h4 className="section-title">{editMenuItem ? 'Chỉnh sửa món' : 'Thêm món mới'}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="luxury-label">Tên món</label><input className="luxury-input" value={menuName} onChange={e => setMenuName(e.target.value)} required /></div>
                <div><label className="luxury-label">Giá (₫)</label><input type="number" className="luxury-input" value={menuPrice} onChange={e => setMenuPrice(e.target.value)} required /></div>
                <div><label className="luxury-label">Danh mục</label>
                  <select className="luxury-input luxury-select" value={menuCat} onChange={e => setMenuCat(e.target.value)} required>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="luxury-label">Mô tả</label><textarea className="luxury-input" rows={2} value={menuDesc} onChange={e => setMenuDesc(e.target.value)} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="luxury-label">Thành phần (phân cách bằng dấu phẩy)</label><input className="luxury-input" placeholder="cá hồi, cơm, nori..." value={menuIngredients} onChange={e => setMenuIngredients(e.target.value)} /></div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 text-xs text-cream-dim cursor-pointer">
                    <input type="checkbox" checked={menuSeafood} onChange={e => setMenuSeafood(e.target.checked)} className="accent-gold" /> Hải sản
                  </label>
                  <label className="flex items-center gap-2 text-xs text-cream-dim cursor-pointer">
                    <input type="checkbox" checked={menuVegetarian} onChange={e => setMenuVegetarian(e.target.checked)} className="accent-gold" /> Món chay
                  </label>
                  <div><label className="luxury-label">Độ cay</label>
                    <select className="luxury-input luxury-select w-20" value={menuSpicy} onChange={e => setMenuSpicy(e.target.value)}>
                      {['0','1','2','3'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => { setShowMenuForm(false); setEditMenuItem(null); }} className="btn-ghost">Hủy</button>
                <button type="submit" className="btn-gold">Lưu món</button>
              </div>
            </form>
          )}

          <div className="glass-panel-luxury overflow-hidden">
            <table className="luxury-table">
              <thead><tr><th>Tên món</th><th>Danh mục</th><th>Giá</th><th>Thành phần</th><th className="text-center">Trạng thái</th><th className="text-right">Thao tác</th></tr></thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item._id}>
                    <td><span className="font-serif text-cream">{item.name}</span></td>
                    <td><span className="text-muted">{item.category?.name || 'Khác'}</span></td>
                    <td><span className="text-gold font-serif">{item.price?.toLocaleString('vi-VN')} ₫</span></td>
                    <td><span className="text-muted text-[11px] truncate max-w-[160px] block">{item.ingredients?.join(', ') || '—'}</span></td>
                    <td className="text-center">
                      <button onClick={() => handleToggleMenu(item._id)} className={`status-badge cursor-pointer ${item.isAvailable ? 'status-ready' : 'status-occupied'}`}>
                        {item.isAvailable ? '● Đang bán' : '○ Tạm hết'}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => handleEditClick(item)} className="w-7 h-7 rounded border border-gold/15 text-muted hover:text-gold hover:border-gold/30 flex items-center justify-center transition-all"><Edit size={12} /></button>
                        <button onClick={() => handleDeleteMenu(item._id)} className="w-7 h-7 rounded border border-wine/15 text-muted hover:text-red-400 hover:border-wine/30 flex items-center justify-center transition-all"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TABLES ── */}
      {subTab === 'tables' && (
        <div className="space-y-5 animate-fade-up">
          <div className="flex justify-between items-center">
            <h3 className="section-title">Quản Lý Bàn Ăn <span className="text-muted/60 normal-case text-xs ml-2">({tables.length} bàn)</span></h3>
            <button onClick={() => setShowTableForm(true)} className="btn-gold flex items-center gap-1.5">
              <Plus size={12} /> Thêm Bàn
            </button>
          </div>

          {showTableForm && (
            <form onSubmit={handleTableSubmit} className="glass-panel-luxury p-6 space-y-4 max-w-lg">
              <h4 className="section-title">Thêm bàn mới</h4>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="luxury-label">Số bàn</label><input className="luxury-input" placeholder="T12 / VIP01" value={tableNumber} onChange={e => setTableNumber(e.target.value)} required /></div>
                <div><label className="luxury-label">Sức chứa</label>
                  <select className="luxury-input luxury-select" value={tableCapacity} onChange={e => setTableCapacity(e.target.value)}>
                    {['2','4','6','8','12'].map(v => <option key={v} value={v}>{v} người</option>)}
                  </select>
                </div>
                <div><label className="luxury-label">Khu vực</label>
                  <select className="luxury-input luxury-select" value={tableArea} onChange={e => setTableArea(e.target.value)}>
                    {['Tầng 1','Tầng 2','Phòng VIP','Sân Vườn'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="luxury-label">Mô tả</label><input className="luxury-input" placeholder="Góc riêng tư, cạnh cửa sổ..." value={tableDesc} onChange={e => setTableDesc(e.target.value)} /></div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowTableForm(false)} className="btn-ghost">Hủy</button>
                <button type="submit" className="btn-gold">Lưu bàn</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {tables.map(t => {
              const cfg = { available: { dot: 'bg-green-400', badge: 'status-available', label: 'Trống', glow: 'table-status-empty' }, occupied: { dot: 'bg-red-400', badge: 'status-occupied', label: 'Có khách', glow: 'table-status-serving' }, reserved: { dot: 'bg-gold', badge: 'status-reserved', label: 'Đã đặt', glow: 'table-status-booked' } }[t.status] || { dot: 'bg-muted', badge: '', label: t.status };
              return (
                <div key={t._id} className={`relative glass-card p-4 border-2 group ${cfg.glow}`}>
                  <button onClick={() => handleDeleteTable(t._id)} className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={10} /></button>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot} ${t.status === 'occupied' ? 'animate-pulse' : ''}`} />
                    <span className="font-serif text-lg text-gold">{t.tableNumber}</span>
                  </div>
                  <div className="text-[11px] text-muted">{t.capacity} người · {t.area}</div>
                  {t.description && <div className="text-[10px] text-muted/60 mt-0.5 truncate">{t.description}</div>}
                  <span className={`status-badge mt-2 inline-flex ${cfg.badge}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── INVOICES ── */}
      {subTab === 'invoices' && (
        <div className="space-y-5 animate-fade-up">
          <h3 className="section-title">Lịch Sử Hóa Đơn <span className="text-muted/60 normal-case text-xs ml-2">({invoices.length} hóa đơn)</span></h3>
          <div className="glass-panel-luxury overflow-hidden">
            <table className="luxury-table">
              <thead><tr><th>Mã HD</th><th>Thời gian</th><th className="text-center">Bàn</th><th>Phương thức</th><th className="text-right">Tổng tiền</th><th className="text-center">Trạng thái</th></tr></thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td className="font-serif text-cream text-[11px]">#{inv._id.substring(18)}</td>
                    <td className="text-[11px]">{new Date(inv.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="text-center"><span className="text-gold font-serif">{inv.table?.tableNumber || '—'}</span></td>
                    <td className="text-[11px] capitalize">{inv.paymentMethod || '—'}</td>
                    <td className="text-right font-serif text-gold">{inv.total?.toLocaleString('vi-VN')} ₫</td>
                    <td className="text-center">
                      <span className={`status-badge ${inv.paymentStatus === 'paid' ? 'status-ready' : 'status-pending'}`}>
                        {inv.paymentStatus === 'paid' ? 'Đã thu' : 'Chờ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── RESERVATIONS ── */}
      {subTab === 'reservations' && (
        <div className="space-y-5 animate-fade-up">
          <h3 className="section-title">Quản Lý Đặt Bàn <span className="text-muted/60 normal-case text-xs ml-2">({reservations.length} lượt)</span></h3>
          <div className="glass-panel-luxury overflow-hidden">
            <table className="luxury-table">
              <thead><tr><th>Khách hàng</th><th>Ngày</th><th>Giờ</th><th className="text-center">Số khách</th><th className="text-center">Bàn</th><th>Ghi chú</th><th className="text-center">Trạng thái</th></tr></thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r._id}>
                    <td className="font-serif text-cream">{r.user?.name || r.name}</td>
                    <td>{new Date(r.reservationDate).toLocaleDateString('vi-VN')}</td>
                    <td>{r.reservationTime}</td>
                    <td className="text-center text-gold">{r.numberOfGuests}</td>
                    <td className="text-center text-gold">{r.table?.tableNumber || '—'}</td>
                    <td className="text-[11px] text-muted truncate max-w-[120px]">{r.note || '—'}</td>
                    <td className="text-center">
                      <span className={`status-badge ${ r.status === 'confirmed' ? 'status-ready' : r.status === 'pending' ? 'status-pending' : r.status === 'cancelled' ? 'status-occupied' : 'status-clearing'}`}>
                        {r.status === 'confirmed' ? 'Đã xác nhận' : r.status === 'pending' ? 'Chờ xác nhận' : r.status === 'cancelled' ? 'Đã hủy' : 'Hoàn thành'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reservations.length === 0 && (
              <div className="py-12 text-center text-muted text-xs">Chưa có đặt bàn nào</div>
            )}
          </div>
        </div>
      )}

      {/* ── STAFF ── */}
      {subTab === 'staff' && (
        <div className="space-y-5 animate-fade-up">
          <div className="flex justify-between items-center">
            <h3 className="section-title">Quản Lý Nhân Viên <span className="text-muted/60 normal-case text-xs ml-2">({users.filter(u => u.role !== 'customer').length} nhân viên)</span></h3>
            <button onClick={() => { setEditUser(null); clearUserForm(); setShowUserForm(true); }} className="btn-gold flex items-center gap-1.5">
              <Plus size={12} /> Tạo Tài Khoản
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={handleUserSubmit} className="glass-panel-luxury p-6 space-y-4 max-w-2xl">
              <h4 className="section-title">{editUser ? 'Chỉnh sửa nhân viên' : 'Tạo tài khoản mới'}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="luxury-label">Họ và tên</label><input className="luxury-input" value={userName} onChange={e => setUserName(e.target.value)} required /></div>
                <div><label className="luxury-label">Email</label><input type="email" className="luxury-input" value={userEmail} onChange={e => setUserEmail(e.target.value)} disabled={!!editUser} required={!editUser} /></div>
                {!editUser && <div><label className="luxury-label">Mật khẩu</label><input type="password" className="luxury-input" value={userPassword} onChange={e => setUserPassword(e.target.value)} required /></div>}
                <div><label className="luxury-label">Số điện thoại</label><input className="luxury-input" value={userPhone} onChange={e => setUserPhone(e.target.value)} /></div>
                <div><label className="luxury-label">Vai trò</label>
                  <select className="luxury-input luxury-select" value={userRole} onChange={e => setUserRole(e.target.value)}>
                    <option value="waiter">Phục Vụ</option>
                    <option value="manager">Quản Lý</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowUserForm(false)} className="btn-ghost">Hủy</button>
                <button type="submit" className="btn-gold">Lưu</button>
              </div>
            </form>
          )}

          <div className="glass-panel-luxury overflow-hidden">
            <table className="luxury-table">
              <thead><tr><th>Nhân viên</th><th>Liên hệ</th><th className="text-center">Vai trò</th><th className="text-center">Trạng thái</th><th className="text-right">Thao tác</th></tr></thead>
              <tbody>
                {users.filter(u => u.role !== 'customer').map(u => (
                  <tr key={u._id}>
                    <td><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-wood border border-gold/20 flex items-center justify-center font-serif text-gold text-xs shrink-0">{u.name?.charAt(0)}</div><span className="font-serif text-cream">{u.name}</span></div></td>
                    <td><div className="text-[11px]">{u.email}</div><div className="text-[10px] text-muted">{u.phone}</div></td>
                    <td className="text-center"><span className={`status-badge ${ROLE_BADGE[u.role] || 'text-muted'}`}>{ROLE_LABELS[u.role] || u.role}</span></td>
                    <td className="text-center">
                      <button onClick={() => handleToggleUser(u._id, u.isActive)} className={`status-badge cursor-pointer ${u.isActive ? 'status-available' : 'status-occupied'}`}>
                        {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => { setEditUser(u); setUserName(u.name); setUserEmail(u.email); setUserPhone(u.phone||''); setUserRole(u.role); setShowUserForm(true); }} className="w-7 h-7 rounded border border-gold/15 text-muted hover:text-gold hover:border-gold/30 flex items-center justify-center transition-all"><Edit size={12} /></button>
                        <button onClick={() => handleDeleteUser(u._id)} className="w-7 h-7 rounded border border-wine/15 text-muted hover:text-red-400 hover:border-wine/30 flex items-center justify-center transition-all"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

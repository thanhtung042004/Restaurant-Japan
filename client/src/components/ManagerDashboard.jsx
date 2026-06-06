import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Utensils, Table as TableIcon, Users as UsersIcon, 
  Plus, Edit, Trash2, ToggleLeft, ToggleRight, Sparkles, Send 
} from 'lucide-react';
import { invoiceAPI, menuAPI, tableAPI, categoryAPI, aiAPI, authAPI, userAPI } from '../services/api';

const COLORS = ['#c9a447', '#e8c87a', '#8b2020', '#3d2510', '#b8a888'];

export default function ManagerDashboard() {
  const [subTab, setSubTab] = useState('analytics');

  // Stats Data
  const [summary, setSummary] = useState(null);
  const [dailyRev, setDailyRev] = useState([]);
  const [monthlyRev, setMonthlyRev] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [peakHours, setPeakHours] = useState([]);

  // CRUD Data
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  
  const [invoices, setInvoices] = useState([]);
  
  // User Form States
  
  
  // AI Consultant
  
  
  

  // Form states
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

  // Table form states
  const [showTableForm, setShowTableForm] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [tableCapacity, setTableCapacity] = useState('4');
  const [tableArea, setTableArea] = useState('Tang 1');
  const [tableDesc, setTableDesc] = useState('');

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
    } catch (err) {
      toast.error('Loi tai du lieu bao cao: ' + err.message);
    }
  };

  const loadCRUDData = async () => {
    try {
      const [menuRes, catRes, tableRes, userRes, invoiceRes] = await Promise.all([
        menuAPI.getItems({ limit: 100 }),
        categoryAPI.getCategories(),
        tableAPI.getTables(),
        userAPI.getUsers({ limit: 100 }),
        invoiceAPI.getInvoices({ limit: 100 })
      ]);
      if (menuRes.success) setMenuItems(menuRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (tableRes.success) setTables(tableRes.data);
      if (userRes.success) setUsers(userRes.data);
      if (invoiceRes.success) setInvoices(invoiceRes.data);
    } catch (err) {
      toast.error('Loi tai danh sach thong tin CRUD: ' + err.message);
    }
  };

  useEffect(() => {
    loadStats();
    loadCRUDData();
  }, []);

  // Menu CRUD actions
  const handleToggleMenuAvailability = async (id) => {
    try {
      const res = await menuAPI.toggleAvailability(id);
      if (res.success) {
        toast.success(res.message);
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Ban co chac chan muon xoa mon an nay?')) return;
    try {
      const res = await menuAPI.deleteItem(id);
      if (res.success) {
        toast.success('Xoa mon an thanh cong');
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', menuName);
      formData.append('price', menuPrice);
      formData.append('description', menuDesc);
      formData.append('category', menuCat);
      formData.append('ingredients', menuIngredients);
      formData.append('spicyLevel', menuSpicy);
      formData.append('containsSeafood', menuSeafood);
      formData.append('isVegetarian', menuVegetarian);

      let res;
      if (editMenuItem) {
        res = await menuAPI.updateItem(editMenuItem._id, formData);
        toast.success('Cap nhat mon an thanh cong');
      } else {
        res = await menuAPI.createItem(formData);
        toast.success('Tao mon an moi thanh cong');
      }

      if (res.success) {
        setShowMenuForm(false);
        setEditMenuItem(null);
        clearMenuForm();
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const clearMenuForm = () => {
    setMenuName('');
    setMenuPrice('');
    setMenuDesc('');
    setMenuCat(categories[0]?._id || '');
    setMenuIngredients('');
    setMenuSpicy('0');
    setMenuSeafood(false);
    setMenuVegetarian(false);
  };

  const handleEditClick = (item) => {
    setEditMenuItem(item);
    setMenuName(item.name);
    setMenuPrice(item.price);
    setMenuDesc(item.description);
    setMenuCat(typeof item.category === 'object' ? item.category?._id : item.category);
    setMenuIngredients(item.ingredients?.join(', ') || '');
    setMenuSpicy(String(item.spicyLevel));
    setMenuSeafood(item.containsSeafood);
    setMenuVegetarian(item.isVegetarian);
    setShowMenuForm(true);
  };

  // Table actions
  const handleTableSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await tableAPI.createTable({
        tableNumber,
        capacity: Number(tableCapacity),
        area: tableArea,
        description: tableDesc
      });
      if (res.success) {
        toast.success('Tao ban an thanh cong');
        setShowTableForm(false);
        setTableNumber('');
        setTableDesc('');
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Ban co chac chan muon xoa ban nay?')) return;
    try {
      const res = await tableAPI.deleteTable(id);
      if (res.success) {
        toast.success('Xoa ban an thanh cong');
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // User Actions
  
  
  
  
  
  // AI consultant submit
  
  return (
    <div className="space-y-8">
      {/* Sub Tabs */}
      <div className="flex border-b border-gold/10 gap-4 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setSubTab('analytics')}
          className={`pb-3 text-xs tracking-wider uppercase border-b-2 font-medium ${subTab === 'analytics' ? 'text-gold border-gold' : 'text-muted border-transparent hover:text-cream'}`}
        >
          Bao Cao Doanh Thu & Bieu Do
        </button>
        
        <button 
          onClick={() => setSubTab('menu')}
          className={`pb-3 text-xs tracking-wider uppercase border-b-2 font-medium ${subTab === 'menu' ? 'text-gold border-gold' : 'text-muted border-transparent hover:text-cream'}`}
        >
          Quan Ly Thuc Don
        </button>
        <button 
          onClick={() => setSubTab('tables')}
          className={`pb-3 text-xs tracking-wider uppercase border-b-2 font-medium ${subTab === 'tables' ? 'text-gold border-gold' : 'text-muted border-transparent hover:text-cream'}`}
        >
          Quan Ly Ban An
        </button>
        
        <button 
          onClick={() => setSubTab('invoices')}
          className={`pb-3 text-xs tracking-wider uppercase border-b-2 font-medium ${subTab === 'invoices' ? 'text-gold border-gold' : 'text-muted border-transparent hover:text-cream'}`}
        >
          Quan Ly Hoa Don
        </button>
      </div>

      {/* ANALYTICS PANEL */}
      {subTab === 'analytics' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel-luxury p-5">
                <div className="text-muted text-[10px] tracking-wider uppercase flex items-center gap-2">
                  <TrendingUp size={12} className="text-gold" /> Doanh Thu Thang
                </div>
                <div className="font-serif text-2xl text-gold mt-2">
                  {summary.totalRevenue.toLocaleString('vi-VN')} VND
                </div>
              </div>
              <div className="glass-panel-luxury p-5">
                <div className="text-muted text-[10px] tracking-wider uppercase flex items-center gap-2">
                  <UsersIcon size={12} className="text-gold" /> Hoa Don Da Thanh Toan
                </div>
                <div className="font-serif text-2xl text-gold mt-2">
                  {summary.totalInvoices} hoa don
                </div>
              </div>
              <div className="glass-panel-luxury p-5">
                <div className="text-muted text-[10px] tracking-wider uppercase flex items-center gap-2">
                  <Utensils size={12} className="text-gold" /> Don Hang Nha Bep
                </div>
                <div className="font-serif text-2xl text-gold mt-2">
                  {summary.totalOrders} don
                </div>
              </div>
              <div className="glass-panel-luxury p-5">
                <div className="text-muted text-[10px] tracking-wider uppercase flex items-center gap-2">
                  <TableIcon size={12} className="text-gold" /> Trung Binh Hoa Don
                </div>
                <div className="font-serif text-2xl text-gold mt-2">
                  {summary.averageOrderValue.toLocaleString('vi-VN')} VND
                </div>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue daily trend */}
            <div className="glass-panel-luxury p-5">
              <h3 className="font-serif text-sm uppercase text-gold tracking-wider mb-4">
                Doanh Thu 7 Ngay Gan Nhat
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyRev.filter(d => d.revenue > 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a1a08" />
                    <XAxis dataKey="day" stroke="#7a6040" fontSize={11} tickFormatter={(v) => `N.${v}`} />
                    <YAxis stroke="#7a6040" fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#c9a447" strokeWidth={2} name="Doanh thu" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Peak Hours */}
            <div className="glass-panel-luxury p-5">
              <h3 className="font-serif text-sm uppercase text-gold tracking-wider mb-4">
                Luu Luong Khung Gio Dong Khach
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a1a08" />
                    <XAxis dataKey="hour" stroke="#7a6040" fontSize={11} tickFormatter={(v) => `${v}h`} />
                    <YAxis stroke="#7a6040" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#c9a447" name="So hoa don" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Items Pie */}
            <div className="border border-gold/10 p-5 bg-bg-2 lg:col-span-2">
              <h3 className="font-serif text-sm uppercase text-gold tracking-wider mb-4">
                Top 5 Mon Ban Chay (Co Cau Doanh Thu)
              </h3>
              <div className="h-72 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topItems}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="totalRevenue"
                        nameKey="name"
                      >
                        {topItems.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VND`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {topItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-gold/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-cream-dim truncate max-w-[200px]">{item.name} ({item.totalQuantity} phan)</span>
                      </div>
                      <span className="text-gold font-serif">{item.totalRevenue.toLocaleString('vi-VN')} VND</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENU CRUD */}
      {subTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gold/10">
            <h3 className="font-serif text-lg text-gold uppercase tracking-wider">Danh sach thuc don</h3>
            <button 
              onClick={() => { setEditMenuItem(null); clearMenuForm(); setShowMenuForm(true); }}
              className="bg-gold text-bg text-[10px] tracking-wider uppercase px-4 py-2 font-semibold hover:bg-gold-light transition-all flex items-center gap-1.5"
            >
              <Plus size={12} /> Tao Mon An Moi
            </button>
          </div>

          {/* Form Create/Edit */}
          {showMenuForm && (
            <form onSubmit={handleMenuSubmit} className="border border-gold/20 p-6 bg-glass space-y-4">
              <h4 className="font-serif text-sm text-gold uppercase tracking-wider">
                {editMenuItem ? 'Chinh sua mon an' : 'Tao mon an moi'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">Ten mon</label>
                  <input 
                    type="text" 
                    className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">Gia ban (VND)</label>
                  <input 
                    type="number" 
                    className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={menuPrice}
                    onChange={(e) => setMenuPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">Danh muc</label>
                  <select 
                    className="bg-bg-2 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={menuCat}
                    onChange={(e) => setMenuCat(e.target.value)}
                    required
                  >
                    <option value="">Chon danh muc</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase text-muted font-medium">Mo ta ngan</label>
                <textarea 
                  className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                  rows={2}
                  value={menuDesc}
                  onChange={(e) => setMenuDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 font-light">
                  <label className="text-[10px] uppercase text-muted font-medium">Thanh phan (ngan cach bang dau phay)</label>
                  <input 
                    type="text" 
                    className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    placeholder="ca hoi, com, nori, wasabi"
                    value={menuIngredients}
                    onChange={(e) => setMenuIngredients(e.target.value)}
                  />
                </div>
                <div className="flex grid grid-cols-3 gap-2 items-center pt-4">
                  <label className="flex items-center gap-2 text-xs text-cream-dim">
                    <input 
                      type="checkbox" 
                      checked={menuSeafood}
                      onChange={(e) => setMenuSeafood(e.target.checked)}
                      className="border-gold/20"
                    />
                    Co hai san
                  </label>
                  <label className="flex items-center gap-2 text-xs text-cream-dim">
                    <input 
                      type="checkbox" 
                      checked={menuVegetarian}
                      onChange={(e) => setMenuVegetarian(e.target.checked)}
                      className="border-gold/20"
                    />
                    Mon chay
                  </label>
                  <div className="flex items-center gap-2 text-xs text-cream-dim">
                    <label className="text-[10px] uppercase text-muted">Do cay</label>
                    <select 
                      className="bg-bg-2 border border-gold/10 text-cream px-2 py-1 text-xs outline-none"
                      value={menuSpicy}
                      onChange={(e) => setMenuSpicy(e.target.value)}
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => { setShowMenuForm(false); setEditMenuItem(null); }}
                  className="px-4 py-2 border border-gold/20 text-cream-dim text-xs uppercase"
                >
                  Huy
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-gold text-bg text-xs uppercase font-semibold"
                >
                  Luu mon an
                </button>
              </div>
            </form>
          )}

          {/* Items List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gold/20 text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Ten mon</th>
                  <th className="py-3 px-4">Phan loai</th>
                  <th className="py-3 px-4">Gia ban</th>
                  <th className="py-3 px-4">Thanh phan</th>
                  <th className="py-3 px-4 text-center">Trang thai</th>
                  <th className="py-3 px-4 text-right">Thao tac</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {menuItems.map((item) => (
                  <tr key={item._id} className="hover:bg-glass/10 transition-colors">
                    <td className="py-4 px-4 font-serif text-sm text-cream">{item.name}</td>
                    <td className="py-4 px-4 text-cream-dim">{item.category?.name || 'Khac'}</td>
                    <td className="py-4 px-4 text-gold">{item.price.toLocaleString('vi-VN')} VND</td>
                    <td className="py-4 px-4 text-muted truncate max-w-[200px]">{item.ingredients?.join(', ') || '-'}</td>
                    <td className="py-4 px-4 text-center">
                      <button 
                        onClick={() => handleToggleMenuAvailability(item._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-medium ${
                          item.isAvailable ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
                        }`}
                      >
                        {item.isAvailable ? 'Ban chay' : 'Tam het'}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="p-1.5 hover:text-gold text-muted"
                        title="Sua"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMenu(item._id)}
                        className="p-1.5 hover:text-wine-light text-muted"
                        title="Xoa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLES CRUD */}
      {subTab === 'tables' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gold/10">
            <h3 className="font-serif text-lg text-gold uppercase tracking-wider">Danh sach ban an</h3>
            <button 
              onClick={() => setShowTableForm(true)}
              className="bg-gold text-bg text-[10px] tracking-wider uppercase px-4 py-2 font-semibold hover:bg-gold-light transition-all flex items-center gap-1.5"
            >
              <Plus size={12} /> Them Ban Moi
            </button>
          </div>

          {/* Form Table */}
          {showTableForm && (
            <form onSubmit={handleTableSubmit} className="border border-gold/20 p-6 bg-glass space-y-4 max-w-xl">
              <h4 className="font-serif text-sm text-gold uppercase tracking-wider">Them ban an moi</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">So ban</label>
                  <input 
                    type="text" 
                    className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    placeholder="T12 hoặc VIP03"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">Suc chua (Nguoi)</label>
                  <select 
                    className="bg-bg-2 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={tableCapacity}
                    onChange={(e) => setTableCapacity(e.target.value)}
                  >
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="6">6</option>
                    <option value="8">8</option>
                    <option value="12">12</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">Khu vuc</label>
                  <select 
                    className="bg-bg-2 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={tableArea}
                    onChange={(e) => setTableArea(e.target.value)}
                  >
                    <option value="Tang 1">Tang 1</option>
                    <option value="Tang 2">Tang 2</option>
                    <option value="Phong VIP">Phong VIP</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase text-muted font-medium">Mo ta chi tiet</label>
                <input 
                  type="text" 
                  className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                  placeholder="Goc rieng tu, canh cua so..."
                  value={tableDesc}
                  onChange={(e) => setTableDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowTableForm(false)}
                  className="px-4 py-2 border border-gold/20 text-cream-dim text-xs uppercase"
                >
                  Huy
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-gold text-bg text-xs uppercase font-semibold"
                >
                  Luu ban
                </button>
              </div>
            </form>
          )}

          {/* Tables List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((t) => (
              <div key={t._id} className="border border-gold/10 bg-bg-2 p-5 space-y-3 relative group">
                <button 
                  onClick={() => handleDeleteTable(t._id)}
                  className="absolute top-4 right-4 text-muted hover:text-wine-light opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Xoa"
                >
                  <Trash2 size={12} />
                </button>
                <div className="font-serif text-lg text-gold">{t.tableNumber}</div>
                <div className="text-xs text-cream-dim">Sức chứa: {t.capacity} người</div>
                <div className="text-[10px] text-muted tracking-wider uppercase">{t.area}</div>
                {t.description && <p className="text-[10px] text-muted truncate">{t.description}</p>}
                <div className={`text-[9px] uppercase tracking-wider px-2 py-0.5 inline-block font-medium ${
                  t.status === 'available' ? 'text-green-500 bg-green-500/10' :
                  t.status === 'occupied' ? 'text-red-500 bg-red-500/10' : 'text-yellow-500 bg-yellow-500/10'
                }`}>
                  {t.status === 'available' ? 'Trong' : t.status === 'occupied' ? 'Co khach' : 'Da dat'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS CRUD */}
      {subTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gold/10">
            <h3 className="font-serif text-lg text-gold uppercase tracking-wider">Danh sach nhan vien</h3>
            <button 
              onClick={() => { setEditUser(null); clearUserForm(); setShowUserForm(true); }}
              className="bg-gold text-bg text-[10px] tracking-wider uppercase px-4 py-2 font-semibold hover:bg-gold-light transition-all flex items-center gap-1.5"
            >
              <Plus size={12} /> Tao Tai Khoan
            </button>
          </div>

          {/* User Form Create/Edit */}
          {showUserForm && (
            <form onSubmit={handleUserSubmit} className="border border-gold/20 p-6 bg-glass space-y-4 max-w-2xl">
              <h4 className="font-serif text-sm text-gold uppercase tracking-wider">
                {editUser ? 'Chinh sua nhan vien' : 'Tao tai khoan moi'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">Ho va Ten</label>
                  <input 
                    type="text" 
                    className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">Email dang nhap</label>
                  <input 
                    type="email" 
                    className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    disabled={!!editUser}
                    required={!editUser}
                  />
                </div>
                {!editUser && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-muted font-medium">Mat khau</label>
                    <input 
                      type="password" 
                      className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">So dien thoai</label>
                  <input 
                    type="text" 
                    className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">Vai tro (Role)</label>
                  <select 
                    className="bg-bg-2 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                  >
                    <option value="waiter">Phuc vu (Waiter)</option>
                    <option value="receptionist">Le tan (Receptionist)</option>
                    <option value="chef">Bep (Chef)</option>
                    <option value="admin">Quan ly (Admin)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowUserForm(false)}
                  className="px-4 py-2 border border-gold/20 text-cream-dim text-xs uppercase"
                >
                  Huy
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-gold text-bg text-xs uppercase font-semibold"
                >
                  Luu tai khoan
                </button>
              </div>
            </form>
          )}

          {/* Users List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gold/20 text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Nhan vien</th>
                  <th className="py-3 px-4">Lien he</th>
                  <th className="py-3 px-4 text-center">Vai tro</th>
                  <th className="py-3 px-4 text-center">Trang thai</th>
                  <th className="py-3 px-4 text-right">Thao tac</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-glass/10 transition-colors">
                    <td className="py-4 px-4 font-serif text-sm text-cream">{u.name}</td>
                    <td className="py-4 px-4 text-cream-dim">
                      <div>{u.email}</div>
                      <div className="text-muted">{u.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 border border-gold/20 text-gold text-[10px] uppercase tracking-wider">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button 
                        onClick={() => handleToggleUser(u._id, u.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-medium ${
                          u.isActive ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
                        }`}
                      >
                        {u.isActive ? 'Hoat dong' : 'Da khoa'}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEditUserClick(u)}
                        className="p-1.5 hover:text-gold text-muted"
                        title="Sua"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-1.5 hover:text-wine-light text-muted"
                        title="Khoa/Xoa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVOICES LIST */}
      {subTab === 'invoices' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-gold/10">
            <h3 className="font-serif text-lg text-gold uppercase tracking-wider">Lich su hoa don</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gold/20 text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Ma HD</th>
                  <th className="py-3 px-4">Ngay thanh toan</th>
                  <th className="py-3 px-4 text-center">Ban an</th>
                  <th className="py-3 px-4 text-right">Tong tien</th>
                  <th className="py-3 px-4 text-center">Trang thai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-glass/10 transition-colors">
                    <td className="py-4 px-4 font-serif text-cream">#{inv._id.substring(18)}</td>
                    <td className="py-4 px-4 text-cream-dim">
                      {new Date(inv.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-4 px-4 text-center text-gold">
                      {inv.table?.tableNumber || '-'}
                    </td>
                    <td className="py-4 px-4 text-right font-serif text-sm">
                      {inv.total.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider font-medium ${
                        inv.paymentStatus === 'paid' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                      }`}>
                        {inv.paymentStatus === 'paid' ? 'Da Thu' : 'Cho'}
                      </span>
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

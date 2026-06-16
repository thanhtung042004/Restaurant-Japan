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
  ArrowUpRight, ArrowDownRight, Star, CircleDollarSign, ScrollText, ChevronDown, Bot
} from 'lucide-react';
import { invoiceAPI, menuAPI, tableAPI, categoryAPI, reservationAPI } from '../../../api';
import AIAssistantDashboard from '../../admin/components/AIAssistantDashboard';

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

export default function ManagerDashboard({ activeTab: propTab, onTabChange: propOnTabChange, user, socket }) {
  const [subTab, setSubTab] = useState(propTab || 'analytics');

  React.useEffect(() => {
    const validTabs = ['analytics', 'menu', 'tables', 'invoices', 'reservations', 'ai'];
    if (propTab && validTabs.includes(propTab)) {
      setSubTab(propTab);
    }
  }, [propTab]);

  const setTabWrapper = (tab) => {
    setSubTab(tab);
    propOnTabChange?.(tab);
  };

  const [summary, setSummary] = useState(null);
  const [dailyRev, setDailyRev] = useState([]);
  const [monthlyRev, setMonthlyRev] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [peakHours, setPeakHours] = useState([]);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
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
      const [menuRes, catRes, tableRes, invoiceRes, resRes] = await Promise.all([
        menuAPI.getItems({ limit: 100 }),
        categoryAPI.getCategories(),
        tableAPI.getTables(),
        invoiceAPI.getInvoices({ limit: 100 }),
        reservationAPI.getReservations()
      ]);
      if (menuRes.success) setMenuItems(menuRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (tableRes.success) setTables(tableRes.data);
      if (invoiceRes.success) setInvoices(invoiceRes.data);
      if (resRes.success) setReservations(resRes.data);
    } catch (err) { toast.error('Lỗi tải dữ liệu: ' + err.message); }
  };

  useEffect(() => {
    loadStats();
    loadCRUDData();

    if (socket) {
      socket.on('table:statusUpdated', ({ tableId, status }) => {
        setTables(prev => prev.map(t => t._id === tableId ? { ...t, status } : t));
      });

      const handleReservationUpdate = () => {
        loadCRUDData();
      };

      const handleOrderUpdate = () => {
        loadStats();
        loadCRUDData();
      };

      socket.on('reservation:new', handleReservationUpdate);
      socket.on('reservation:confirmed', handleReservationUpdate);
      socket.on('reservation:statusUpdated', handleReservationUpdate);
      
      socket.on('order:new', handleOrderUpdate);
      socket.on('order:itemsAdded', handleOrderUpdate);
      socket.on('order:cancelled', handleOrderUpdate);
    }

    return () => {
      if (socket) {
        socket.off('table:statusUpdated');
        socket.off('reservation:new');
        socket.off('reservation:confirmed');
        socket.off('reservation:statusUpdated');
        socket.off('order:new');
        socket.off('order:itemsAdded');
        socket.off('order:cancelled');
      }
    };
  }, [socket]);

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



  const TAB_ITEMS = [
    { id: 'analytics', icon: BarChart3, label: 'Tổng Quan' },
    { id: 'menu', icon: Utensils, label: 'Thực Đơn' },
    { id: 'tables', icon: Table2, label: 'Bàn Ăn' },
    { id: 'invoices', icon: FileText, label: 'Hóa Đơn' },
    { id: 'reservations', icon: CalendarDays, label: 'Đặt Bàn' },
    { id: 'ai', icon: Bot, label: 'Sakura AI' },
  ];

  const occupiedTablesCount = tables.filter(t => t.status === 'occupied').length;
  const pendingInvoicesCount = invoices.filter(inv => inv.paymentStatus === 'pending').length;
  const todayReservationsCount = reservations.filter(r => new Date(r.reservationDate).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title flex items-center gap-2"><BarChart3 size={16} /> Quản Lý Nhà Hàng</h1>
        <p className="section-subtitle mt-1">Dashboard tổng quản · Vận hành toàn diện</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gold/10 gap-0.5 overflow-x-auto no-scrollbar">
        {TAB_ITEMS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTabWrapper(id)} className={`luxury-tab ${subTab === id ? 'active' : ''}`}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* ── ANALYTICS (MOCKUP UI) ── */}
      {subTab === 'analytics' && (
        <div className="space-y-6 animate-fade-up">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-serif text-cream mb-1">Xin chào, Manager 👋</h1>
              <p className="text-muted text-xs">Chúc bạn một ngày làm việc hiệu quả!</p>
            </div>
            {/* Top right filters (Hôm nay, Tuần này, Tháng này, Calendar) */}
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 rounded-md bg-gold/15 border border-gold/30 text-gold text-xs font-medium">Hôm nay</button>
              <button className="px-4 py-1.5 rounded-md hover:bg-gold/5 text-muted hover:text-cream transition-colors text-xs font-medium">Tuần này</button>
              <button className="px-4 py-1.5 rounded-md hover:bg-gold/5 text-muted hover:text-cream transition-colors text-xs font-medium">Tháng này</button>
              <button className="w-8 h-8 rounded-md hover:bg-gold/5 border border-transparent hover:border-gold/20 text-muted hover:text-gold flex items-center justify-center transition-all">
                <CalendarDays size={14} />
              </button>
            </div>
          </div>

          {/* KPI Cards (5 cols) */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* 1. Doanh thu */}
            <div className="glass-panel-luxury p-4 relative overflow-hidden group border border-gold/15 hover:border-gold/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-muted">Doanh thu hôm nay</span>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-wood border border-gold/20 flex items-center justify-center">
                  <CircleDollarSign size={14} className="text-gold" />
                </div>
              </div>
              <div className="font-serif text-2xl text-gold glow-text mb-2 tracking-wide">
                28.450.000 <span className="text-[10px] text-muted tracking-normal">VNĐ</span>
              </div>
              <div className="text-[10px] text-green-400 flex items-center gap-1">
                <ArrowUpRight size={10} /> 18.6% <span className="text-muted ml-0.5">so với hôm qua</span>
              </div>
            </div>

            {/* 2. Hóa đơn */}
            <div className="glass-panel-luxury p-4 relative overflow-hidden group border border-gold/15 hover:border-gold/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-muted">Hóa đơn</span>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-wood border border-gold/20 flex items-center justify-center">
                  <ScrollText size={14} className="text-gold" />
                </div>
              </div>
              <div className="font-serif text-2xl text-gold glow-text mb-2">128</div>
              <div className="text-[10px] text-green-400 flex items-center gap-1">
                <ArrowUpRight size={10} /> 12.5% <span className="text-muted ml-0.5">so với hôm qua</span>
              </div>
            </div>

            {/* 3. Đặt bàn */}
            <div className="glass-panel-luxury p-4 relative overflow-hidden group border border-gold/15 hover:border-gold/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-muted">Đặt bàn hôm nay</span>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-wood border border-gold/20 flex items-center justify-center">
                  <CalendarDays size={14} className="text-gold" />
                </div>
              </div>
              <div className="font-serif text-2xl text-gold glow-text mb-2">36</div>
              <div className="text-[10px] text-green-400 flex items-center gap-1">
                <ArrowUpRight size={10} /> 8.3% <span className="text-muted ml-0.5">so với hôm qua</span>
              </div>
            </div>

            {/* 4. Bàn đang sử dụng */}
            <div className="glass-panel-luxury p-4 relative overflow-hidden group border border-gold/15 hover:border-gold/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-muted">Bàn đang sử dụng</span>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-wood border border-gold/20 flex items-center justify-center">
                  <Users size={14} className="text-gold" />
                </div>
              </div>
              <div className="font-serif text-2xl text-gold glow-text mb-2">
                22 <span className="text-xs text-muted tracking-normal">/ 40</span>
              </div>
              <div className="text-[10px] text-muted">
                <span className="text-gold">55%</span> bàn đang được sử dụng
              </div>
            </div>

            {/* 5. Món bán chạy */}
            <div className="glass-panel-luxury p-4 relative overflow-hidden group border border-gold/15 hover:border-gold/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-muted">Món bán chạy</span>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-wood border border-gold/20 flex items-center justify-center">
                  <Star size={14} className="text-gold" />
                </div>
              </div>
              <div className="font-serif text-sm text-gold glow-text mb-1 truncate">Sashimi cá hồi</div>
              <div className="text-[10px] text-muted mt-2">
                Đã bán <span className="text-cream">42</span> phần
              </div>
              {/* Optional tiny decoration image */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-tl from-gold/20 to-transparent rounded-full blur-xl"></div>
            </div>
          </div>

          {/* Row 2: Charts & Floor plan */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Revenue Chart */}
            <div className="glass-panel-luxury p-5 lg:col-span-2 relative">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <CircleDollarSign size={14} className="text-gold" />
                  <h3 className="text-sm font-semibold text-cream">Doanh thu</h3>
                </div>
                <button className="flex items-center gap-1 px-3 py-1 text-[10px] rounded border border-gold/20 text-muted hover:text-gold transition-colors">
                  Hôm nay <ChevronDown size={10} />
                </button>
              </div>
              <div className="absolute top-16 left-8">
                <div className="text-[9px] text-muted mb-0.5">(VNĐ)</div>
              </div>
              <div className="h-56 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyRev.length > 0 ? dailyRev : [{ day: '00:00', revenue: 0 }, { day: '04:00', revenue: 5000000 }, { day: '08:00', revenue: 12000000 }, { day: '12:00', revenue: 30000000 }, { day: '16:00', revenue: 20000000 }, { day: '20:00', revenue: 45000000 }, { day: '24:00', revenue: 40000000 }]}>
                    <defs>
                      <linearGradient id="revGradSolid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c9a447" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#c9a447" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,164,71,0.06)" vertical={false} />
                    <XAxis dataKey="day" stroke="#7a6040" fontSize={9} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#7a6040" fontSize={9} axisLine={false} tickLine={false} tickFormatter={v => v/1000000 + 'M'} dx={-10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#c9a447" strokeWidth={3} fill="url(#revGradSolid)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="glass-panel-luxury p-5 relative">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={14} className="text-gold" />
                <h3 className="text-sm font-semibold text-cream">Tỷ lệ loại bàn</h3>
              </div>
              <div className="flex flex-col items-center justify-center h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name: 'Bàn 2 người', value: 40}, {name: 'Bàn 4 người', value: 35}, {name: 'Bàn 6 người', value: 15}, {name: 'Bàn VIP', value: 10}]} cx="40%" cy="50%" innerRadius={50} outerRadius={70} stroke="none" dataKey="value">
                      <Cell fill="#c9a447" /> {/* Gold */}
                      <Cell fill="#e8c87a" /> {/* Light Gold */}
                      <Cell fill="#4a3b2c" /> {/* Dark Brown */}
                      <Cell fill="#2a2218" /> {/* Very Dark */}
                    </Pie>
                    <Tooltip formatter={v => v + '%'} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-xl font-serif text-gold glow-text leading-none">55%</div>
                  <div className="text-[8px] text-muted mt-1">Đang sử dụng</div>
                </div>
                {/* Custom Legend */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-3">
                   {[
                     { label: 'Bàn 2 người', pct: '40%', val: '(8 bàn)', color: 'bg-[#c9a447]' },
                     { label: 'Bàn 4 người', pct: '35%', val: '(7 bàn)', color: 'bg-[#e8c87a]' },
                     { label: 'Bàn 6 người', pct: '15%', val: '(3 bàn)', color: 'bg-[#4a3b2c]' },
                     { label: 'Bàn VIP', pct: '10%', val: '(2 bàn)', color: 'bg-[#2a2218]' },
                   ].map((lg, i) => (
                     <div key={i} className="flex items-start gap-2">
                       <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${lg.color}`} />
                       <div>
                         <div className="text-[10px] text-cream">{lg.label}</div>
                         <div className="text-[9px] text-muted">{lg.pct} <span className="opacity-60">{lg.val}</span></div>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            {/* 2D Mini Floor Plan */}
            <div className="glass-panel-luxury p-5 flex flex-col h-full relative border border-gold/20 overflow-hidden">
               {/* Background grid effect */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(201,164,71,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(201,164,71,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
               
               <div className="flex items-center gap-2 mb-4 relative z-10">
                <Table2 size={14} className="text-gold" />
                <h3 className="text-sm font-semibold text-cream">Sơ đồ bàn ăn</h3>
              </div>
              <div className="flex items-center gap-4 text-[9px] mb-4 relative z-10">
                 <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500/80 shadow-[0_0_5px_#22c55e]" /> Trống</div>
                 <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_5px_#c9a447]" /> Đang sử dụng</div>
                 <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/80 shadow-[0_0_5px_#3b82f6]" /> Đã đặt</div>
                 <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/80 shadow-[0_0_5px_#ef4444]" /> Bảo trì</div>
              </div>
              <div className="flex-1 relative border border-gold/10 rounded-lg bg-black/40 p-3 overflow-hidden shadow-inner">
                 {/* Decorative Plants/Zones */}
                 <div className="absolute top-2 right-2 w-16 h-16 bg-green-900/20 rounded-full blur-xl pointer-events-none"></div>
                 <div className="absolute bottom-2 left-2 w-20 h-20 bg-green-900/20 rounded-full blur-xl pointer-events-none"></div>
                 
                 {/* 2D Grid Layout Hardcoded for mockup exactness */}
                 <div className="w-full h-full relative min-h-[180px]">
                    {/* Row 1 */}
                    <div className="absolute top-[10%] left-[5%] w-[15%] h-[20%] bg-green-500/20 border border-green-500/50 rounded flex items-center justify-center text-[10px] text-green-400 font-serif shadow-[0_0_10px_rgba(34,197,94,0.2)]">01</div>
                    <div className="absolute top-[10%] left-[25%] w-[15%] h-[20%] bg-gold/20 border border-gold/50 rounded flex items-center justify-center text-[10px] text-gold font-serif shadow-[0_0_10px_rgba(201,164,71,0.2)]">02</div>
                    <div className="absolute top-[5%] left-[45%] w-[30%] h-[30%] bg-gold/20 border border-gold/50 rounded-full flex items-center justify-center text-[10px] text-gold font-serif shadow-[0_0_10px_rgba(201,164,71,0.2)]">03</div>
                    <div className="absolute top-[10%] left-[80%] w-[15%] h-[20%] bg-green-500/20 border border-green-500/50 rounded flex items-center justify-center text-[10px] text-green-400 font-serif shadow-[0_0_10px_rgba(34,197,94,0.2)]">04</div>

                    {/* Middle Section with VIP */}
                    <div className="absolute top-[40%] left-[15%] w-[15%] h-[20%] bg-blue-500/20 border border-blue-500/50 rounded flex items-center justify-center text-[10px] text-blue-400 font-serif shadow-[0_0_10px_rgba(59,130,246,0.2)]">05</div>
                    <div className="absolute top-[40%] left-[35%] w-[45%] h-[35%] bg-red-900/40 border border-red-500/50 rounded-lg flex items-center justify-center flex-col shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                       <span className="text-[10px] text-red-400 font-serif">VIP 01</span>
                       <span className="text-[7px] text-red-400/60 mt-1">Bảo trì</span>
                    </div>
                    <div className="absolute top-[45%] left-[85%] w-[10%] h-[25%] bg-green-500/20 border border-green-500/50 rounded flex items-center justify-center text-[9px] text-green-400 font-serif shadow-[0_0_10px_rgba(34,197,94,0.2)]">07</div>

                    {/* Bottom Row */}
                    <div className="absolute top-[75%] left-[5%] w-[15%] h-[20%] bg-gold/20 border border-gold/50 rounded flex items-center justify-center text-[10px] text-gold font-serif shadow-[0_0_10px_rgba(201,164,71,0.2)]">08</div>
                    <div className="absolute top-[80%] left-[25%] w-[15%] h-[15%] bg-green-500/20 border border-green-500/50 rounded flex items-center justify-center text-[10px] text-green-400 font-serif shadow-[0_0_10px_rgba(34,197,94,0.2)]">09</div>
                    <div className="absolute top-[80%] left-[45%] w-[15%] h-[15%] bg-green-500/20 border border-green-500/50 rounded flex items-center justify-center text-[10px] text-green-400 font-serif shadow-[0_0_10px_rgba(34,197,94,0.2)]">10</div>
                    <div className="absolute top-[75%] left-[65%] w-[20%] h-[20%] bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center text-[10px] text-blue-400 font-serif shadow-[0_0_10px_rgba(59,130,246,0.2)]">11</div>
                 </div>
              </div>
              <div className="text-center mt-2 text-[8px] text-muted tracking-[0.2em] uppercase">Lối vào</div>
            </div>
          </div>

          {/* Row 3: Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Đặt bàn mới nhất */}
            <div className="glass-panel-luxury p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-gold" />
                  <h3 className="text-sm font-semibold text-cream">Đặt bàn mới nhất</h3>
                </div>
                <button className="text-[10px] text-gold hover:text-gold-light transition-colors">Xem tất cả</button>
              </div>
              <div className="space-y-1">
                {[
                  { time: '10:15', name: 'Nguyễn Văn A', details: '4 người • 19:00', status: 'Đã xác nhận', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                  { time: '10:08', name: 'Trần Thị B', details: '2 người • 18:30', status: 'Đã xác nhận', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                  { time: '09:50', name: 'Lê Văn C', details: '6 người • 20:00', status: 'Chờ xác nhận', badge: 'bg-gold/20 text-gold border-gold/30' },
                  { time: '09:30', name: 'Phạm Thị D', details: '2 người • 17:30', status: 'Đã xác nhận', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                  { time: '09:20', name: 'Hoàng Văn E', details: '4 người • 19:30', status: 'Chờ xác nhận', badge: 'bg-gold/20 text-gold border-gold/30' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gold/5 last:border-0 hover:bg-gold/5 px-2 -mx-2 rounded transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted w-8">{r.time}</span>
                      <div className="flex items-center gap-2">
                        <Users size={12} className="text-muted" />
                        <span className="text-xs text-cream truncate w-24">{r.name}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted w-24 text-center">{r.details}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded border ${r.badge} whitespace-nowrap`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hóa đơn gần đây */}
            <div className="glass-panel-luxury p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <ScrollText size={14} className="text-gold" />
                  <h3 className="text-sm font-semibold text-cream">Hóa đơn gần đây</h3>
                </div>
                <button className="text-[10px] text-gold hover:text-gold-light transition-colors">Xem tất cả</button>
              </div>
              <div className="space-y-1">
                {[
                  { id: '#HD1287', time: '10:25', amount: '2.450.000 VNĐ', status: 'Đã thanh toán', badge: 'bg-green-500/20 text-green-400 border-green-500/30' },
                  { id: '#HD1286', time: '10:20', amount: '1.850.000 VNĐ', status: 'Đã thanh toán', badge: 'bg-green-500/20 text-green-400 border-green-500/30' },
                  { id: '#HD1285', time: '10:15', amount: '3.650.000 VNĐ', status: 'Đã thanh toán', badge: 'bg-green-500/20 text-green-400 border-green-500/30' },
                  { id: '#HD1284', time: '10:10', amount: '2.120.000 VNĐ', status: 'Chờ thanh toán', badge: 'bg-gold/20 text-gold border-gold/30' },
                  { id: '#HD1283', time: '09:58', amount: '1.320.000 VNĐ', status: 'Đã thanh toán', badge: 'bg-green-500/20 text-green-400 border-green-500/30' },
                ].map((inv, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gold/5 last:border-0 hover:bg-gold/5 px-2 -mx-2 rounded transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted w-12">{inv.id}</span>
                      <span className="text-[10px] text-muted">{inv.time}</span>
                    </div>
                    <span className="text-xs font-serif text-gold w-24 text-right">{inv.amount}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded border ${inv.badge} whitespace-nowrap`}>{inv.status}</span>
                  </div>
                ))}
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
              const STATUS_CFG = {
                available: { dot: 'bg-green-400', badge: 'status-available', label: 'Trống', glow: 'table-status-empty' },
                serving:   { dot: 'bg-red-400', badge: 'status-occupied', label: 'Có khách', glow: 'table-status-serving' },
                reserved:  { dot: 'bg-gold', badge: 'status-reserved', label: 'Đã đặt', glow: 'table-status-booked' },
                cleaning:  { dot: 'bg-cream-dim', badge: 'status-clearing', label: 'Cần dọn', glow: 'table-status-clearing' },
              };
              const cfg = STATUS_CFG[t.status] || { dot: 'bg-muted', badge: '', label: t.status, glow: '' };
              return (
                <div key={t._id} className={`relative glass-card p-4 border-2 group ${cfg.glow || ''}`}>
                  <button onClick={() => handleDeleteTable(t._id)} className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={10} /></button>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot} ${t.status === 'serving' ? 'animate-pulse' : ''}`} />
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
              <thead><tr><th>Khách hàng</th><th>Ngày</th><th>Giờ</th><th className="text-center">Số khách</th><th className="text-center">Bàn</th><th>Ghi chú</th><th className="text-center">Trạng thái</th><th className="text-right">Thao tác</th></tr></thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r._id}>
                    <td className="font-serif text-cream">{r.customerName || r.customer?.name || '—'}</td>
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
                    <td className="text-right">
                      <div className="flex gap-1 justify-end">
                        {r.status === 'pending' && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await reservationAPI.confirm(r._id, r.table?._id);
                                if (res.success) { toast.success('Đã xác nhận đặt bàn'); loadCRUDData(); }
                              } catch (err) { toast.error(err.message); }
                            }}
                            className="w-7 h-7 rounded border border-green-500/25 text-muted hover:text-green-400 hover:border-green-500/40 flex items-center justify-center transition-all text-[10px]" title="Xác nhận">
                            ✓
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(r.status) && (
                          <button
                            onClick={async () => {
                              if (!confirm('Hủy đặt bàn này?')) return;
                              try {
                                const res = await reservationAPI.cancel(r._id);
                                if (res.success) { toast.success('Đã hủy đặt bàn'); loadCRUDData(); }
                              } catch (err) { toast.error(err.message); }
                            }}
                            className="w-7 h-7 rounded border border-wine/15 text-muted hover:text-red-400 hover:border-wine/30 flex items-center justify-center transition-all text-[10px]" title="Hủy">
                            ✕
                          </button>
                        )}
                      </div>
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
      {/* ── AI ── */}
      {subTab === 'ai' && (
        <AIAssistantDashboard user={user} />
      )}

    </div>
  );
}

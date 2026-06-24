import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts';
import {
  CircleDollarSign, ScrollText, CalendarDays, Users, Star, BarChart3, Table2, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { invoiceAPI, tableAPI, reservationAPI } from '../../../../api';

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

export default function AnalyticsTab({ socket, onNavigateTab }) {
  const [summary, setSummary] = useState(null);
  const [dailyRev, setDailyRev] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => loadData();
      socket.on('table:statusUpdated', handleUpdate);
      socket.on('reservation:new', handleUpdate);
      socket.on('reservation:confirmed', handleUpdate);
      socket.on('order:new', handleUpdate);
      socket.on('order:itemsAdded', handleUpdate);
      socket.on('order:cancelled', handleUpdate);
      
      return () => {
        socket.off('table:statusUpdated', handleUpdate);
        socket.off('reservation:new', handleUpdate);
        socket.off('reservation:confirmed', handleUpdate);
        socket.off('order:new', handleUpdate);
        socket.off('order:itemsAdded', handleUpdate);
        socket.off('order:cancelled', handleUpdate);
      };
    }
  }, [socket]);

  const loadData = async () => {
    try {
      const [sumRes, dailyRes, topRes, tabRes, invRes, resRes] = await Promise.all([
        invoiceAPI.getStatistics(),
        invoiceAPI.getDailyRevenue(),
        invoiceAPI.getTopItems(),
        tableAPI.getTables(),
        invoiceAPI.getInvoices({ limit: 5 }),
        reservationAPI.getReservations({ limit: 5 })
      ]);
      if (sumRes.success) setSummary(sumRes.data);
      if (dailyRes.success) setDailyRev(dailyRes.data);
      if (topRes.success) setTopItems(topRes.data);
      if (tabRes.success) setTables(tabRes.data);
      if (invRes.success) setInvoices(invRes.data);
      if (resRes.success) setReservations(resRes.data);
    } catch (err) { toast.error('Lỗi tải báo cáo: ' + err.message); }
  };

  const occupiedTablesCount = tables.filter(t => t.status === 'serving' || t.status === 'cleaning').length;
  const pendingInvoicesCount = invoices.filter(inv => inv.paymentStatus === 'pending').length;
  const todayReservationsCount = reservations.filter(r => new Date(r.reservationDate).toDateString() === new Date().toDateString()).length;

  // Compute table capacity usage for Donut Chart
  const capStats = tables.reduce((acc, t) => {
    if (t.status === 'serving' || t.status === 'cleaning') {
      const key = t.capacity >= 8 ? 'VIP/Lớn' : `Bàn ${t.capacity} người`;
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});
  const pieData = Object.keys(capStats).map(name => ({ name, value: capStats[name] }));
  const COLORS = ['#c9a447', '#e8c87a', '#4a3b2c', '#2a2218'];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-cream mb-1">Xin chào, Manager 👋</h1>
          <p className="text-muted text-xs">Chúc bạn một ngày làm việc hiệu quả!</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="glass-panel-luxury p-4 relative overflow-hidden group border border-gold/15 hover:border-gold/30 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-muted">Doanh thu hôm nay</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-wood border border-gold/20 flex items-center justify-center">
              <CircleDollarSign size={14} className="text-gold" />
            </div>
          </div>
          <div className="font-serif text-2xl text-gold glow-text mb-2 tracking-wide">
            {summary?.todayRevenue != null ? (summary.todayRevenue / 1_000_000).toFixed(1) + 'M' : '—'}
            <span className="text-[10px] text-muted tracking-normal"> VNĐ</span>
          </div>
          <div className="text-[10px] text-muted">Tổng: {summary?.totalRevenue?.toLocaleString('vi-VN') || '—'} ₫</div>
        </div>

        <div className="glass-panel-luxury p-4 relative overflow-hidden group border border-gold/15 hover:border-gold/30 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-muted">Hóa đơn</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-wood border border-gold/20 flex items-center justify-center">
              <ScrollText size={14} className="text-gold" />
            </div>
          </div>
          <div className="font-serif text-2xl text-gold glow-text mb-2">{summary?.totalInvoices ?? '—'}</div>
          <div className="text-[10px] text-muted">Chờ: <span className="text-yellow-400">{pendingInvoicesCount}</span> hóa đơn</div>
        </div>

        <div className="glass-panel-luxury p-4 relative overflow-hidden group border border-gold/15 hover:border-gold/30 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-muted">Đặt bàn hôm nay</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-wood border border-gold/20 flex items-center justify-center">
              <CalendarDays size={14} className="text-gold" />
            </div>
          </div>
          <div className="font-serif text-2xl text-gold glow-text mb-2">{todayReservationsCount}</div>
          <div className="text-[10px] text-muted">Tổng: {reservations.length} lượt</div>
        </div>

        <div className="glass-panel-luxury p-4 relative overflow-hidden group border border-gold/15 hover:border-gold/30 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-muted">Bàn đang sử dụng</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-wood border border-gold/20 flex items-center justify-center">
              <Users size={14} className="text-gold" />
            </div>
          </div>
          <div className="font-serif text-2xl text-gold glow-text mb-2">
            {occupiedTablesCount} <span className="text-xs text-muted tracking-normal">/ {tables.length}</span>
          </div>
          <div className="text-[10px] text-muted">
            <span className="text-gold">{tables.length ? Math.round(occupiedTablesCount / tables.length * 100) : 0}%</span> bàn đang được sử dụng
          </div>
        </div>

        <div className="glass-panel-luxury p-4 relative overflow-hidden group border border-gold/15 hover:border-gold/30 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-muted">Món bán chạy</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/20 to-wood border border-gold/20 flex items-center justify-center">
              <Star size={14} className="text-gold" />
            </div>
          </div>
          <div className="font-serif text-sm text-gold glow-text mb-1 truncate">{topItems[0]?.name || '—'}</div>
          <div className="text-[10px] text-muted mt-2">Đã bán <span className="text-cream">{topItems[0]?.totalQuantity ?? '—'}</span> phần</div>
        </div>
      </div>

      {/* Row 2: Charts & Floor plan */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Revenue Chart */}
        <div className="glass-panel-luxury p-5 lg:col-span-2 relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <CircleDollarSign size={14} className="text-gold" />
              <h3 className="text-sm font-semibold text-cream">Doanh thu tháng này</h3>
            </div>
          </div>
          <div className="h-56 mt-2">
            {dailyRev.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyRev}>
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
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-xs">Chưa có dữ liệu doanh thu tháng này</div>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass-panel-luxury p-5 relative">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-gold" />
            <h3 className="text-sm font-semibold text-cream">Tỷ lệ sử dụng bàn</h3>
          </div>
          <div className="flex flex-col items-center justify-center h-48 relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="none" dataKey="value">
                    {pieData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => v + ' bàn'} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted text-xs">Chưa có bàn nào đang sử dụng</div>
            )}
          </div>
        </div>

        {/* Floor Plan (Dynamic) */}
        <div className="glass-panel-luxury p-5 flex flex-col h-full relative border border-gold/20 overflow-hidden">
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <Table2 size={14} className="text-gold" />
            <h3 className="text-sm font-semibold text-cream">Sơ đồ nhà hàng</h3>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar relative border border-gold/10 rounded-lg bg-black/40 p-2 shadow-inner">
            <div className="grid grid-cols-4 gap-2">
              {tables.map(t => {
                const STATUS_CFG = {
                  available: 'bg-green-500/20 border-green-500/50 text-green-400',
                  serving:   'bg-gold/20 border-gold/50 text-gold animate-pulse shadow-[0_0_10px_rgba(201,164,71,0.2)]',
                  reserved:  'bg-blue-500/20 border-blue-500/50 text-blue-400',
                  cleaning:  'bg-white/10 border-white/30 text-white/60',
                };
                return (
                  <div key={t._id} className={`h-10 border rounded flex items-center justify-center text-[10px] font-serif ${STATUS_CFG[t.status] || STATUS_CFG.available}`}>
                    {t.tableNumber}
                  </div>
                );
              })}
            </div>
            {tables.length === 0 && <div className="text-center text-muted text-xs mt-4">Chưa có bàn</div>}
          </div>
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
            <button className="text-[10px] text-gold hover:text-gold-light transition-colors" onClick={() => onNavigateTab('reservations')}>Xem tất cả</button>
          </div>
          <div className="space-y-1">
            {reservations.slice(0, 5).length === 0 ? (
              <p className="text-xs text-muted text-center py-4">Chưa có đặt bàn nào</p>
            ) : reservations.slice(0, 5).map((r, i) => {
              const statusLabel = r.status === 'confirmed' ? 'Đã xác nhận' : r.status === 'cancelled' ? 'Đã hủy' : 'Chờ xác nhận';
              const badgeCls = r.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : r.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-gold/20 text-gold border-gold/30';
              return (
                <div key={r._id || i} className="flex items-center justify-between py-2 border-b border-gold/5 last:border-0 hover:bg-gold/5 px-2 -mx-2 rounded transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted w-10 shrink-0">{r.reservationTime || '—'}</span>
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-muted" />
                      <span className="text-xs text-cream truncate w-24">{r.customerName || r.customer?.name || '—'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted w-20 text-center">{r.numberOfGuests} người</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded border ${badgeCls} whitespace-nowrap`}>{statusLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hóa đơn gần đây */}
        <div className="glass-panel-luxury p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ScrollText size={14} className="text-gold" />
              <h3 className="text-sm font-semibold text-cream">Hóa đơn gần đây</h3>
            </div>
            <button className="text-[10px] text-gold hover:text-gold-light transition-colors" onClick={() => onNavigateTab('invoices')}>Xem tất cả</button>
          </div>
          <div className="space-y-1">
            {invoices.slice(0, 5).length === 0 ? (
              <p className="text-xs text-muted text-center py-4">Chưa có hóa đơn nào</p>
            ) : invoices.slice(0, 5).map((inv, i) => (
              <div key={inv._id || i} className="flex items-center justify-between py-2 border-b border-gold/5 last:border-0 hover:bg-gold/5 px-2 -mx-2 rounded transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted w-14">#{inv._id?.substring(18) || '—'}</span>
                  <span className="text-[10px] text-muted">{new Date(inv.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <span className="text-xs font-serif text-gold w-28 text-right">{inv.total?.toLocaleString('vi-VN')} ₫</span>
                <span className={`text-[9px] px-2 py-0.5 rounded border whitespace-nowrap ${inv.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gold/20 text-gold border-gold/30'}`}>{inv.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

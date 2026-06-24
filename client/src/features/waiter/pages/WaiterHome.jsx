import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Table2, ShoppingBag, Calendar,
  Bell, Clock, Users, TrendingUp, RefreshCw,
  ChevronRight, CheckCircle2, Circle, Utensils,
} from 'lucide-react';
import { tableAPI, orderAPI, reservationAPI } from '../../../api';
import toast from 'react-hot-toast';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)}p trước`;
  return `${Math.floor(diff / 3600)}h trước`;
};

export default function WaiterHome({ socket, user, notifications = [], onClearNotifications }) {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [tRes, oRes, rRes] = await Promise.all([
        tableAPI.getTables(),
        orderAPI.getOrders({ status: 'open,serving', limit: 50 }),
        reservationAPI.getReservations(),
      ]);
      if (tRes.success) setTables(tRes.data);
      if (oRes.success) setOrders(oRes.data);
      if (rRes.success) {
        const today = new Date().toDateString();
        setReservations(rRes.data.filter(r =>
          ['pending', 'confirmed'].includes(r.status) &&
          new Date(r.reservationDate).toDateString() === today
        ));
      }
    } catch (err) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (socket) {
      socket.on('table:statusUpdated', load);
      socket.on('order:new', load);
      socket.on('reservation:new', load);
    }
    return () => {
      if (socket) {
        socket.off('table:statusUpdated', load);
        socket.off('order:new', load);
        socket.off('reservation:new', load);
      }
    };
  }, [socket]);

  const counts = {
    available: tables.filter(t => t.status === 'available').length,
    serving: tables.filter(t => t.status === 'serving').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  };
  const pendingItems = orders.reduce((sum, o) =>
    sum + o.items.filter(i => i.status === 'pending').length, 0
  );
  const servingTables = tables.filter(t => t.status === 'serving');

  const stats = [
    { icon: Table2,      label: 'Bàn trống',       value: counts.available, color: 'text-emerald-400', bg: 'bg-emerald-400/8',  border: 'border-emerald-400/15' },
    { icon: Users,       label: 'Đang phục vụ',    value: counts.serving,   color: 'text-amber-400',   bg: 'bg-amber-400/8',    border: 'border-amber-400/15' },
    { icon: Calendar,    label: 'Đặt bàn hôm nay', value: reservations.length, color: 'text-sky-400',  bg: 'bg-sky-400/8',      border: 'border-sky-400/15' },
    { icon: Utensils,    label: 'Món chờ bếp',     value: pendingItems,     color: 'text-red-400',     bg: 'bg-red-400/8',      border: 'border-red-400/15' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buổi sáng' : hour < 18 ? 'Buổi chiều' : 'Buổi tối';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-gold tracking-wide">
            {greeting}, {user?.name?.split(' ').slice(-1)[0] || 'Phục vụ'} 👋
          </h1>
          <p className="text-muted text-xs mt-1 tracking-wider">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="btn-ghost flex items-center gap-1.5 text-[11px]">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${bg} ${border} p-4 flex items-center gap-3 transition-all hover:scale-[1.02]`}>
            <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <div className={`text-2xl font-serif tabular-nums ${color}`}>{loading ? '—' : value}</div>
              <div className="text-[10px] text-muted uppercase tracking-wider">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Serving tables overview */}
        <div className="lg:col-span-2 glass-panel-luxury p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2">
              <Table2 size={14} className="text-gold" /> Bàn đang phục vụ
            </h2>
            <span className="text-[10px] text-muted">{servingTables.length} bàn</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          ) : servingTables.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-3">🪑</div>
              <p className="text-muted text-xs">Chưa có bàn nào đang phục vụ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {servingTables.map(t => {
                const order = orders.find(o =>
                  o.table?._id === t._id || o.table === t._id
                );
                const pending = order?.items.filter(i => i.status === 'pending').length || 0;
                const cooking = order?.items.filter(i => i.status === 'cooking').length || 0;
                return (
                  <div key={t._id}
                    className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-base text-gold">{t.tableNumber}</span>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                    <div className="text-[10px] text-muted">{t.area} · {t.capacity} người</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {pending > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-400/10 border border-red-400/20 text-red-400">
                          ⏳ {pending} chờ
                        </span>
                      )}
                      {cooking > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-400/10 border border-orange-400/20 text-orange-400">
                          🔥 {cooking} đang làm
                        </span>
                      )}
                      {pending === 0 && cooking === 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-400/10 border border-green-400/20 text-green-400">
                          ✅ Xong hết
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Notifications + Today reservations */}
        <div className="space-y-4">
          {/* Realtime notifications */}
          <div className="glass-panel-luxury p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="section-title flex items-center gap-2">
                <Bell size={13} className="text-gold" /> Thông báo
              </h2>
              {notifications.length > 0 && (
                <button onClick={onClearNotifications}
                  className="text-[10px] text-muted hover:text-cream transition-colors">
                  Xoá tất cả
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="py-6 text-center">
                <Bell size={24} className="text-muted/30 mx-auto mb-2" />
                <p className="text-[11px] text-muted">Chưa có thông báo mới</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                {notifications.map((n, i) => (
                  <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all ${
                    n.type === 'reservation'
                      ? 'bg-sky-400/5 border-sky-400/15'
                      : 'bg-amber-400/5 border-amber-400/15'
                  }`}>
                    <span className="text-base shrink-0">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-cream leading-snug">{n.message}</p>
                      <p className="text-[10px] text-muted mt-0.5">{timeAgo(n.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's reservations */}
          <div className="glass-panel-luxury p-4 space-y-3">
            <h2 className="section-title flex items-center gap-2">
              <Calendar size={13} className="text-gold" /> Đặt bàn hôm nay
            </h2>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
            ) : reservations.length === 0 ? (
              <div className="py-6 text-center">
                <Calendar size={24} className="text-muted/30 mx-auto mb-2" />
                <p className="text-[11px] text-muted">Không có đặt bàn hôm nay</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                {reservations.sort((a, b) => a.reservationTime.localeCompare(b.reservationTime)).map(r => (
                  <div key={r._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-gold/5 border border-gold/10 hover:border-gold/20 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center shrink-0">
                      <Clock size={13} className="text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-cream font-medium truncate">{r.customerName}</div>
                      <div className="text-[10px] text-muted">
                        {r.reservationTime} · {r.numberOfGuests} khách
                        {r.table && ` · Bàn ${r.table.tableNumber}`}
                      </div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border shrink-0 ${
                      r.status === 'confirmed'
                        ? 'bg-green-400/10 border-green-400/20 text-green-400'
                        : 'bg-amber-400/10 border-amber-400/20 text-amber-400'
                    }`}>
                      {r.status === 'confirmed' ? '✓ Xác nhận' : '⏳ Chờ'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

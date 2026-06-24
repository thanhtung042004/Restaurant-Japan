import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Users, RefreshCw, Plus, Play,
  LayoutGrid, ListOrdered, Utensils,
  CreditCard, Percent, Receipt, ClipboardCheck,
  Phone, Clock, FileText, User, Calendar, Wifi, WifiOff,
  ChevronRight, X, Minus,
} from 'lucide-react';
import { tableAPI, menuAPI, orderAPI, invoiceAPI, categoryAPI, reservationAPI } from '../../../api';

const STATUS_CFG = {
  available: { label: 'Trống',        cls: 'table-status-empty',    badge: 'status-available', dot: 'bg-emerald-400', ring: 'border-emerald-400/30' },
  reserved:  { label: 'Đã đặt',       cls: 'table-status-booked',   badge: 'status-reserved',  dot: 'bg-amber-400',   ring: 'border-amber-400/30' },
  serving:   { label: 'Phục vụ',      cls: 'table-status-serving',  badge: 'status-occupied',  dot: 'bg-red-400',     ring: 'border-red-400/30' },
  cleaning:  { label: 'Cần dọn',      cls: 'table-status-clearing', badge: 'status-clearing',  dot: 'bg-slate-400',   ring: 'border-slate-400/30' },
};

const FILTERS = [
  { value: 'all',       label: 'Tất cả' },
  { value: 'available', label: 'Trống' },
  { value: 'serving',   label: 'Phục vụ' },
  { value: 'reserved',  label: 'Đã đặt' },
  { value: 'cleaning',  label: 'Cần dọn' },
];

export default function WaiterDashboard({ socket }) {
  const [tables, setTables]             = useState([]);
  const [categories, setCategories]     = useState([]);
  const [menuItems, setMenuItems]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [socketOk, setSocketOk]         = useState(false);

  const [selectedTable, setSelectedTable]   = useState(null);
  const [activeOrder, setActiveOrder]       = useState(null);
  const [tableReservation, setTableReservation] = useState(null);
  const [cart, setCart]                     = useState([]);
  const [discountPercent, setDiscountPercent] = useState('0');
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);
  const [catFilter, setCatFilter]           = useState('all');
  const [paymentMethod, setPaymentMethod]   = useState('cash');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [confirmClose, setConfirmClose]     = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tRes, catRes, mRes] = await Promise.all([
        tableAPI.getTables(),
        categoryAPI.getCategories(),
        menuAPI.getItems({ limit: 200 }),
      ]);
      if (tRes.success)   setTables(tRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (mRes.success)   setMenuItems(mRes.data);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    if (!socket) return;

    setSocketOk(socket.connected);
    socket.on('connect',    () => setSocketOk(true));
    socket.on('disconnect', () => setSocketOk(false));

    socket.on('table:statusUpdated', ({ tableId, status }) => {
      setTables(prev => prev.map(t => t._id === tableId ? { ...t, status } : t));
      setSelectedTable(prev => prev?._id === tableId ? { ...prev, status } : prev);
    });

    socket.on('reservation:new', (r) => {
      if (r.table) {
        const tid = r.table._id || r.table;
        setTables(prev => prev.map(t => t._id === tid ? { ...t, status: 'reserved' } : t));
      }
      toast(`📅 Đặt bàn mới: ${r.customerName}`, { duration: 6000 });
    });

    socket.on('order:new', (order) => {
      setTables(prev => prev.map(t =>
        t._id === (order.table?._id || order.table) ? { ...t, status: 'serving' } : t
      ));
      setSelectedTable(cur => {
        if (cur && (order.table?._id === cur._id || order.table === cur._id)) {
          setActiveOrder(order);
        }
        return cur;
      });
    });

    socket.on('order:itemStatusUpdated', ({ orderId, itemId, status }) => {
      setActiveOrder(prev => {
        if (!prev || prev._id !== orderId) return prev;
        return { ...prev, items: prev.items.map(i => i._id === itemId ? { ...i, status } : i) };
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('table:statusUpdated');
      socket.off('reservation:new');
      socket.off('order:new');
      socket.off('order:itemStatusUpdated');
    };
  }, [socket, loadData]);

  const handleTableClick = async (table) => {
    setSelectedTable(table);
    setCart([]);
    setActiveOrder(null);
    setTableReservation(null);
    setCheckoutInvoice(null);
    setConfirmClose(false);

    // Load today's reservation for this table
    try {
      const res = await reservationAPI.getReservations();
      if (res.success) {
        const today = new Date().toDateString();
        const found = res.data.find(r =>
          ['pending', 'confirmed'].includes(r.status) &&
          r.table && (r.table._id === table._id || r.table === table._id) &&
          new Date(r.reservationDate).toDateString() === today
        );
        setTableReservation(found || null);
      }
    } catch { /* silent */ }

    if (['serving', 'cleaning'].includes(table.status)) {
      try {
        const res = await orderAPI.getOrders({ table: table._id, status: 'open,serving' });
        if (res.success && res.data.length > 0) setActiveOrder(res.data[0]);
      } catch { /* silent */ }
    }
  };

  const handleOpenTable = async () => {
    try {
      const res = await tableAPI.updateStatus(selectedTable._id, 'serving');
      if (res.success) {
        toast.success(`✅ Mở bàn ${selectedTable.tableNumber}`);
        const updated = { ...selectedTable, status: 'serving' };
        setSelectedTable(updated);
        setTables(prev => prev.map(t => t._id === updated._id ? updated : t));
        if (tableReservation) {
          await reservationAPI.confirm(tableReservation._id, selectedTable._id).catch(() => {});
          setTableReservation(null);
        }
      }
    } catch (err) { toast.error(err.message); }
  };

  const handleFinishCleaning = async () => {
    try {
      const res = await tableAPI.updateStatus(selectedTable._id, 'available');
      if (res.success) {
        toast.success(`✨ Bàn ${selectedTable.tableNumber} sẵn sàng`);
        const updated = { ...selectedTable, status: 'available' };
        setSelectedTable(updated);
        setTables(prev => prev.map(t => t._id === updated._id ? updated : t));
      }
    } catch (err) { toast.error(err.message); }
  };

  const handleMarkClearing = async () => {
    try {
      const res = await tableAPI.updateStatus(selectedTable._id, 'cleaning');
      if (res.success) {
        toast.success(`🧹 Bàn ${selectedTable.tableNumber} chờ dọn`);
        loadData();
        setSelectedTable(null);
        setActiveOrder(null);
        setCart([]);
        setConfirmClose(false);
      }
    } catch (err) { toast.error(err.message); }
  };

  const addToCart = (item) => {
    if (!item.isAvailable) { toast.error('Món này tạm hết'); return; }
    setCart(prev => {
      const ex = prev.find(i => i.item._id === item._id);
      return ex
        ? prev.map(i => i.item._id === item._id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { item, quantity: 1 }];
    });
  };

  const updateQty = (itemId, qty) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.item._id !== itemId)); return; }
    setCart(prev => prev.map(i => i.item._id === itemId ? { ...i, quantity: qty } : i));
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    try {
      const mapped = cart.map(i => ({ menuItemId: i.item._id, quantity: i.quantity, note: '' }));
      let res;
      if (!activeOrder) {
        res = await orderAPI.create({ tableId: selectedTable._id, items: mapped });
      } else {
        res = await orderAPI.addItems(activeOrder._id, mapped);
      }
      if (res.success) {
        toast.success('🍽️ Gửi món xuống bếp!');
        setActiveOrder(res.data);
        setCart([]);
        loadData();
      }
    } catch (err) { toast.error(err.message); }
  };

  const getSubtotal = () =>
    activeOrder?.items.filter(i => i.status !== 'cancelled')
      .reduce((s, i) => s + (i.price || 0) * i.quantity, 0) || 0;

  const calcBill = () => {
    const sub  = getSubtotal();
    const disc = Math.round(sub * Number(discountPercent) / 100);
    const after = sub - disc;
    const vat   = Math.round(after * 0.08);
    return { sub, disc, vat, total: after + vat };
  };

  const handleCheckout = async () => {
    if (!activeOrder) return;
    setCheckoutLoading(true);
    try {
      const res = await invoiceAPI.create({
        orderId: activeOrder._id,
        discountPercent: Number(discountPercent),
        vatPercent: 8,
        paymentMethod,
      });
      if (res.success) {
        toast.success('💳 Thanh toán thành công!');
        setCheckoutInvoice(res.data);
        setActiveOrder(null);
        setSelectedTable(null);
        setCart([]);
        loadData();
      }
    } catch (err) { toast.error(err.message); }
    finally { setCheckoutLoading(false); }
  };

  const filtered = statusFilter === 'all' ? tables : tables.filter(t => t.status === statusFilter);
  const filteredMenu = catFilter === 'all'
    ? menuItems
    : menuItems.filter(m => m.category?._id === catFilter || m.category === catFilter);
  const bill = calcBill();
  const counts = {
    available: tables.filter(t => t.status === 'available').length,
    reserved:  tables.filter(t => t.status === 'reserved').length,
    serving:   tables.filter(t => t.status === 'serving').length,
    cleaning:  tables.filter(t => t.status === 'cleaning').length,
  };
  const canOrder = selectedTable && ['serving', 'reserved'].includes(selectedTable.status);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <LayoutGrid size={16} className="text-gold" /> Sơ Đồ Bàn & Gọi Món
            </h1>
            <p className="section-subtitle mt-0.5">Quản lý bàn · Nhận order · Thanh toán</p>
          </div>
          {/* Socket indicator */}
          <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
            socketOk
              ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
              : 'text-muted border-muted/20 bg-muted/5'
          }`}>
            {socketOk
              ? <><Wifi size={10} /><span>Live</span></>
              : <><WifiOff size={10} /><span>Offline</span></>}
          </div>
        </div>
        <button onClick={loadData} className="btn-ghost flex items-center gap-1.5 text-[11px]">
          <RefreshCw size={12} /> Làm mới
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Trống',        count: counts.available, color: 'text-emerald-400', bg: 'bg-emerald-400/8',  border: 'border-emerald-400/15' },
          { label: 'Đã đặt',      count: counts.reserved,  color: 'text-amber-400',   bg: 'bg-amber-400/8',    border: 'border-amber-400/15' },
          { label: 'Phục vụ',     count: counts.serving,   color: 'text-red-400',     bg: 'bg-red-400/8',      border: 'border-red-400/15' },
          { label: 'Cần dọn',     count: counts.cleaning,  color: 'text-slate-400',   bg: 'bg-slate-400/8',    border: 'border-slate-400/15' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.bg} ${s.border} p-3 text-center`}>
            <div className={`text-2xl font-serif tabular-nums ${s.color}`}>{s.count}</div>
            <div className="text-[9px] text-muted uppercase tracking-wider mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid: floor + panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Floor plan */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter tabs */}
          <div className="flex gap-1 border-b border-gold/10">
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                className={`luxury-tab ${statusFilter === f.value ? 'active' : ''}`}>
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map(t => {
                const cfg = STATUS_CFG[t.status] || STATUS_CFG.available;
                const isSelected = selectedTable?._id === t._id;
                return (
                  <button
                    key={t._id}
                    onClick={() => handleTableClick(t)}
                    className={`relative p-4 rounded-xl border-2 bg-bg-2 flex flex-col gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] text-left ${cfg.cls} ${
                      isSelected ? 'ring-2 ring-gold ring-offset-1 ring-offset-bg scale-[1.02]' : ''
                    }`}
                  >
                    <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${cfg.dot} ${
                      t.status === 'serving' ? 'animate-pulse' : ''
                    }`} />
                    <div className="font-serif text-lg text-gold leading-none">{t.tableNumber}</div>
                    <div className="flex items-center gap-1 text-[10px] text-muted">
                      <Users size={9} /> {t.capacity} người
                    </div>
                    <div className="text-[9px] text-muted/60 uppercase tracking-wider">{t.area}</div>
                    <span className={`status-badge ${cfg.badge} mt-auto`}>{cfg.label}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-4 py-12 text-center text-muted text-xs">Không có bàn nào</div>
              )}
            </div>
          )}
        </div>

        {/* Order panel */}
        <div className="glass-panel-luxury flex flex-col min-h-[500px] max-h-[80vh] overflow-hidden">
          {selectedTable ? (
            <div className="flex flex-col h-full">
              {/* Table header */}
              <div className="px-4 py-3.5 border-b border-gold/10 bg-gradient-to-r from-wood/30 to-bg-3/40 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base text-gold">Bàn {selectedTable.tableNumber}</h3>
                    <p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
                      {selectedTable.area} · {selectedTable.capacity} người ·{' '}
                      <span className={`font-medium ${
                        selectedTable.status === 'available' ? 'text-emerald-400' :
                        selectedTable.status === 'serving'   ? 'text-red-400' :
                        selectedTable.status === 'reserved'  ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {STATUS_CFG[selectedTable.status]?.label}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedTable.status === 'available' && (
                      <button onClick={handleOpenTable} className="btn-gold text-[10px]">✓ Mở bàn</button>
                    )}
                    {selectedTable.status === 'reserved' && (
                      <button onClick={handleOpenTable} className="btn-gold text-[10px]">✓ Nhận bàn</button>
                    )}
                    {selectedTable.status === 'serving' && (
                      <button onClick={() => setConfirmClose(true)}
                        className="btn-ghost text-[10px] flex items-center gap-1 text-slate-400 border-slate-400/20">
                        <ClipboardCheck size={11} /> Dọn bàn
                      </button>
                    )}
                    {selectedTable.status === 'cleaning' && (
                      <button onClick={handleFinishCleaning}
                        className="btn-ghost text-[10px] flex items-center gap-1 text-emerald-400 border-emerald-400/20">
                        <ClipboardCheck size={11} /> Xong dọn
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                {/* Reservation info */}
                {tableReservation && (
                  <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
                      <Calendar size={10} /> Thông tin đặt bàn
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <User size={10} className="text-muted shrink-0" />
                        <span className="text-cream">{tableReservation.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Phone size={10} className="text-muted shrink-0" />
                        <span className="text-cream">{tableReservation.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock size={10} className="text-muted shrink-0" />
                        <span className="text-cream">{tableReservation.reservationTime} · {new Date(tableReservation.reservationDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Users size={10} className="text-muted shrink-0" />
                        <span className="text-cream">{tableReservation.numberOfGuests} khách</span>
                      </div>
                      {tableReservation.note && (
                        <div className="flex items-start gap-2 text-xs">
                          <FileText size={10} className="text-muted shrink-0 mt-0.5" />
                          <span className="text-muted italic">"{tableReservation.note}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Active order items */}
                {activeOrder && (
                  <div>
                    <div className="section-subtitle mb-2 flex items-center gap-1.5">
                      <ListOrdered size={11} /> Đơn #{activeOrder._id.slice(-6)}
                    </div>
                    <div className="space-y-1 max-h-52 overflow-y-auto no-scrollbar">
                      {activeOrder.items
                        .filter(i => i.status !== 'cancelled')
                        .map((i, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-gold/6 text-xs">
                            <div>
                              <span className="text-cream font-medium">{i.menuItem?.name || i.name}</span>
                              <span className="text-muted ml-2">×{i.quantity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gold text-[10px]">
                                {((i.price || 0) * i.quantity).toLocaleString('vi-VN')} ₫
                              </span>
                              <span className={`status-badge ${
                                i.status === 'pending' ? 'status-pending' :
                                i.status === 'cooking' ? 'status-cooking' : 'status-ready'
                              }`}>
                                {i.status === 'pending' ? '⏳ Chờ' : i.status === 'cooking' ? '🔥 Làm' : '✅ Xong'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Cart */}
                {canOrder && (
                  <div>
                    <div className="section-subtitle mb-2 flex items-center gap-1.5">
                      <Plus size={11} /> {activeOrder ? 'Gọi thêm' : 'Gọi món mới'}
                    </div>
                    {cart.length === 0 ? (
                      <p className="text-[11px] text-muted italic">Chọn món từ thực đơn bên dưới</p>
                    ) : (
                      <div className="space-y-1.5">
                        {cart.map(ci => (
                          <div key={ci.item._id} className="flex items-center justify-between bg-gold/5 border border-gold/10 rounded-lg px-3 py-2">
                            <span className="text-xs text-cream truncate max-w-[110px]">{ci.item.name}</span>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => updateQty(ci.item._id, ci.quantity - 1)}
                                className="w-5 h-5 rounded border border-gold/20 text-gold hover:bg-gold/10 flex items-center justify-center">
                                <Minus size={9} />
                              </button>
                              <span className="text-xs text-cream w-4 text-center">{ci.quantity}</span>
                              <button onClick={() => updateQty(ci.item._id, ci.quantity + 1)}
                                className="w-5 h-5 rounded border border-gold/20 text-gold hover:bg-gold/10 flex items-center justify-center">
                                <Plus size={9} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button onClick={handleSubmitOrder}
                          className="w-full btn-gold flex items-center justify-center gap-2 mt-2">
                          <Play size={11} /> Gửi xuống bếp
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty states */}
                {!canOrder && !activeOrder && selectedTable.status === 'available' && (
                  <div className="text-center py-10 text-muted text-xs">
                    <div className="text-4xl mb-3">🪑</div>
                    <p>Bàn đang trống</p>
                    <p className="text-muted/60 mt-1">Nhấn "Mở bàn" để bắt đầu phục vụ</p>
                  </div>
                )}
                {!activeOrder && selectedTable.status === 'cleaning' && (
                  <div className="text-center py-10 text-muted text-xs">
                    <div className="text-4xl mb-3">🧹</div>
                    <p>Bàn đang chờ dọn dẹp</p>
                  </div>
                )}
              </div>

              {/* Checkout */}
              {activeOrder && getSubtotal() > 0 && (
                <div className="p-4 border-t border-gold/10 bg-bg-2/60 shrink-0 space-y-3">
                  <div className="section-subtitle flex items-center gap-1.5">
                    <Receipt size={11} /> Thanh toán
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Percent size={10} className="text-muted" />
                    <select value={discountPercent} onChange={e => setDiscountPercent(e.target.value)}
                      className="luxury-input luxury-select flex-1 py-1.5 text-xs h-7">
                      {['0','5','10','15','20'].map(v => <option key={v} value={v}>{v}% giảm</option>)}
                    </select>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                      className="luxury-input luxury-select flex-1 py-1.5 text-xs h-7">
                      <option value="cash">Tiền mặt</option>
                      <option value="transfer">Chuyển khoản</option>
                      <option value="card">Thẻ</option>
                    </select>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-muted">
                      <span>Tạm tính:</span><span>{bill.sub.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    {bill.disc > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Giảm ({discountPercent}%):</span><span>−{bill.disc.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted">
                      <span>VAT (8%):</span><span>+{bill.vat.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="flex justify-between text-gold font-serif font-semibold text-sm border-t border-gold/10 pt-1.5 mt-1.5">
                      <span>Tổng:</span><span>{bill.total.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                  <button onClick={handleCheckout} disabled={checkoutLoading}
                    className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50">
                    <CreditCard size={13} />
                    {checkoutLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gold/8 border border-gold/15 flex items-center justify-center">
                <LayoutGrid size={28} className="text-gold/40" />
              </div>
              <p className="text-sm text-muted font-serif tracking-wider">Chọn một bàn</p>
              <p className="text-[11px] text-muted/60">để bắt đầu phục vụ</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu catalog */}
      {canOrder && (
        <div className="glass-panel-luxury p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="section-title flex items-center gap-2">
              <Utensils size={14} /> Thực Đơn Gọi Món
            </h3>
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setCatFilter('all')}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${catFilter === 'all' ? 'border-gold/35 text-gold bg-gold/8' : 'border-gold/10 text-muted hover:text-cream'}`}>
                Tất cả
              </button>
              {categories.map(c => (
                <button key={c._id} onClick={() => setCatFilter(c._id)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${catFilter === c._id ? 'border-gold/35 text-gold bg-gold/8' : 'border-gold/10 text-muted hover:text-cream'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
            {filteredMenu.map(item => {
              const inCart = cart.find(c => c.item._id === item._id);
              return (
                <button
                  key={item._id}
                  onClick={() => addToCart(item)}
                  disabled={!item.isAvailable}
                  className={`glass-card p-3 text-left transition-all relative ${
                    !item.isAvailable ? 'opacity-40 cursor-not-allowed' : 'hover:border-gold/30 hover:scale-[1.02]'
                  }`}
                >
                  {inCart && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center text-[9px] text-bg font-bold">
                      {inCart.quantity}
                    </div>
                  )}
                  <div className="font-serif text-xs text-cream truncate pr-6">{item.name}</div>
                  <div className="text-[10px] text-gold mt-1">{item.price.toLocaleString('vi-VN')} ₫</div>
                  {!item.isAvailable && (
                    <span className="text-[9px] text-red-400 uppercase tracking-wider">Hết</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirm dọn bàn */}
      {confirmClose && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50" onClick={() => setConfirmClose(false)}>
          <div className="glass-panel-luxury p-6 max-w-sm w-full mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-gold">Dọn bàn {selectedTable?.tableNumber}?</h3>
              <button onClick={() => setConfirmClose(false)} className="text-muted hover:text-cream"><X size={16} /></button>
            </div>
            <p className="text-xs text-muted mb-5">Đảm bảo đã thanh toán trước khi dọn bàn. Bàn sẽ chuyển sang trạng thái "Cần dọn".</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmClose(false)} className="btn-ghost flex-1">Huỷ</button>
              <button onClick={handleMarkClearing} className="btn-gold flex-1">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout success */}
      {checkoutInvoice && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50" onClick={() => setCheckoutInvoice(null)}>
          <div className="glass-panel-luxury p-8 max-w-sm w-full mx-4 text-center animate-scale-in">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-serif text-xl text-gold tracking-wider mb-2">Thanh Toán Thành Công</h3>
            <div className="text-xl font-serif text-cream mb-1">
              {checkoutInvoice.total?.toLocaleString('vi-VN')} ₫
            </div>
            <p className="text-xs text-muted mb-6">Cảm ơn quý khách đã sử dụng dịch vụ Sakura!</p>
            <button onClick={() => setCheckoutInvoice(null)} className="btn-ghost text-[11px]">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

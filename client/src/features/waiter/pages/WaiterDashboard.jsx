import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Users, RefreshCw, Plus, Play, Check,
  ChevronRight, LayoutGrid, ListOrdered, Utensils,
  CreditCard, Percent, Receipt, AlertCircle
} from 'lucide-react';
import { tableAPI, menuAPI, orderAPI, invoiceAPI, categoryAPI } from '../../../api';

const TABLE_STATUS_CONFIG = {
  available: { label: 'Trống', cssClass: 'table-status-empty', badge: 'status-available', dot: 'bg-green-400' },
  reserved:  { label: 'Đã đặt', cssClass: 'table-status-booked', badge: 'status-reserved', dot: 'bg-gold' },
  occupied:  { label: 'Đang phục vụ', cssClass: 'table-status-serving', badge: 'status-occupied', dot: 'bg-red-400' },
  clearing:  { label: 'Cần dọn', cssClass: 'table-status-clearing', badge: 'status-clearing', dot: 'bg-cream-dim' },
};

export default function WaiterDashboard() {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedTable, setSelectedTable] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState('0');
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);
  const [catFilter, setCatFilter] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tableRes, catRes, menuRes] = await Promise.all([
        tableAPI.getTables(),
        categoryAPI.getCategories(),
        menuAPI.getItems({ limit: 100 })
      ]);
      if (tableRes.success) setTables(tableRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (menuRes.success) setMenuItems(menuRes.data);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleTableClick = async (table) => {
    setSelectedTable(table);
    setCart([]);
    setActiveOrder(null);
    setCheckoutInvoice(null);
    if (table.status === 'occupied') {
      try {
        const res = await orderAPI.getOrders({ table: table._id, status: 'pending,cooking,ready' });
        if (res.success && res.data.length > 0) setActiveOrder(res.data[0]);
        else toast.error('Không tìm thấy đơn hàng đang hoạt động');
      } catch (err) { toast.error('Không thể tải đơn hàng: ' + err.message); }
    }
  };

  const handleOpenTable = async () => {
    try {
      const res = await tableAPI.updateStatus(selectedTable._id, 'occupied');
      if (res.success) {
        toast.success(`✅ Mở bàn ${selectedTable.tableNumber}`);
        const orderRes = await orderAPI.create({ tableId: selectedTable._id, items: [] });
        if (orderRes.success) setActiveOrder(orderRes.data);
        loadData();
      }
    } catch (err) { toast.error(err.message); }
  };

  const addToCart = (item) => {
    if (!item.isAvailable) { toast.error('Món này tạm hết'); return; }
    setCart(prev => {
      const ex = prev.find(i => i.item._id === item._id);
      if (ex) return prev.map(i => i.item._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCartQty = (itemId, qty) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.item._id !== itemId)); return; }
    setCart(prev => prev.map(i => i.item._id === itemId ? { ...i, quantity: qty } : i));
  };

  const handleSubmitOrderItems = async () => {
    if (cart.length === 0) return;
    try {
      const res = await orderAPI.addItems(activeOrder._id, cart.map(i => ({
        menuItem: i.item._id, quantity: i.quantity, notes: ''
      })));
      if (res.success) {
        toast.success('🍽️ Gửi món xuống bếp thành công!');
        setActiveOrder(res.data);
        setCart([]);
        loadData();
      }
    } catch (err) { toast.error(err.message); }
  };

  const getSubtotal = () => activeOrder?.items.reduce((s, i) => s + i.priceAtOrder * i.quantity, 0) || 0;

  const calcBill = () => {
    const sub = getSubtotal();
    const disc = Math.round(sub * (Number(discountPercent) / 100));
    const vat = Math.round((sub - disc) * 0.1);
    return { sub, disc, vat, total: sub - disc + vat };
  };

  const handleCheckout = async () => {
    const { disc, vat } = calcBill();
    setCheckoutLoading(true);
    try {
      const res = await invoiceAPI.create({
        orderId: activeOrder._id,
        discount: disc,
        vat,
        paymentMethod
      });
      if (res.success) {
        toast.success('💳 Thanh toán thành công!');
        setCheckoutInvoice(res.data);
        setActiveOrder(null);
        setSelectedTable(null);
        loadData();
      }
    } catch (err) { toast.error(err.message); }
    finally { setCheckoutLoading(false); }
  };

  const filteredTables = statusFilter === 'all' ? tables : tables.filter(t => t.status === statusFilter);
  const filteredMenu = catFilter === 'all'
    ? menuItems
    : menuItems.filter(m => m.category?._id === catFilter || m.category === catFilter);

  const bill = calcBill();

  const statusCounts = {
    available: tables.filter(t => t.status === 'available').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <LayoutGrid size={16} className="text-gold" /> Sơ Đồ Nhà Hàng & Gọi Món
          </h1>
          <p className="section-subtitle mt-1">Quản lý bàn · Nhận order · Thanh toán</p>
        </div>
        <button onClick={loadData} className="btn-ghost flex items-center gap-1.5 text-[11px] self-start">
          <RefreshCw size={12} /> Làm mới
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Trống', count: statusCounts.available, color: 'text-green-400', bg: 'bg-green-400/8', border: 'border-green-400/15' },
          { label: 'Đã đặt', count: statusCounts.reserved, color: 'text-gold', bg: 'bg-gold/8', border: 'border-gold/15' },
          { label: 'Đang phục vụ', count: statusCounts.occupied, color: 'text-red-400', bg: 'bg-red-400/8', border: 'border-red-400/15' },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border ${s.bg} ${s.border} p-3 text-center`}>
            <div className={`text-xl font-serif tabular-nums ${s.color}`}>{s.count}</div>
            <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Floor Plan */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter tabs */}
          <div className="flex gap-1 border-b border-gold/10 pb-0">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'available', label: 'Trống' },
              { value: 'occupied', label: 'Có khách' },
              { value: 'reserved', label: 'Đã đặt' },
            ].map(f => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                className={`luxury-tab ${statusFilter === f.value ? 'active' : ''}`}>
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {filteredTables.map(t => {
                const cfg = TABLE_STATUS_CONFIG[t.status] || TABLE_STATUS_CONFIG.available;
                const isSelected = selectedTable?._id === t._id;
                return (
                  <button
                    key={t._id}
                    onClick={() => handleTableClick(t)}
                    className={`relative p-4 rounded-xl border-2 bg-bg-2 flex flex-col gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.03] text-left ${cfg.cssClass} ${
                      isSelected ? 'ring-2 ring-gold ring-offset-1 ring-offset-bg scale-[1.02]' : ''
                    }`}
                  >
                    {/* Status light */}
                    <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${cfg.dot} ${
                      t.status === 'occupied' ? 'animate-pulse' : ''
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
            </div>
          )}
        </div>

        {/* Order Panel */}
        <div className="glass-panel-luxury flex flex-col min-h-[500px] max-h-[80vh] overflow-hidden">
          {selectedTable ? (
            <div className="flex flex-col h-full">
              {/* Table Header */}
              <div className="px-4 py-3 border-b border-gold/10 bg-gradient-to-r from-wood/30 to-bg-3/50 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base text-gold">Bàn {selectedTable.tableNumber}</h3>
                    <p className="text-[10px] text-muted uppercase tracking-wider">{selectedTable.area} · {selectedTable.capacity} người</p>
                  </div>
                  {selectedTable.status === 'available' && (
                    <button onClick={handleOpenTable} className="btn-gold text-[10px]">
                      ✓ Mở bàn
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                {/* Active Order Items */}
                {activeOrder && (
                  <div>
                    <div className="section-subtitle mb-2 flex items-center gap-1.5">
                      <ListOrdered size={11} /> Đơn hàng #{activeOrder._id.substring(18)}
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                      {activeOrder.items.length === 0 ? (
                        <p className="text-[11px] text-muted italic text-center py-3">Chưa có món nào</p>
                      ) : activeOrder.items.map((i, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-gold/6 text-xs">
                          <div>
                            <span className="text-cream font-medium">{i.menuItem?.name}</span>
                            <span className="text-muted ml-2">×{i.quantity}</span>
                          </div>
                          <span className={`status-badge ${
                            i.status === 'pending' ? 'status-pending' :
                            i.status === 'cooking' ? 'status-cooking' : 'status-ready'
                          }`}>
                            {i.status === 'pending' ? '⏳' : i.status === 'cooking' ? '🔥' : '✅'}
                            {i.status === 'pending' ? 'Chờ' : i.status === 'cooking' ? 'Đang làm' : 'Xong'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cart */}
                {activeOrder && (
                  <div>
                    <div className="section-subtitle mb-2 flex items-center gap-1.5">
                      <Plus size={11} /> Gọi thêm
                    </div>
                    {cart.length === 0 ? (
                      <p className="text-[11px] text-muted italic">Chọn món từ danh mục bên dưới</p>
                    ) : (
                      <div className="space-y-1.5">
                        {cart.map(ci => (
                          <div key={ci.item._id} className="flex items-center justify-between bg-gold/5 border border-gold/10 rounded-lg px-3 py-2">
                            <span className="text-xs text-cream truncate max-w-[120px]">{ci.item.name}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateCartQty(ci.item._id, ci.quantity - 1)}
                                className="w-5 h-5 rounded border border-gold/20 text-gold hover:bg-gold/10 text-xs flex items-center justify-center">−</button>
                              <span className="text-xs text-cream w-4 text-center">{ci.quantity}</span>
                              <button onClick={() => updateCartQty(ci.item._id, ci.quantity + 1)}
                                className="w-5 h-5 rounded border border-gold/20 text-gold hover:bg-gold/10 text-xs flex items-center justify-center">+</button>
                            </div>
                          </div>
                        ))}
                        <button onClick={handleSubmitOrderItems}
                          className="w-full btn-gold flex items-center justify-center gap-2 mt-2">
                          <Play size={11} /> Gửi xuống bếp
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Checkout panel */}
              {activeOrder && (
                <div className="p-4 border-t border-gold/10 bg-bg-2/60 shrink-0 space-y-3">
                  <div className="section-subtitle flex items-center gap-1.5">
                    <Receipt size={11} /> Thanh toán
                  </div>

                  {/* Discount */}
                  <div className="flex items-center gap-2 text-xs">
                    <Percent size={11} className="text-muted" />
                    <span className="text-muted">Giảm giá:</span>
                    <select value={discountPercent} onChange={e => setDiscountPercent(e.target.value)}
                      className="luxury-input luxury-select flex-1 py-1.5 text-xs h-7">
                      {['0','5','10','15','20'].map(v => <option key={v} value={v}>{v}%</option>)}
                    </select>

                    <span className="text-muted ml-1">Thanh toán:</span>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                      className="luxury-input luxury-select flex-1 py-1.5 text-xs h-7">
                      <option value="cash">Tiền mặt</option>
                      <option value="transfer">Chuyển khoản</option>
                      <option value="card">Thẻ</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-muted">
                      <span>Tạm tính:</span>
                      <span>{bill.sub.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    {bill.disc > 0 && (
                      <div className="flex justify-between text-wine-light">
                        <span>Giảm giá:</span>
                        <span>−{bill.disc.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted">
                      <span>VAT (10%):</span>
                      <span>+{bill.vat.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="flex justify-between text-gold font-serif font-semibold text-sm border-t border-gold/10 pt-1.5 mt-1.5">
                      <span>Tổng:</span>
                      <span>{bill.total.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>

                  <button onClick={handleCheckout} disabled={checkoutLoading || getSubtotal() === 0}
                    className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50">
                    <CreditCard size={13} />
                    {checkoutLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-4xl mb-4">🗺️</div>
              <p className="text-sm text-muted font-serif tracking-wider">Chọn một bàn</p>
              <p className="text-[11px] text-muted/60 mt-1">để bắt đầu phục vụ</p>
            </div>
          )}
        </div>

        {/* Menu Catalog — shows when table occupied */}
        {selectedTable && selectedTable.status === 'occupied' && (
          <div className="lg:col-span-3 glass-panel-luxury p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="section-title flex items-center gap-2">
                <Utensils size={14} /> Thực Đơn Gọi Món
              </h3>
              {/* Category filter */}
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => setCatFilter('all')}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${catFilter === 'all' ? 'border-gold/35 text-gold bg-gold/8' : 'border-gold/10 text-muted'}`}>
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
              {filteredMenu.map(item => (
                <button
                  key={item._id}
                  onClick={() => addToCart(item)}
                  className={`glass-card p-3 text-left transition-all ${
                    !item.isAvailable ? 'opacity-40 cursor-not-allowed' : 'hover:border-gold/30'
                  }`}
                  disabled={!item.isAvailable}
                >
                  <div className="font-serif text-xs text-cream truncate">{item.name}</div>
                  <div className="text-[10px] text-gold mt-1">{item.price.toLocaleString('vi-VN')} ₫</div>
                  {!item.isAvailable && (
                    <span className="text-[9px] text-red-400 uppercase tracking-wider">Hết món</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Checkout success */}
      {checkoutInvoice && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50" onClick={() => setCheckoutInvoice(null)}>
          <div className="glass-panel-luxury p-8 max-w-sm w-full text-center animate-scale-in">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-serif text-xl text-gold tracking-wider mb-2">Thanh Toán Thành Công</h3>
            <p className="text-xs text-muted mb-4">Cảm ơn quý khách đã sử dụng dịch vụ của Sakura!</p>
            <button onClick={() => setCheckoutInvoice(null)} className="btn-ghost text-[11px]">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

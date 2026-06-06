import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Users, Layers, Plus, ShoppingCart, Trash, Play, CheckSquare, 
  Printer, DollarSign, RefreshCw 
} from 'lucide-react';
import { tableAPI, menuAPI, orderAPI, invoiceAPI, categoryAPI } from '../services/api';

export default function WaiterDashboard() {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active workspace states
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [cart, setCart] = useState([]); // Array of { item, quantity }
  const [discountPercent, setDiscountPercent] = useState('0');
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);

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
      toast.error('Loi tai du lieu pos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTableClick = async (table) => {
    setSelectedTable(table);
    setCart([]);
    setActiveOrder(null);
    setCheckoutInvoice(null);

    if (table.status === 'occupied') {
      try {
        // Fetch active order for this table
        const res = await orderAPI.getOrders({ table: table._id, status: 'pending,cooking,ready' });
        if (res.success && res.data.length > 0) {
          setActiveOrder(res.data[0]); // Take the first active order
        } else {
          toast.error('Khong tim thay don hang dang hoat dong cho ban nay.');
        }
      } catch (err) {
        toast.error('Khong the tai don hang: ' + err.message);
      }
    }
  };

  const handleOpenTable = async () => {
    try {
      const res = await tableAPI.updateStatus(selectedTable._id, 'occupied');
      if (res.success) {
        toast.success(`Mo ban ${selectedTable.tableNumber}`);
        // Create initial pending order
        const orderRes = await orderAPI.create({
          tableId: selectedTable._id,
          items: []
        });
        if (orderRes.success) {
          setActiveOrder(orderRes.data);
        }
        loadData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addToCart = (item) => {
    if (!item.isAvailable) {
      toast.error('Mon an nay tam het, khong the goi mon.');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.item._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i.item._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCartQty = (itemId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.item._id !== itemId));
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.item._id === itemId ? { ...i, quantity: qty } : i))
    );
  };

  const handleSubmitOrderItems = async () => {
    if (cart.length === 0) return;
    try {
      const itemsPayload = cart.map((i) => ({
        menuItem: i.item._id,
        quantity: i.quantity,
        notes: ''
      }));

      const res = await orderAPI.addItems(activeOrder._id, itemsPayload);
      if (res.success) {
        toast.success('Gui mon an xuong bep thanh cong');
        setActiveOrder(res.data);
        setCart([]);
        loadData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Calculations for billing
  const getSubtotal = () => {
    if (!activeOrder) return 0;
    return activeOrder.items.reduce((sum, i) => sum + i.priceAtOrder * i.quantity, 0);
  };

  const calculateTotalBill = () => {
    const subtotal = getSubtotal();
    const discount = Math.round(subtotal * (Number(discountPercent) / 100));
    const vat = Math.round((subtotal - discount) * 0.1);
    const total = subtotal - discount + vat;
    return { subtotal, discount, vat, total };
  };

  const handleCheckout = async () => {
    const { subtotal, discount, vat, total } = calculateTotalBill();
    try {
      const res = await invoiceAPI.create({
        orderId: activeOrder._id,
        discount,
        vat,
        paymentMethod: 'cash'
      });

      if (res.success) {
        toast.success('Thanh toan hoa don thanh cong');
        setCheckoutInvoice(res.data);
        setActiveOrder(null);
        setSelectedTable(null);
        loadData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview stats header */}
      <div className="flex justify-between items-center pb-4 border-b border-gold/10">
        <h2 className="font-serif text-lg text-gold uppercase tracking-wider">POS Phuc Vu & Goi Mon</h2>
        <button 
          onClick={loadData}
          className="p-2 border border-gold/20 hover:border-gold hover:text-gold transition-colors text-xs flex items-center gap-1.5"
        >
          <RefreshCw size={12} /> Lam Moi
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-muted uppercase tracking-wider">
          Dang tai danh sach ban an...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Floor Plan Tables */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-sm text-gold uppercase tracking-wider">So do ban an</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {tables.map((t) => (
                <div 
                  key={t._id}
                  onClick={() => handleTableClick(t)}
                  className={`border p-5 bg-bg-2 cursor-pointer flex flex-col justify-between items-start gap-4 transition-all duration-300 ${
                    selectedTable?._id === t._id ? 'ring-1 ring-gold shadow-[0_0_15px_rgba(201,164,71,0.15)]' : ''
                  } ${
                    t.status === 'available' ? 'border-green-500/20 hover:border-green-500/50' :
                    t.status === 'occupied' ? 'border-red-500/20 hover:border-red-500/50' : 'border-gold/20 hover:border-gold/50'
                  }`}
                >
                  <div className="flex justify-between w-full items-baseline">
                    <span className="font-serif text-base text-cream">{t.tableNumber}</span>
                    <span className="text-[10px] text-muted flex items-center gap-0.5">
                      <Users size={9} /> {t.capacity}
                    </span>
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-muted">{t.area}</div>
                  <span className={`px-2 py-0.5 border text-[9px] uppercase tracking-wider font-medium ${
                    t.status === 'available' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    t.status === 'occupied' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-gold/10 text-gold border-gold/20'
                  }`}>
                    {t.status === 'available' ? 'Trong' : t.status === 'occupied' ? 'Khach an' : 'Da dat'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Order Operations Panel */}
          <div className="bg-bg-2 border border-gold/10 p-5 md:p-6 min-h-[500px] flex flex-col justify-between">
            {selectedTable ? (
              <div className="flex flex-col h-full justify-between gap-6">
                <div>
                  {/* Table details header */}
                  <div className="pb-4 border-b border-gold/10 flex justify-between items-center">
                    <div>
                      <h4 className="font-serif text-base text-gold uppercase tracking-wider">
                        Ban {selectedTable.tableNumber}
                      </h4>
                      <p className="text-[10px] text-muted uppercase mt-0.5">Khu: {selectedTable.area}</p>
                    </div>
                    {selectedTable.status === 'available' && (
                      <button 
                        onClick={handleOpenTable}
                        className="bg-green-500 text-bg text-[10px] tracking-wider uppercase px-4 py-2 font-semibold hover:bg-green-400 transition-all"
                      >
                        Mo Ban
                      </button>
                    )}
                  </div>

                  {/* Active Order Details */}
                  {selectedTable.status === 'occupied' && activeOrder && (
                    <div className="py-4 space-y-4">
                      {/* Active check info */}
                      <div className="flex justify-between items-center text-xs border-b border-gold/5 pb-2">
                        <span className="text-muted">Don hang: #{activeOrder._id.substring(18)}</span>
                        <span className="text-gold font-serif">Tong: {getSubtotal().toLocaleString('vi-VN')} VND</span>
                      </div>

                      {/* Items list currently served */}
                      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                        {activeOrder.items.length > 0 ? (
                          activeOrder.items.map((i, idx) => (
                            <div key={idx} className="flex justify-between text-xs py-1 border-b border-gold/5">
                              <div className="flex flex-col">
                                <span className="text-cream">{i.menuItem?.name}</span>
                                <span className="text-[10px] text-muted font-light">Gia: {i.priceAtOrder.toLocaleString('vi-VN')}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-cream-dim font-light">x{i.quantity}</span>
                                <span className={`px-2 py-0.5 border text-[9px] uppercase tracking-wider font-semibold ${
                                  i.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                  i.status === 'cooking' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                  'bg-green-500/10 text-green-500 border-green-500/20'
                                }`}>
                                  {i.status === 'pending' ? 'Cho' : i.status === 'cooking' ? 'Dang lam' : 'Xong'}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-xs text-muted">Moi ban, chua co mon an nao duoc goi</div>
                        )}
                      </div>

                      {/* Cart (New items to add) */}
                      <div className="border-t border-gold/10 pt-4 space-y-3">
                        <h5 className="text-[10px] uppercase text-gold tracking-wider font-medium">Goi mon moi</h5>
                        {cart.length > 0 ? (
                          <div className="space-y-2">
                            {cart.map((cartItem) => (
                              <div key={cartItem.item._id} className="flex justify-between items-center text-xs py-1.5">
                                <span className="text-cream truncate max-w-[120px]">{cartItem.item.name}</span>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => updateCartQty(cartItem.item._id, cartItem.quantity - 1)}
                                    className="w-5 h-5 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold/5"
                                  >
                                    -
                                  </button>
                                  <span className="w-6 text-center font-light">{cartItem.quantity}</span>
                                  <button 
                                    onClick={() => updateCartQty(cartItem.item._id, cartItem.quantity + 1)}
                                    className="w-5 h-5 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold/5"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button 
                              onClick={handleSubmitOrderItems}
                              className="w-full bg-gold text-bg py-2 text-[10px] uppercase tracking-wider font-semibold hover:bg-gold-light transition-all flex justify-center items-center gap-1.5"
                            >
                              <Play size={10} /> Gui Mon Xuong Bep
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-muted italic">
                            Chon cac mon an tu danh muc thuc don ben duoi de them vao don hang
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Checkout & Bill Area */}
                {selectedTable.status === 'occupied' && activeOrder && (
                  <div className="border-t border-gold/10 pt-4 space-y-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted">Giam gia (%):</span>
                      <select 
                        className="bg-bg border border-gold/10 text-cream px-2 py-1 text-xs outline-none"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="10">10%</option>
                        <option value="15">15%</option>
                        <option value="20">20%</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-cream-dim">
                        <span>Tam tinh:</span>
                        <span>{getSubtotal().toLocaleString('vi-VN')} VND</span>
                      </div>
                      <div className="flex justify-between text-xs text-wine-light">
                        <span>Giam gia:</span>
                        <span>-{calculateTotalBill().discount.toLocaleString('vi-VN')} VND</span>
                      </div>
                      <div className="flex justify-between text-xs text-cream-dim">
                        <span>Thue VAT (10%):</span>
                        <span>+{calculateTotalBill().vat.toLocaleString('vi-VN')} VND</span>
                      </div>
                      <div className="flex justify-between text-xs text-gold border-t border-gold/5 pt-1.5 font-serif font-semibold">
                        <span>Tong thanh toan:</span>
                        <span>{calculateTotalBill().total.toLocaleString('vi-VN')} VND</span>
                      </div>
                    </div>

                    <button 
                      onClick={handleCheckout}
                      className="w-full border border-gold text-gold py-3 text-[10px] uppercase tracking-wider font-semibold hover:bg-gold hover:text-bg transition-all"
                    >
                      Xac nhan & Thanh toan
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-muted uppercase tracking-wider my-auto">
                Chon mot ban an de thuc hien giao dich
              </div>
            )}
          </div>

          {/* Menu Catalog at bottom if table occupied */}
          {selectedTable && selectedTable.status === 'occupied' && (
            <div className="lg:col-span-3 border-t border-gold/10 pt-6 space-y-4">
              <h3 className="font-serif text-sm text-gold uppercase tracking-wider">Danh muc thuc don goi mon</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {menuItems.map((item) => (
                  <div 
                    key={item._id}
                    onClick={() => addToCart(item)}
                    className={`border border-gold/5 p-4 bg-bg-2 cursor-pointer flex justify-between items-center transition-all ${
                      item.isAvailable ? 'hover:bg-glass/20 hover:border-gold/20' : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="min-w-0 pr-4">
                      <div className="font-serif text-xs text-cream truncate">{item.name}</div>
                      <div className="text-[10px] text-gold font-serif mt-1">
                        {item.price.toLocaleString('vi-VN')} VND
                      </div>
                    </div>
                    {!item.isAvailable ? (
                      <span className="text-[8px] bg-wine text-cream px-1.5 py-0.5 uppercase tracking-wider flex-shrink-0">
                        Het mon
                      </span>
                    ) : (
                      <button className="w-6 h-6 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-bg text-xs">
                        +
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

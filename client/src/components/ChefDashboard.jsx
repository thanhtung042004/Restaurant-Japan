import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Clock, Play, CheckCircle2, RotateCcw, Flame, Check } from 'lucide-react';
import { orderAPI, menuAPI } from '../services/api';

export default function ChefDashboard({ socket }) {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState('orders'); // 'orders' | 'menu-toggle'

  const loadKitchenData = async () => {
    try {
      setLoading(true);
      const [orderRes, menuRes] = await Promise.all([
        orderAPI.getKitchenOrders(),
        menuAPI.getItems({ limit: 100 })
      ]);
      if (orderRes.success) setOrders(orderRes.data);
      if (menuRes.success) setMenuItems(menuRes.data);
    } catch (err) {
      toast.error('Loi tai du lieu nha bep: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKitchenData();
  }, []);

  // Socket.IO listener for real-time kitchen orders
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = () => {
      // Play a quick alert beep
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime); // 600Hz tone
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2); // 0.2s duration
      } catch (err) {
        console.error('Audio beep failed:', err);
      }

      toast('Don goi mon moi tu phuc vu', {
        icon: '🍳',
        style: {
          background: '#0e0a06',
          color: '#e8c87a',
          border: '1px solid #c9a447',
        }
      });
      loadKitchenData();
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:updated', handleNewOrder); // Reload on any changes

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:updated', handleNewOrder);
    };
  }, [socket]);

  const handleUpdateItemStatus = async (orderId, itemId, nextStatus) => {
    try {
      const res = await orderAPI.updateItemStatus(orderId, itemId, nextStatus);
      if (res.success) {
        toast.success(`Mon an da chuyen sang trang thai: ${nextStatus === 'cooking' ? 'Dang lam' : 'Xong'}`);
        loadKitchenData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleMenu = async (id) => {
    try {
      const res = await menuAPI.toggleAvailability(id);
      if (res.success) {
        toast.success(res.message);
        // Reload menu list locally
        const menuRes = await menuAPI.getItems({ limit: 100 });
        if (menuRes.success) setMenuItems(menuRes.data);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Head */}
      <div className="flex justify-between items-center pb-4 border-b border-gold/10">
        <div className="flex gap-4">
          <button 
            onClick={() => setSubTab('orders')}
            className={`font-serif text-sm uppercase tracking-wider pb-1.5 border-b-2 font-medium ${subTab === 'orders' ? 'text-gold border-gold' : 'text-muted border-transparent hover:text-cream'}`}
          >
            Man Hinh Che Bien ({orders.length} Don)
          </button>
          <button 
            onClick={() => setSubTab('menu-toggle')}
            className={`font-serif text-sm uppercase tracking-wider pb-1.5 border-b-2 font-medium ${subTab === 'menu-toggle' ? 'text-gold border-gold' : 'text-muted border-transparent hover:text-cream'}`}
          >
            Quan Ly Het Mon
          </button>
        </div>
        <button 
          onClick={loadKitchenData}
          className="text-xs border border-gold/20 hover:border-gold hover:text-gold px-4 py-2 uppercase tracking-wider transition-colors"
        >
          Lam Moi
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-muted uppercase tracking-wider">
          Dang tai du lieu bep...
        </div>
      ) : (
        <>
          {/* ORDERS PANEL */}
          {subTab === 'orders' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.length > 0 ? (
                orders.map((ord) => (
                  <div key={ord._id} className="border border-gold/10 bg-bg-2 p-5 flex flex-col justify-between gap-4">
                    {/* Header check */}
                    <div className="pb-3 border-b border-gold/10 flex justify-between items-baseline">
                      <span className="font-serif text-base text-gold">Ban {ord.table?.tableNumber || '-'}</span>
                      <span className="text-[9px] text-muted tracking-wider uppercase">{ord.table?.area}</span>
                    </div>

                    {/* Ordered items stack */}
                    <div className="space-y-3 flex-1">
                      {ord.items
                        .filter(i => ['pending', 'cooking'].includes(i.status))
                        .map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs border-b border-gold/5 pb-2">
                            <div className="flex flex-col max-w-[160px]">
                              <span className="text-cream font-medium">{item.menuItem?.name}</span>
                              <span className="text-[10px] text-muted mt-0.5">So luong: x{item.quantity}</span>
                              {item.notes && <p className="text-[10px] text-wine-light leading-relaxed font-light">Ghi chu: {item.notes}</p>}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-1">
                              {item.status === 'pending' && (
                                <button 
                                  onClick={() => handleUpdateItemStatus(ord._id, item._id, 'cooking')}
                                  className="w-7 h-7 border border-blue-500/20 hover:border-blue-500 text-blue-500 flex items-center justify-center bg-blue-500/[0.02]"
                                  title="Bat dau lam"
                                >
                                  <Flame size={12} />
                                </button>
                              )}
                              {item.status === 'cooking' && (
                                <button 
                                  onClick={() => handleUpdateItemStatus(ord._id, item._id, 'ready')}
                                  className="w-7 h-7 border border-green-500/20 hover:border-green-500 text-green-500 flex items-center justify-center bg-green-500/[0.02]"
                                  title="Hoan thanh mon"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      }
                    </div>

                    {/* Time elapsed footer */}
                    <div className="text-[10px] text-muted tracking-wider flex items-center gap-1.5 pt-2 border-t border-gold/5">
                      <Clock size={11} /> {new Date(ord.createdAt).toLocaleTimeString('vi-VN')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-xs text-muted uppercase tracking-wider">
                  Chua co mon an nao can che bien
                </div>
              )}
            </div>
          )}

          {/* MENU OUT-OF-STOCK PANEL */}
          {subTab === 'menu-toggle' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {menuItems.map((item) => (
                <div 
                  key={item._id}
                  onClick={() => handleToggleMenu(item._id)}
                  className={`border p-4 bg-bg-2 cursor-pointer flex justify-between items-center transition-all ${
                    item.isAvailable 
                      ? 'border-gold/10 hover:border-gold/30' 
                      : 'border-wine/20 bg-wine/[0.02] text-wine-light'
                  }`}
                >
                  <div className="min-w-0 pr-4">
                    <div className={`font-serif text-xs truncate ${item.isAvailable ? 'text-cream' : 'text-cream-dim line-through'}`}>
                      {item.name}
                    </div>
                    <span className="text-[10px] text-muted block mt-0.5">{item.category?.name || 'Khac'}</span>
                  </div>
                  <div className={`w-8 h-8 flex items-center justify-center border transition-colors ${
                    item.isAvailable ? 'border-gold/20 text-gold hover:bg-gold/5' : 'border-wine/40 text-wine-light'
                  }`}>
                    {item.isAvailable ? <Check size={14} /> : <span className="text-[9px]">Het</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

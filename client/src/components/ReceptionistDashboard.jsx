import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Clock, Users, FileText, CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import { reservationAPI, tableAPI } from '../services/api';

export default function ReceptionistDashboard({ socket }) {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRes, setSelectedRes] = useState(null); // For assigning table modal
  const [selectedTable, setSelectedTable] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [resData, tableData] = await Promise.all([
        reservationAPI.getReservations(),
        tableAPI.getTables()
      ]);
      if (resData.success) setReservations(resData.data);
      if (tableData.success) setTables(tableData.data);
    } catch (err) {
      toast.error('Loi tai du lieu le tan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen to Socket.IO events for live updates
  useEffect(() => {
    if (!socket) return;

    const handleNewReservation = (newRes) => {
      // Play a simple soft alert beep using browser AudioContext (no emojis, very premium)
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz beep
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15); // beep duration 0.15s
      } catch (err) {
        console.error('Audio beep failed:', err);
      }

      toast('Co mot dat ban moi vua duoc gui', {
        icon: '🔔',
        style: {
          background: '#0e0a06',
          color: '#c9a447',
          border: '1px solid #c9a447',
        }
      });
      setReservations(prev => [newRes, ...prev]);
    };

    const handleStatusUpdated = (updatedRes) => {
      setReservations(prev => prev.map(r => r._id === updatedRes._id ? updatedRes : r));
    };

    socket.on('reservation:new', handleNewReservation);
    socket.on('reservation:statusUpdated', handleStatusUpdated);
    socket.on('reservation:confirmed', handleStatusUpdated);

    return () => {
      socket.off('reservation:new', handleNewReservation);
      socket.off('reservation:statusUpdated', handleStatusUpdated);
      socket.off('reservation:confirmed', handleStatusUpdated);
    };
  }, [socket]);

  const handleConfirmClick = (res) => {
    setSelectedRes(res);
    // Find available tables that have capacity >= number of guests
    const matching = tables.filter(t => t.status === 'available' && t.capacity >= res.numberOfGuests);
    setSelectedTable(matching[0]?._id || '');
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      toast.error('Vui long chon ban an hop le');
      return;
    }

    try {
      const res = await reservationAPI.confirm(selectedRes._id, selectedTable);
      if (res.success) {
        toast.success('Xac nhan dat ban va gan ban thanh cong');
        setSelectedRes(null);
        loadData(); // Reload table statuses and reservation statuses
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Ban co chac chan muon huy dat ban nay?')) return;
    try {
      const res = await reservationAPI.cancel(id);
      if (res.success) {
        toast.success('Huy dat ban thanh cong');
        loadData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'confirmed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted/10 text-muted border-muted/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Cho xac nhan';
      case 'confirmed': return 'Da xac nhan';
      case 'completed': return 'Da thanh toan';
      case 'cancelled': return 'Da huy';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gold/10">
        <h2 className="font-serif text-lg text-gold uppercase tracking-wider">Danh sach dat ban gan day</h2>
        <span className="text-[10px] text-muted uppercase tracking-widest">
          Che do giam sat thoi gian thuc hoat dong
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-muted uppercase tracking-wider">
          Dang tai danh sach dat ban...
        </div>
      ) : reservations.length > 0 ? (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div 
              key={res._id}
              className="border border-gold/10 p-5 bg-bg-2 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-0.5 border text-[9px] uppercase tracking-wider font-semibold ${getStatusStyle(res.status)}`}>
                    {getStatusLabel(res.status)}
                  </span>
                  <span className="text-[11px] font-medium text-cream">{res.customerName}</span>
                  <span className="text-[10px] text-muted">SĐT: {res.phone}</span>
                  <span className="text-[10px] text-muted">Email: {res.email || '-'}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-light text-cream-dim">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-gold" />
                    {new Date(res.reservationDate).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-gold" />
                    {res.reservationTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} className="text-gold" />
                    {res.numberOfGuests} nguoi
                  </span>
                </div>

                {res.table ? (
                  <div className="text-[10px] text-gold/80 tracking-wide uppercase font-semibold">
                    Ban duoc gan: {res.table.tableNumber} (Suc chua: {res.table.capacity} cho, Khu: {res.table.area})
                  </div>
                ) : (
                  <div className="text-[10px] text-muted italic">
                    Chua duoc xac dinh ban an cu the
                  </div>
                )}

                {res.note && (
                  <p className="text-xs text-muted border-l border-gold/20 pl-3 leading-relaxed font-light">
                    Ghi chu: {res.note}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 self-end lg:self-center">
                {res.status === 'pending' && (
                  <button 
                    onClick={() => handleConfirmClick(res)}
                    className="bg-gold text-bg text-[10px] tracking-wider uppercase px-4 py-2 font-semibold hover:bg-gold-light transition-all"
                  >
                    Confirm & Gan Ban
                  </button>
                )}
                {['pending', 'confirmed'].includes(res.status) && (
                  <button 
                    onClick={() => handleCancelBooking(res._id)}
                    className="border border-wine/40 text-wine-light hover:bg-wine/5 hover:border-wine/80 px-4 py-2 text-[10px] uppercase tracking-wider transition-all"
                  >
                    Huy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-xs text-muted uppercase tracking-wider">
          Chua co lich dat ban nao
        </div>
      )}

      {/* Assign Table Modal */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-sm">
          <form 
            onSubmit={handleConfirmSubmit} 
            className="w-full max-w-md p-8 border border-gold/20 bg-bg-2 glass-panel space-y-5"
          >
            <div className="text-center mb-6">
              <h3 className="font-serif text-lg text-gold uppercase tracking-wider">Xac Nhan Dat Ban</h3>
              <p className="text-[10px] text-muted tracking-wider uppercase mt-1">
                Yeu cau: {selectedRes.customerName} ({selectedRes.numberOfGuests} nguoi)
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Chon Ban An Phu Hop</label>
              <select 
                className="bg-bg border border-gold/10 text-cream px-3 py-2.5 text-xs outline-none focus:border-gold/50"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                required
              >
                <option value="">Chon ban</option>
                {tables
                  .filter(t => t.status === 'available' && t.capacity >= selectedRes.numberOfGuests)
                  .map(t => (
                    <option key={t._id} value={t._id}>
                      Ban {t.tableNumber} (Khu: {t.area}, Ghe: {t.capacity})
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button 
                type="button" 
                onClick={() => setSelectedRes(null)}
                className="px-4 py-2 border border-gold/20 text-cream-dim text-[10px] uppercase tracking-wider"
              >
                Huy
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-gold text-bg text-[10px] uppercase tracking-wider font-semibold"
              >
                Confirm Dat Ban
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

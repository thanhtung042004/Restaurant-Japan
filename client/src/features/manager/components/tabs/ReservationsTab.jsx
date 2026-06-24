import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { reservationAPI } from '../../../../api';

export default function ReservationsTab({ socket }) {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => loadReservations();
      socket.on('reservation:new', handleUpdate);
      socket.on('reservation:confirmed', handleUpdate);
      socket.on('reservation:statusUpdated', handleUpdate);
      
      return () => {
        socket.off('reservation:new', handleUpdate);
        socket.off('reservation:confirmed', handleUpdate);
        socket.off('reservation:statusUpdated', handleUpdate);
      };
    }
  }, [socket]);

  const loadReservations = async () => {
    try {
      const res = await reservationAPI.getReservations();
      if (res.success) setReservations(res.data);
    } catch (err) { toast.error('Lỗi tải đặt bàn: ' + err.message); }
  };

  return (
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
                            if (res.success) { toast.success('Đã xác nhận đặt bàn'); loadReservations(); }
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
                            if (res.success) { toast.success('Đã hủy đặt bàn'); loadReservations(); }
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
  );
}

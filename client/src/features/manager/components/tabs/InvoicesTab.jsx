import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { invoiceAPI } from '../../../../api';

export default function InvoicesTab({ socket }) {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleOrderUpdate = () => loadInvoices();
      socket.on('order:new', handleOrderUpdate);
      socket.on('order:itemsAdded', handleOrderUpdate);
      socket.on('order:cancelled', handleOrderUpdate);
      
      return () => {
        socket.off('order:new', handleOrderUpdate);
        socket.off('order:itemsAdded', handleOrderUpdate);
        socket.off('order:cancelled', handleOrderUpdate);
      };
    }
  }, [socket]);

  const loadInvoices = async () => {
    try {
      const res = await invoiceAPI.getInvoices({ limit: 100 });
      if (res.success) setInvoices(res.data);
    } catch (err) { toast.error('Lỗi tải hóa đơn: ' + err.message); }
  };

  return (
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
        {invoices.length === 0 && (
          <div className="py-12 text-center text-muted text-xs">Chưa có hóa đơn nào</div>
        )}
      </div>
    </div>
  );
}

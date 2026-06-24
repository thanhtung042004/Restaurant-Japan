import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { tableAPI } from '../../../../api';

export default function TablesTab({ socket }) {
  const [tables, setTables] = useState([]);
  const [showTableForm, setShowTableForm] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [tableCapacity, setTableCapacity] = useState('4');
  const [tableArea, setTableArea] = useState('Tầng 1');
  const [tableDesc, setTableDesc] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleStatusUpdate = ({ tableId, status }) => {
        setTables(prev => prev.map(t => t._id === tableId ? { ...t, status } : t));
      };
      socket.on('table:statusUpdated', handleStatusUpdate);
      return () => {
        socket.off('table:statusUpdated', handleStatusUpdate);
      };
    }
  }, [socket]);

  const loadTables = async () => {
    try {
      const res = await tableAPI.getTables();
      if (res.success) setTables(res.data);
    } catch (err) { toast.error('Lỗi tải danh sách bàn: ' + err.message); }
  };

  const handleTableSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await tableAPI.createTable({ tableNumber, capacity: Number(tableCapacity), area: tableArea, description: tableDesc });
      if (res.success) { 
        toast.success('Tạo bàn thành công'); 
        setShowTableForm(false); setTableNumber(''); setTableDesc(''); 
        loadTables(); 
      }
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteTable = async (id) => {
    if (!confirm('Xóa bàn này?')) return;
    try { 
      const res = await tableAPI.deleteTable(id); 
      if (res.success) { toast.success('Đã xóa bàn'); loadTables(); } 
    } catch (err) { toast.error(err.message); }
  };

  return (
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
  );
}

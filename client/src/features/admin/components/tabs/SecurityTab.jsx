import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Lock, AlertTriangle, CheckCircle2, AlertCircle,
  RefreshCw, Globe, Trash2, Plus, X, Monitor, Clock
} from 'lucide-react';
import { securityAPI } from '../../../../api';
import toast from 'react-hot-toast';

const RBAC_MATRIX = [
  { feature: 'Quản lý User (CRUD)',      admin: 'full',   manager: 'limited', waiter: false,  customer: false },
  { feature: 'Phân quyền Role',          admin: 'full',   manager: false,     waiter: false,  customer: false },
  { feature: 'Cấu hình hệ thống',        admin: 'full',   manager: false,     waiter: false,  customer: false },
  { feature: 'Audit Logs',               admin: 'full',   manager: false,     waiter: false,  customer: false },
  { feature: 'Thống kê nền tảng',        admin: 'full',   manager: false,     waiter: false,  customer: false },
  { feature: 'Quản lý Menu',             admin: 'full',   manager: 'full',    waiter: false,  customer: false },
  { feature: 'Quản lý Bàn ăn',          admin: 'full',   manager: 'full',    waiter: false,  customer: false },
  { feature: 'Xử lý Đơn hàng',          admin: 'full',   manager: 'full',    waiter: 'full', customer: false },
  { feature: 'Đặt bàn',                 admin: 'full',   manager: 'full',    waiter: 'full', customer: 'full' },
  { feature: 'Hóa đơn',                 admin: 'full',   manager: 'full',    waiter: false,  customer: false },
  { feature: 'Thống kê kinh doanh',     admin: 'full',   manager: 'full',    waiter: false,  customer: false },
  { feature: 'AI Chat',                  admin: 'full',   manager: 'full',    waiter: 'full', customer: 'full' },
];

function PermCell({ value }) {
  if (value === 'full') return <span className="text-green-400" title="Toàn quyền">✅</span>;
  if (value === 'limited') return <span className="text-amber-400" title="Giới hạn">⚠️</span>;
  return <span className="text-muted/30">—</span>;
}

function SectionCard({ title, icon: Icon, children, color = 'text-gold', action }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gold/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold/8 border border-gold/15 flex items-center justify-center">
            <Icon size={15} className={color} />
          </div>
          <h3 className="text-xs font-semibold text-cream">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function SecurityTab() {
  const [sessions, setSessions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [loading, setLoading] = useState({ sessions: false, alerts: false, ips: false });
  const [newIP, setNewIP] = useState('');
  const [newIPReason, setNewIPReason] = useState('');
  const [showBlockForm, setShowBlockForm] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading({ sessions: true, alerts: true, ips: true });
    try {
      const [sessRes, alertRes, ipRes] = await Promise.all([
        securityAPI.getSessions().catch(() => ({ success: false, data: [] })),
        securityAPI.getAlerts().catch(() => ({ success: false, data: [] })),
        securityAPI.getBlockedIPs().catch(() => ({ success: false, data: [] })),
      ]);
      if (sessRes.success) setSessions(sessRes.data);
      if (alertRes.success) setAlerts(alertRes.data);
      if (ipRes.success) setBlockedIPs(ipRes.data);
    } catch (_) {}
    setLoading({ sessions: false, alerts: false, ips: false });
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleBlockIP = async (e) => {
    e.preventDefault();
    if (!newIP) { toast.error('Nhập địa chỉ IP'); return; }
    try {
      const res = await securityAPI.blockIP(newIP, newIPReason || 'Chặn thủ công');
      if (res.success) {
        toast.success(`Đã chặn IP ${newIP}`);
        setNewIP(''); setNewIPReason(''); setShowBlockForm(false);
        loadAll();
      }
    } catch (err) { toast.error(err.message); }
  };

  const handleUnblockIP = async (ip) => {
    if (!confirm(`Gỡ chặn IP ${ip}?`)) return;
    try {
      const res = await securityAPI.unblockIP(ip);
      if (res.success) { toast.success(`Đã gỡ chặn IP ${ip}`); loadAll(); }
    } catch (err) { toast.error(err.message); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '—';

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2"><Shield size={16} /> Bảo Mật Hệ Thống</h1>
          <p className="section-subtitle mt-1">Kiểm soát truy cập · Phân quyền · Phiên đăng nhập</p>
        </div>
        <button onClick={loadAll} className="btn-ghost flex items-center gap-1.5 text-[11px]">
          <RefreshCw size={11} /> Làm mới
        </button>
      </div>

      {/* Security Alerts */}
      <SectionCard title="Cảnh Báo Bảo Mật" icon={AlertTriangle} color="text-amber-400">
        {loading.alerts ? (
          <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-10 bg-bg-3/40 rounded animate-pulse" />)}</div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-400/5 border border-green-400/15">
            <CheckCircle2 size={16} className="text-green-400 shrink-0" />
            <p className="text-[11px] text-green-400">Hệ thống đang hoạt động bình thường. Không có cảnh báo nào.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                alert.severity === 'error' ? 'bg-red-400/5 border-red-400/20' : 'bg-amber-400/5 border-amber-400/20'
              }`}>
                <AlertTriangle size={14} className={alert.severity === 'error' ? 'text-red-400 shrink-0 mt-0.5' : 'text-amber-400 shrink-0 mt-0.5'} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-cream">{alert.message}</p>
                  {alert.lastAttempt && <p className="text-[10px] text-muted mt-0.5">Lần cuối: {formatDate(alert.lastAttempt)}</p>}
                </div>
                <span className={`status-badge text-[9px] shrink-0 ${alert.severity === 'error' ? 'bg-red-400/10 text-red-400' : 'bg-amber-400/10 text-amber-400'}`}>
                  {alert.severity === 'error' ? 'HIGH' : 'MED'}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* JWT & Auth */}
      <SectionCard title="Xác Thực JWT" icon={Lock} color="text-gold">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Token hết hạn', value: '7 ngày' },
            { label: 'Refresh token', value: '30 ngày' },
            { label: 'Bcrypt rounds', value: '12' },
            { label: 'Thuật toán', value: 'HS256' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3 py-2 border-b border-gold/6">
              <CheckCircle2 size={11} className="text-green-400 shrink-0" />
              <span className="text-[11px] text-muted">{label}:</span>
              <span className="text-[11px] text-cream font-medium">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="status-badge status-available text-[9px]">JWT Enabled</span>
          <span className="status-badge status-available text-[9px]">RBAC Active</span>
        </div>
      </SectionCard>

      {/* RBAC Matrix */}
      <SectionCard title="Ma Trận Phân Quyền RBAC" icon={Shield} color="text-purple-400">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left py-2 pr-4 text-muted font-medium text-[10px] uppercase tracking-wider">Tính năng</th>
                <th className="text-center px-3 py-2"><span className="badge-role-admin px-2 py-1 rounded text-[9px]">Admin</span></th>
                <th className="text-center px-3 py-2"><span className="badge-role-manager px-2 py-1 rounded text-[9px]">Manager</span></th>
                <th className="text-center px-3 py-2"><span className="badge-role-waiter px-2 py-1 rounded text-[9px]">Waiter</span></th>
                <th className="text-center px-3 py-2"><span className="badge-role-customer px-2 py-1 rounded text-[9px]">Customer</span></th>
              </tr>
            </thead>
            <tbody>
              {RBAC_MATRIX.map((row, i) => (
                <tr key={i} className="border-b border-gold/5 hover:bg-gold/2 transition-colors">
                  <td className="py-2 pr-4 text-muted">{row.feature}</td>
                  <td className="text-center px-3 py-2"><PermCell value={row.admin} /></td>
                  <td className="text-center px-3 py-2"><PermCell value={row.manager} /></td>
                  <td className="text-center px-3 py-2"><PermCell value={row.waiter} /></td>
                  <td className="text-center px-3 py-2"><PermCell value={row.customer} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-muted">
          <span>✅ Toàn quyền</span>
          <span>⚠️ Giới hạn</span>
          <span className="text-muted/40">— Không có quyền</span>
        </div>
      </SectionCard>

      {/* Recent Login Sessions */}
      <SectionCard title="Phiên Đăng Nhập Gần Đây" icon={Monitor} color="text-blue-400">
        {loading.sessions ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-bg-3/40 rounded animate-pulse" />)}</div>
        ) : sessions.length === 0 ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-3/30">
            <Clock size={14} className="text-muted" />
            <p className="text-[11px] text-muted">Không có phiên đăng nhập nào được ghi nhận</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 10).map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gold/6 gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                  <div>
                    <span className="text-[11px] text-cream">{s.user?.name || 'Unknown'}</span>
                    <span className="text-[10px] text-muted ml-2">({s.user?.role || '—'})</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted">
                  {s.ip && <span className="font-mono">{s.ip}</span>}
                  {s.device && <span>{s.device}</span>}
                  <span>{s.createdAt ? new Date(s.createdAt).toLocaleString('vi-VN') : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Blocked IPs */}
      <SectionCard
        title="Danh Sách IP Bị Chặn"
        icon={Globe}
        color="text-red-400"
        action={
          <button onClick={() => setShowBlockForm(s => !s)} className="btn-ghost text-[11px] flex items-center gap-1">
            <Plus size={11} /> Chặn IP
          </button>
        }
      >
        {showBlockForm && (
          <form onSubmit={handleBlockIP} className="flex flex-wrap gap-2 p-3 rounded-lg bg-bg-3/30 border border-gold/10">
            <input className="luxury-input flex-1 min-w-32 text-[11px]" placeholder="Địa chỉ IP (VD: 192.168.1.x)" value={newIP} onChange={e => setNewIP(e.target.value)} required />
            <input className="luxury-input flex-1 min-w-32 text-[11px]" placeholder="Lý do (tuỳ chọn)" value={newIPReason} onChange={e => setNewIPReason(e.target.value)} />
            <button type="submit" className="btn-gold text-[11px]">Chặn</button>
            <button type="button" onClick={() => setShowBlockForm(false)} className="btn-ghost text-[11px]"><X size={12} /></button>
          </form>
        )}
        {loading.ips ? (
          <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-10 bg-bg-3/40 rounded animate-pulse" />)}</div>
        ) : blockedIPs.length === 0 ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-3/30">
            <CheckCircle2 size={14} className="text-green-400" />
            <p className="text-[11px] text-muted">Không có IP nào bị chặn</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedIPs.map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gold/6 gap-3">
                <div>
                  <span className="text-[11px] font-mono text-cream">{entry.ip}</span>
                  {entry.reason && <span className="text-[10px] text-muted ml-2">— {entry.reason}</span>}
                  {entry.blockedAt && <div className="text-[10px] text-muted mt-0.5">{formatDate(entry.blockedAt)}</div>}
                </div>
                <button onClick={() => handleUnblockIP(entry.ip)}
                  className="w-7 h-7 rounded border border-wine/20 text-muted hover:text-red-400 hover:border-wine/40 flex items-center justify-center transition-all" title="Gỡ chặn">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

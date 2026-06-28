import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, Database, Server, Bot, Shield,
  Mail, RefreshCw, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, UserPlus, Activity, Zap, HardDrive,
  AlertCircle, XCircle, ChevronRight, Plus
} from 'lucide-react';
import { adminAPI } from '../../../../api';
import toast from 'react-hot-toast';

/* ── Helpers ─────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

const SEVERITY_COLOR = {
  success: 'text-green-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

const SEVERITY_DOT = {
  success: 'bg-green-400',
  info: 'bg-blue-400',
  warning: 'bg-amber-400',
  error: 'bg-red-400',
};

const ACTION_ICON = {
  LOGIN_SUCCESS: '🔐',
  LOGIN_FAILED: '⚠️',
  USER_REGISTERED: '👤',
  USER_CREATED: '➕',
  USER_DELETED: '🗑️',
  ROLE_CHANGED: '🛡️',
  PASSWORD_RESET: '🔑',
  SETTING_UPDATED: '⚙️',
  BACKUP_CREATED: '💾',
  AI_REQUEST: '🤖',
};

/* ── Service Health Card ──────────────────────────────── */
function HealthCard({ name, icon: Icon, status, responseTime, color }) {
  const isOnline = status === 'online';
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl ${isOnline ? 'bg-green-400/10' : 'bg-red-400/10'} border ${isOnline ? 'border-green-400/20' : 'border-red-400/20'} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={isOnline ? 'text-green-400' : 'text-red-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-cream truncate">{name}</div>
        <div className={`text-[10px] mt-0.5 ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
          {isOnline ? `Online${responseTime ? ` · ${responseTime}ms` : ''}` : 'Offline'}
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────── */
function KPICard({ label, value, icon: Icon, color, bg, delta }) {
  return (
    <div className="kpi-card p-4">
      <div className={`w-8 h-8 rounded-lg ${bg} border border-current/20 flex items-center justify-center mb-3`}>
        <Icon size={15} className={color} />
      </div>
      <div className={`font-serif text-2xl tabular-nums ${color}`}>{value ?? '—'}</div>
      <div className="text-[10px] text-muted uppercase tracking-wider mt-1">{label}</div>
      {delta !== undefined && (
        <div className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
          <TrendingUp size={9} /> {delta} hôm nay
        </div>
      )}
    </div>
  );
}

/* ── Quick Action Button ──────────────────────────────── */
function QuickAction({ icon: Icon, label, onClick, variant = 'default' }) {
  const base = 'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer group';
  const styles = {
    default: 'border-gold/15 bg-gold/5 hover:bg-gold/10 hover:border-gold/30',
    danger: 'border-wine/20 bg-wine/5 hover:bg-wine/10 hover:border-wine/30',
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${variant === 'danger' ? 'bg-wine/10' : 'bg-gold/10'}`}>
        <Icon size={16} className={variant === 'danger' ? 'text-wine-light group-hover:text-wine-bright' : 'text-gold group-hover:text-gold-light'} />
      </div>
      <span className="text-[10px] text-muted group-hover:text-cream transition-colors text-center">{label}</span>
    </button>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function OverviewTab({ onTabChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getOverview();
      if (res.success) setData(res.data);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derived health statuses (simulated from known services)
  const services = [
    { name: 'Database (MongoDB)', icon: Database, status: 'online', responseTime: 12 },
    { name: 'API Server', icon: Server, status: 'online', responseTime: 45 },
    { name: 'Sakura AI (Gemini)', icon: Bot, status: 'online', responseTime: 230 },
    { name: 'Auth (JWT)', icon: Shield, status: 'online', responseTime: null },
    { name: 'Storage', icon: HardDrive, status: 'online', responseTime: null },
    { name: 'Email (SMTP)', icon: Mail, status: 'offline', responseTime: null },
  ];

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-5 animate-fade-up">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="kpi-card p-4 h-28 animate-pulse bg-bg-3/40 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass-card p-5 h-56 animate-pulse bg-bg-3/40 rounded-xl" />
          <div className="glass-card p-5 h-56 animate-pulse bg-bg-3/40 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-sm text-muted">{error}</p>
        <button onClick={load} className="btn-ghost flex items-center gap-2">
          <RefreshCw size={12} /> Thử lại
        </button>
      </div>
    );
  }

  const { users, logins, recentLogs = [], securityEvents = [] } = data || {};

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <LayoutDashboard size={16} /> Tổng Quan Hệ Thống
        </h1>
        <p className="section-subtitle mt-1">Trạng thái nền tảng · Bảo mật · Hoạt động gần đây</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Tổng Tài Khoản" value={users?.total} icon={Users} color="text-gold" bg="bg-gold/8" delta={logins?.today} />
        <KPICard label="Đang Hoạt Động" value={users?.active} icon={Activity} color="text-green-400" bg="bg-green-400/8" />
        <KPICard label="Đăng Nhập Hôm Nay" value={logins?.today} icon={TrendingUp} color="text-blue-400" bg="bg-blue-400/8" />
        <KPICard label="Đăng Nhập Thất Bại" value={logins?.failedToday} icon={AlertTriangle} color="text-amber-400" bg="bg-amber-400/8" />
      </div>

      {/* System Health + Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* System Health */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="section-title text-sm">Trạng Thái Hệ Thống</h3>
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
              5/6 services online
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {services.map((s, i) => <HealthCard key={i} {...s} />)}
          </div>
        </div>

        {/* Recent Security Events */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="section-title text-sm">Sự Kiện Bảo Mật Gần Đây</h3>
            <button onClick={() => onTabChange?.('audit')} className="text-[10px] text-gold hover:text-gold-light flex items-center gap-1">
              Xem tất cả <ChevronRight size={10} />
            </button>
          </div>
          <div className="glass-card p-4 space-y-2">
            {securityEvents.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <CheckCircle2 size={28} className="text-green-400/40" />
                <p className="text-xs text-muted">Không có sự kiện bảo mật nào</p>
              </div>
            ) : (
              securityEvents.map((ev, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gold/6 last:border-0">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${SEVERITY_DOT[ev.severity] || 'bg-muted'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-cream truncate">{ev.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted font-mono">{ev.ip || '—'}</span>
                      <span className="text-[9px] text-muted">{timeAgo(ev.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent System Logs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="section-title text-sm">Hoạt Động Gần Đây</h3>
          <button onClick={() => onTabChange?.('audit')} className="text-[10px] text-gold hover:text-gold-light flex items-center gap-1">
            Xem toàn bộ nhật ký <ChevronRight size={10} />
          </button>
        </div>
        <div className="glass-panel-luxury overflow-hidden">
          {recentLogs.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Clock size={28} className="text-muted/30" />
              <p className="text-xs text-muted">Chưa có hoạt động nào được ghi nhận</p>
            </div>
          ) : (
            <div className="relative p-5 space-y-0">
              <div className="absolute left-[24px] top-5 bottom-5 w-px bg-gradient-to-b from-gold/30 via-gold/10 to-transparent" />
              {recentLogs.map((log, i) => (
                <div key={i} className="flex gap-4 pb-4 animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className={`relative z-10 w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center border ${
                    log.severity === 'success' ? 'bg-green-400/20 border-green-400/40' :
                    log.severity === 'warning' ? 'bg-amber-400/20 border-amber-400/40' :
                    log.severity === 'error' ? 'bg-red-400/20 border-red-400/40' :
                    'bg-blue-400/20 border-blue-400/40'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[log.severity] || 'bg-blue-400'}`} />
                  </div>
                  <div className="flex-1 flex items-start justify-between gap-4 min-w-0 pb-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{ACTION_ICON[log.action] || '📋'}</span>
                        <span className="text-[11px] text-cream truncate">{log.description || log.action}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-muted">{log.user?.name || 'System'}</span>
                        {log.ip && <span className="text-[9px] text-muted font-mono">· {log.ip}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted shrink-0">{timeAgo(log.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="section-title text-sm">Hành Động Nhanh</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon={UserPlus} label="Tạo Manager" onClick={() => onTabChange?.('users')} />
          <QuickAction icon={Shield} label="Kiểm Tra Bảo Mật" onClick={() => onTabChange?.('security')} />
          <QuickAction icon={Activity} label="Xem Audit Logs" onClick={() => onTabChange?.('audit')} />
          <QuickAction icon={Zap} label="Cấu Hình Hệ Thống" onClick={() => onTabChange?.('config')} />
        </div>
      </div>
    </div>
  );
}

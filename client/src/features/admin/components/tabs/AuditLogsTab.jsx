import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, RefreshCw, AlertCircle, ChevronLeft, ChevronRight,
  X, Search, Filter, Download, ChevronDown, ChevronUp
} from 'lucide-react';
import { logAPI } from '../../../../api';

const CATEGORY_LABELS = { USER: 'Người dùng', SYSTEM: 'Hệ thống', SECURITY: 'Bảo mật', CONFIG: 'Cấu hình', BACKUP: 'Sao lưu' };
const SEVERITY_STYLES = {
  success: { dot: 'bg-green-400', ring: 'border-green-400/40 bg-green-400/10', text: 'text-green-400', badge: 'bg-green-400/10 text-green-400' },
  info: { dot: 'bg-blue-400', ring: 'border-blue-400/40 bg-blue-400/10', text: 'text-blue-400', badge: 'bg-blue-400/10 text-blue-400' },
  warning: { dot: 'bg-amber-400', ring: 'border-amber-400/40 bg-amber-400/10', text: 'text-amber-400', badge: 'bg-amber-400/10 text-amber-400' },
  error: { dot: 'bg-red-400', ring: 'border-red-400/40 bg-red-400/10', text: 'text-red-400', badge: 'bg-red-400/10 text-red-400' },
};
const ACTION_ICON = {
  LOGIN_SUCCESS: '🔐', LOGIN_FAILED: '⚠️', USER_REGISTERED: '👤', USER_CREATED: '➕',
  USER_DELETED: '🗑️', ROLE_CHANGED: '🛡️', PASSWORD_RESET: '🔑', SETTING_UPDATED: '⚙️',
  BACKUP_CREATED: '💾', AI_REQUEST: '🤖',
};
const PAGE_SIZE = 15;

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}

/* ── Single Log Entry ─────────────────────────────────── */
function LogEntry({ log }) {
  const [expanded, setExpanded] = useState(false);
  const s = SEVERITY_STYLES[log.severity] || SEVERITY_STYLES.info;
  const hasDiff = log.before || log.after;

  return (
    <div className="flex gap-4 pb-4 animate-fade-up">
      <div className={`relative z-10 w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center border ${s.ring}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-sm">{ACTION_ICON[log.action] || '📋'}</span>
            <span className="text-[11px] font-medium text-cream">{log.description || log.action}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide ${s.badge}`}>
              {log.severity}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-muted font-mono">{formatDate(log.createdAt)}</span>
            {hasDiff && (
              <button onClick={() => setExpanded(e => !e)} className="text-muted hover:text-gold transition-colors">
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          {log.user?.name && <span className="text-[10px] text-muted">👤 {log.user.name} ({log.user.role})</span>}
          {log.ip && <span className="text-[10px] text-muted font-mono">📍 {log.ip}</span>}
          {log.device && <span className="text-[10px] text-muted">🖥 {log.device}</span>}
          {log.category && (
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-gold/15 text-muted uppercase tracking-wide">
              {CATEGORY_LABELS[log.category] || log.category}
            </span>
          )}
        </div>
        {expanded && hasDiff && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {log.before && (
              <div className="bg-red-400/5 border border-red-400/15 rounded-lg p-3">
                <div className="text-[9px] text-red-400 uppercase tracking-wide mb-1 font-medium">Trước</div>
                <pre className="text-[10px] text-muted overflow-x-auto">{JSON.stringify(log.before, null, 2)}</pre>
              </div>
            )}
            {log.after && (
              <div className="bg-green-400/5 border border-green-400/15 rounded-lg p-3">
                <div className="text-[9px] text-green-400 uppercase tracking-wide mb-1 font-medium">Sau</div>
                <pre className="text-[10px] text-muted overflow-x-auto">{JSON.stringify(log.after, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function AuditLogsTab() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (category) params.category = category;
      if (severity) params.severity = severity;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await logAPI.getLogs(params);
      if (res.success) {
        setLogs(res.data);
        setPagination(res.pagination || { total: res.data.length, page: p, pages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Không thể tải nhật ký');
    } finally {
      setLoading(false);
    }
  }, [search, category, severity, from, to]);

  useEffect(() => { setPage(1); }, [search, category, severity, from, to]);
  useEffect(() => { load(page); }, [page, search, category, severity, from, to]);

  const clearFilters = () => { setSearch(''); setCategory(''); setSeverity(''); setFrom(''); setTo(''); };
  const hasFilters = search || category || severity || from || to;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2"><ClipboardList size={16} /> Audit Logs</h1>
          <p className="section-subtitle mt-1">Nhật ký kiểm toán · {pagination.total} bản ghi</p>
        </div>
        <button onClick={() => load(page)} className="btn-ghost flex items-center gap-1.5 text-[11px]">
          <RefreshCw size={11} /> Làm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Filter size={12} className="text-muted" />
          <span className="text-[11px] text-muted uppercase tracking-wider">Bộ lọc</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-40">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="luxury-input pl-8 text-[11px]" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="luxury-input luxury-select text-[11px] w-auto" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Tất cả danh mục</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="luxury-input luxury-select text-[11px] w-auto" value={severity} onChange={e => setSeverity(e.target.value)}>
            <option value="">Tất cả mức độ</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <input type="date" className="luxury-input text-[11px] w-auto" value={from} onChange={e => setFrom(e.target.value)} title="Từ ngày" />
          <input type="date" className="luxury-input text-[11px] w-auto" value={to} onChange={e => setTo(e.target.value)} title="Đến ngày" />
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost text-[11px] flex items-center gap-1">
              <X size={11} /> Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-panel-luxury p-5">
        {error ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-xs text-muted">{error}</p>
            <button onClick={() => load(page)} className="btn-ghost text-[11px]">Thử lại</button>
          </div>
        ) : loading ? (
          <div className="relative space-y-0">
            <div className="absolute left-[6px] top-0 bottom-0 w-px bg-gradient-to-b from-gold/20 to-transparent" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4 pb-4">
                <div className="w-4 h-4 rounded-full bg-bg-3/60 shrink-0 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-bg-3/60 rounded animate-pulse w-3/4" />
                  <div className="h-2 bg-bg-3/40 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <ClipboardList size={32} className="text-muted/30" />
            <p className="text-sm text-muted">{hasFilters ? 'Không có nhật ký phù hợp với bộ lọc' : 'Chưa có nhật ký nào'}</p>
            {hasFilters && <button onClick={clearFilters} className="btn-ghost text-[11px]">Xóa bộ lọc</button>}
          </div>
        ) : (
          <div className="relative space-y-0">
            <div className="absolute left-[6px] top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-gold/10 to-transparent" />
            {logs.map((log, i) => <LogEntry key={log._id || i} log={log} />)}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)} / {pagination.total}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded border border-gold/15 text-muted hover:text-gold disabled:opacity-30 flex items-center justify-center">
              <ChevronLeft size={13} />
            </button>
            {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
              const pg = i + 1;
              return (
                <button key={i} onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded border text-[11px] transition-all ${page === pg ? 'border-gold bg-gold/10 text-gold' : 'border-gold/15 text-muted hover:text-gold'}`}>
                  {pg}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="w-8 h-8 rounded border border-gold/15 text-muted hover:text-gold disabled:opacity-30 flex items-center justify-center">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

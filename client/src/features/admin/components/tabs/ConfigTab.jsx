import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings, Database, Bot, Mail, Wrench, ToggleLeft, ToggleRight,
  RefreshCw, Save, AlertCircle, CheckCircle2, Eye, EyeOff, TestTube
} from 'lucide-react';
import { settingsAPI } from '../../../../api';
import toast from 'react-hot-toast';

function SectionCard({ title, icon: Icon, children, color = 'text-gold' }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-gold/10">
        <div className="w-8 h-8 rounded-lg bg-gold/8 border border-gold/15 flex items-center justify-center">
          <Icon size={15} className={color} />
        </div>
        <h3 className="text-xs font-semibold text-cream">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange, danger }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gold/6 last:border-0">
      <div className="min-w-0 flex-1 mr-4">
        <div className={`text-[11px] font-medium ${danger ? 'text-wine-light' : 'text-cream'}`}>{label}</div>
        {desc && <div className="text-[10px] text-muted mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium transition-all shrink-0 ${
          value
            ? danger ? 'bg-wine/15 border-wine/30 text-wine-light' : 'bg-green-400/10 border-green-400/25 text-green-400'
            : 'bg-bg-3 border-gold/15 text-muted hover:border-gold/25'
        }`}
      >
        {value ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        {value ? 'BẬT' : 'TẮT'}
      </button>
    </div>
  );
}

function FieldRow({ label, type = 'text', value, onChange, disabled, placeholder, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="luxury-label">{label}</label>
      <div className="relative">
        <input
          type={type === 'password' ? (show ? 'text' : 'password') : type}
          className="luxury-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
        />
        {type === 'password' && (
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold">
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] text-muted mt-1">{hint}</p>}
    </div>
  );
}

export default function ConfigTab() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dirty, setDirty] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsAPI.getSettings();
      if (res.success) {
        const vals = {};
        Object.entries(res.data).forEach(([k, s]) => { vals[k] = s.value; });
        setSettings(vals);
        setDirty({});
      }
    } catch (err) {
      setError(err.message || 'Không thể tải cấu hình');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key, value) => {
    setSettings(s => ({ ...s, [key]: value }));
    setDirty(d => ({ ...d, [key]: true }));
  };

  const saveSection = async (keys) => {
    setSaving(true);
    try {
      const payload = {};
      keys.forEach(k => { if (k in settings) payload[k] = settings[k]; });
      const res = await settingsAPI.updateSettings(payload);
      if (res.success) {
        toast.success('Đã lưu cấu hình');
        const cleared = { ...dirty };
        keys.forEach(k => delete cleared[k]);
        setDirty(cleared);
      }
    } catch (err) {
      toast.error(err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const isSectionDirty = (keys) => keys.some(k => dirty[k]);

  const handleMaintenanceToggle = (val) => {
    if (val && !confirm('⚠️ Bật Maintenance Mode sẽ chặn TẤT CẢ người dùng (trừ Admin). Xác nhận?')) return;
    set('maintenance_mode', val);
  };

  if (loading) {
    return (
      <div className="space-y-5">
        {[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5 h-40 animate-pulse bg-bg-3/40 rounded-xl" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-sm text-muted">{error}</p>
        <button onClick={load} className="btn-ghost flex items-center gap-2"><RefreshCw size={12} /> Thử lại</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="section-title flex items-center gap-2"><Settings size={16} /> Cấu Hình Hệ Thống</h1>
        <p className="section-subtitle mt-1">Cài đặt nền tảng · Không bao gồm vận hành nhà hàng</p>
      </div>

      {/* General */}
      <SectionCard title="Cài Đặt Chung" icon={Settings}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Tên ứng dụng" value={settings.app_name || ''} onChange={v => set('app_name', v)} />
          <div>
            <label className="luxury-label">Múi giờ</label>
            <select className="luxury-input luxury-select" value={settings.timezone || ''} onChange={e => set('timezone', e.target.value)}>
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
              <option value="UTC">UTC</option>
              <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
            </select>
          </div>
          <div>
            <label className="luxury-label">Ngôn ngữ</label>
            <select className="luxury-input luxury-select" value={settings.language || ''} onChange={e => set('language', e.target.value)}>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={() => saveSection(['app_name', 'timezone', 'language'])}
            disabled={saving || !isSectionDirty(['app_name', 'timezone', 'language'])}
            className="btn-gold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save size={12} /> Lưu
          </button>
        </div>
      </SectionCard>

      {/* AI Config */}
      <SectionCard title="Cấu Hình AI (Sakura AI)" icon={Bot} color="text-purple-400">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-400/5 border border-green-400/15">
          <CheckCircle2 size={14} className="text-green-400 shrink-0" />
          <div>
            <div className="text-[11px] text-cream">Gemini AI đang kết nối</div>
            <div className="text-[10px] text-muted">Model: gemini-2.0-flash</div>
          </div>
          <span className="ml-auto status-badge status-available text-[9px]">Online</span>
        </div>
        <p className="text-[10px] text-muted">API Key và model được cấu hình qua biến môi trường <code className="bg-bg-3 px-1 rounded">.env</code> trên server.</p>
      </SectionCard>

      {/* Email */}
      <SectionCard title="Cấu Hình Email (SMTP)" icon={Mail} color="text-blue-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="SMTP Host" value={settings.smtp_host || ''} onChange={v => set('smtp_host', v)} placeholder="smtp.gmail.com" />
          <FieldRow label="SMTP Port" type="number" value={settings.smtp_port || 587} onChange={v => set('smtp_port', Number(v))} />
          <FieldRow label="From Email" value={settings.smtp_from || ''} onChange={v => set('smtp_from', v)} placeholder="noreply@sakura.com" />
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end pt-2">
          <button className="btn-ghost flex items-center gap-1.5 text-[11px]">
            <TestTube size={11} /> Gửi email kiểm tra
          </button>
          <button
            onClick={() => saveSection(['smtp_host', 'smtp_port', 'smtp_from'])}
            disabled={saving || !isSectionDirty(['smtp_host', 'smtp_port', 'smtp_from'])}
            className="btn-gold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save size={12} /> Lưu
          </button>
        </div>
      </SectionCard>

      {/* Backup */}
      <SectionCard title="Sao Lưu & Dữ Liệu" icon={Database} color="text-amber-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Cron sao lưu tự động" value={settings.backup_schedule || ''} onChange={v => set('backup_schedule', v)} hint="VD: 0 2 * * * = 02:00 AM mỗi ngày" />
          <FieldRow label="Số bản sao lưu giữ lại" type="number" value={settings.backup_keep || 30} onChange={v => set('backup_keep', Number(v))} />
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end pt-2">
          <button className="btn-ghost flex items-center gap-1.5 text-[11px]">
            <Database size={11} /> Sao lưu ngay
          </button>
          <button
            onClick={() => saveSection(['backup_schedule', 'backup_keep'])}
            disabled={saving || !isSectionDirty(['backup_schedule', 'backup_keep'])}
            className="btn-gold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save size={12} /> Lưu
          </button>
        </div>
      </SectionCard>

      {/* Feature Toggles */}
      <SectionCard title="Feature Toggles" icon={Wrench} color="text-green-400">
        <div className="space-y-0">
          <ToggleRow label="Cho phép đăng ký tài khoản" desc="Người dùng mới có thể tự đăng ký"
            value={!!settings.allow_registration} onChange={v => set('allow_registration', v)} />
          <ToggleRow label="Cho phép đặt bàn online" desc="Khách hàng có thể đặt bàn qua website"
            value={!!settings.allow_booking} onChange={v => set('allow_booking', v)} />
          <ToggleRow label="Gửi email xác nhận" desc="Gửi email xác nhận đặt bàn"
            value={!!settings.send_email_confirmation} onChange={v => set('send_email_confirmation', v)} />
          <ToggleRow label="AI Chat cho khách hàng" desc="Hiển thị Sakura AI với khách hàng"
            value={!!settings.show_ai_chat_customer} onChange={v => set('show_ai_chat_customer', v)} />
          <ToggleRow label="Chế độ bảo trì" desc="⚠️ Chặn tất cả người dùng trừ Admin"
            value={!!settings.maintenance_mode} onChange={handleMaintenanceToggle} danger />
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={() => saveSection(['allow_registration', 'allow_booking', 'send_email_confirmation', 'show_ai_chat_customer', 'maintenance_mode'])}
            disabled={saving || !isSectionDirty(['allow_registration', 'allow_booking', 'send_email_confirmation', 'show_ai_chat_customer', 'maintenance_mode'])}
            className="btn-gold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save size={12} /> Lưu cài đặt
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

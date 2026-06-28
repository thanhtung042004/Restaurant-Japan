import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, Users, Activity, Bot, RefreshCw, AlertCircle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { adminAPI, userAPI } from '../../../../api';

const ROLE_COLORS = { admin: '#c9a447', manager: '#818cf8', waiter: '#34d399', customer: '#f472b6' };
const ROLE_LABELS = { admin: 'Admin', manager: 'Quản Lý', waiter: 'Phục Vụ', customer: 'Khách Hàng' };

const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: '#1a1208', border: '1px solid rgba(201,164,71,0.2)', borderRadius: '8px', fontSize: '11px', color: '#f2e8d5' },
  cursor: { fill: 'rgba(201,164,71,0.05)' },
};

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="kpi-card p-4">
      <div className={`w-8 h-8 rounded-lg bg-current/8 border border-current/20 flex items-center justify-center mb-3`} style={{ color }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div className="font-serif text-2xl tabular-nums" style={{ color }}>{value ?? '—'}</div>
      <div className="text-[10px] text-muted uppercase tracking-wider mt-1">{label}</div>
      {sub && <div className="text-[10px] text-muted/60 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="section-title text-sm flex items-center gap-2">
      <Icon size={13} /> {children}
    </h3>
  );
}

export default function AnalyticsTab() {
  const [stats, setStats] = useState(null);
  const [userCounts, setUserCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, userRes] = await Promise.all([
        adminAPI.getStats(),
        userAPI.getUsers({ limit: 1 }),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (userRes.success) setUserCounts(userRes.pagination);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-up">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="kpi-card p-4 h-28 animate-pulse bg-bg-3/40 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5 h-56 animate-pulse bg-bg-3/40 rounded-xl" />)}
        </div>
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

  const { userGrowth = [], roleDistribution = [], dailyLogins = [], aiUsage = [], aiToday = 0 } = stats || {};

  // Fill missing dates for user growth (last 14 days)
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
  const growthMap = Object.fromEntries(userGrowth.map(d => [d._id, d.count]));
  const growthData = last14.map(date => ({ date: date.slice(5), count: growthMap[date] || 0 }));

  // Role donut data
  const roleData = roleDistribution.map(r => ({
    name: ROLE_LABELS[r._id] || r._id,
    value: r.count,
    color: ROLE_COLORS[r._id] || '#8a7560',
  }));

  // Login chart (7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const loginMap = Object.fromEntries(dailyLogins.map(d => [d._id, d.count]));
  const loginData = last7.map(date => ({ date: date.slice(5), logins: loginMap[date] || 0 }));

  const aiMap = Object.fromEntries(aiUsage.map(d => [d._id, d.count]));
  const aiData = last7.map(date => ({ date: date.slice(5), requests: aiMap[date] || 0 }));

  const totalRoleUsers = roleData.reduce((acc, r) => acc + r.value, 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="section-title flex items-center gap-2"><BarChart3 size={16} /> Thống Kê Nền Tảng</h1>
        <p className="section-subtitle mt-1">Số liệu hệ thống · Người dùng · AI · Hoạt động</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Tổng Tài Khoản" value={userCounts?.total} icon={Users} color="#c9a447" />
        <StatCard label="Đăng Nhập Hôm Nay" value={loginData[loginData.length - 1]?.logins} icon={Activity} color="#34d399" />
        <StatCard label="AI Requests Hôm Nay" value={aiToday} icon={Bot} color="#818cf8" />
        <StatCard label="Người Dùng Mới (30 ngày)" value={userGrowth.reduce((s, d) => s + d.count, 0)} icon={TrendingUp} color="#f472b6" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User Growth */}
        <div className="glass-card p-5">
          <SectionTitle icon={TrendingUp}>Người Dùng Mới (14 ngày)</SectionTitle>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#8a7560' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#8a7560' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="count" stroke="#c9a447" strokeWidth={2} dot={{ fill: '#c9a447', r: 3 }} name="Người mới" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="glass-card p-5">
          <SectionTitle icon={Users}>Phân Bố Theo Vai Trò</SectionTitle>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {roleData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 flex-1">
              {roleData.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                    <span className="text-[11px] text-muted">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-cream">{r.value}</span>
                    <span className="text-[10px] text-muted">({totalRoleUsers ? Math.round(r.value / totalRoleUsers * 100) : 0}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Logins */}
        <div className="glass-card p-5">
          <SectionTitle icon={Activity}>Đăng Nhập Hàng Ngày (7 ngày)</SectionTitle>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loginData} barSize={16}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#8a7560' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#8a7560' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Bar dataKey="logins" fill="#34d399" radius={[3, 3, 0, 0]} name="Đăng nhập" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Usage */}
        <div className="glass-card p-5">
          <SectionTitle icon={Bot}>AI Requests (7 ngày)</SectionTitle>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiData} barSize={16}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#8a7560' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#8a7560' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Bar dataKey="requests" fill="#818cf8" radius={[3, 3, 0, 0]} name="AI requests" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

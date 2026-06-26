import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, LogOut, Shield, ChevronRight, ChevronLeft,
  LayoutDashboard, Utensils, Table2, Users, FileText,
  BarChart3, BookOpen, Settings, Activity, Bell, Search,
  Flame, ClipboardList, Sparkles, Send, X, Bot,
  TrendingUp, Calendar, ChevronDown, Menu, CalendarDays, UserCog
} from 'lucide-react';
import toast from 'react-hot-toast';
import { aiAPI } from '../../api';

/* ── Default tab per role ─────────────────────────────── */
const defaultTabForRole = (role) => {
  if (role === 'admin') return 'users';
  if (role === 'waiter') return 'profile';
  return 'analytics'; // manager and others
};

/* ── Navigation config per role ───────────────────────── */
const NAV_MAP = {
  admin: [
    { icon: Users, label: 'Tài Khoản', tab: 'users' },
    { icon: Activity, label: 'Nhật Ký', tab: 'logs' },
    { icon: Settings, label: 'Cấu Hình', tab: 'config' },
    { icon: BookOpen, label: 'Bảo Mật', tab: 'security' },
  ],
  manager: [
    { icon: LayoutDashboard, label: 'Tổng quan', tab: 'analytics' },
    { icon: Utensils, label: 'Thực đơn', tab: 'menu' },
    { icon: Table2, label: 'Bàn ăn', tab: 'tables' },
    { icon: CalendarDays, label: 'Đặt bàn', tab: 'reservations' },
    { icon: FileText, label: 'Hóa đơn', tab: 'invoices' },
    { icon: Users, label: 'Nhân Sự', tab: 'staff' },
    { icon: Sparkles, label: 'Sakura AI', tab: 'ai' },
  ],
  waiter: [
    { icon: UserCog, label: 'Hồ Sơ Cá Nhân', tab: 'profile' },
  ],
};


const ROLE_LABELS = {
  admin: 'Quản Trị Hệ Thống',
  manager: 'Quản Lý Nhà Hàng',
  waiter: 'Phục Vụ',
  customer: 'Thành Viên',
};

const ROLE_BADGE_CLASS = {
  admin: 'badge-role-admin',
  manager: 'badge-role-manager',
  waiter: 'badge-role-waiter',
  customer: 'badge-role-customer',
};

/* ── Floating AI Chat Bubble ────────────────────────────── */
export function FloatingAIChat({ user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Xin chào ${user?.name?.split(' ').slice(-1)[0] || ''}! Tôi là Sakura AI. Tôi có thể giúp gợi ý món ăn, phân tích doanh thu hoặc tư vấn vận hành nhà hàng. Bạn cần hỗ trợ gì?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open) { setUnread(0); chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }
  }, [open, messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setMessages(p => [...p, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
      const isFoodQ = /món|ăn|sushi|ramen|sashimi|ngon|thích|gợi ý|recommend/i.test(q);
      const res = isFoodQ
        ? await aiAPI.getFoodSuggestion(q)
        : await aiAPI.getBusinessAnalysis(q);
      if (res.success) {
        setMessages(p => [...p, { role: 'ai', text: res.data.answer }]);
        if (!open) setUnread(c => c + 1);
      }
    } catch {
      setMessages(p => [...p, { role: 'ai', text: 'Kết nối gặp sự cố, vui lòng thử lại.' }]);
    } finally { setLoading(false); }
  };

  const quickPrompts = user?.role === 'customer'
    ? ['Gợi ý món cho hôm nay', 'Món chay ngon nhất', 'Combo tốt nhất']
    : ['Doanh thu hôm nay', 'Món bán chạy nhất', 'Dự đoán giờ đông khách'];

  return (
    <>
      {/* Overlay */}
      {open && <div className="ai-overlay" onClick={() => setOpen(false)} />}

      {/* Chat Panel */}
      {open && (
        <div className="ai-chat-panel" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-gold/10 flex items-center justify-between bg-gradient-to-r from-bg-2 to-wood/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-wood flex items-center justify-center">
                  <Bot size={16} className="text-bg" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border border-bg-2" />
              </div>
              <div>
                <div className="font-serif text-sm text-gold tracking-wider">Sakura AI</div>
                <div className="text-[9px] text-green-400 tracking-widest uppercase">Đang hoạt động</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-cream transition-colors p-1">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold/30 to-wood/50 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Bot size={12} className="text-gold" />
                  </div>
                )}
                <div className={`max-w-[78%] px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gold/15 border border-gold/25 text-cream rounded-tr-sm'
                    : 'bg-wood/30 border border-gold/10 text-cream-dim rounded-tl-sm'
                }`} style={msg.role === 'ai' ? { boxShadow: '0 0 12px rgba(201,164,71,0.06)' } : {}}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold/30 to-wood/50 flex items-center justify-center shrink-0">
                  <Bot size={12} className="text-gold" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-wood/30 border border-gold/10 flex gap-1.5 items-center">
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {quickPrompts.map((p, i) => (
                <button key={i} onClick={() => { setInput(p); }}
                  className="text-[10px] px-2.5 py-1 border border-gold/15 text-muted hover:text-gold hover:border-gold/30 rounded-full transition-all">
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gold/10 shrink-0 bg-bg-2/50">
            <div className="flex items-center gap-2 bg-bg/60 border border-gold/15 rounded-full px-4 py-2 focus-within:border-gold/40 transition-all">
              <input
                className="flex-1 bg-transparent outline-none text-xs text-cream placeholder-muted"
                placeholder="Nhập câu hỏi..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                disabled={loading}
              />
              <button onClick={send} disabled={loading || !input.trim()}
                className="w-7 h-7 rounded-full bg-gold hover:bg-gold-light text-bg flex items-center justify-center transition-all disabled:opacity-40 shrink-0">
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bubble Button */}
      <button className="ai-bubble-btn" onClick={() => setOpen(o => !o)} title="Sakura AI Assistant">
        {open ? <X size={20} className="text-bg" /> : <Sparkles size={20} className="text-bg" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}

/* ── Main DashboardLayout ───────────────────────────────── */
export default function DashboardLayout({ user, onLogout, children, activeTab, onTabChange, notifications = [], onClearNotifications }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const navItems = NAV_MAP[user?.role] || [];

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`border-b border-gold/10 flex items-center ${collapsed ? 'px-0 justify-center h-16' : 'px-5 h-20'} transition-all duration-300`}>
        <button
          onClick={() => { onTabChange?.(defaultTabForRole(user?.role)); setMobileOpen(false); }}
          className="flex flex-col items-start select-none group"
        >
          <span className={`font-serif text-gold font-normal tracking-[0.25em] group-hover:glow-text transition-all ${collapsed ? 'text-sm' : 'text-xl'}`}>
            {collapsed ? 'S' : 'SAKURA'}
          </span>
          {!collapsed && (
            <span className="font-jp text-[8px] text-muted tracking-[0.3em] font-light mt-0.5">桜 日本料理</span>
          )}
        </button>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)}
            className="ml-auto text-muted hover:text-gold transition-colors p-1 hidden lg:block">
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* User card */}
      <div className={`border-b border-gold/10 ${collapsed ? 'p-2' : 'p-4'} transition-all`}>
        <div className={`flex ${collapsed ? 'flex-col items-center gap-1' : 'items-center gap-3'}`}>
          <div className="relative shrink-0">
            <div className={`${collapsed ? 'w-9 h-9' : 'w-10 h-10'} rounded-full border border-gold/30 bg-gradient-to-br from-wood to-bg-3 flex items-center justify-center font-serif text-gold text-lg select-none transition-all`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-bg-2" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-cream truncate">{user?.name}</div>
              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase mt-0.5 ${ROLE_BADGE_CLASS[user?.role] || 'text-muted'}`}>
                <Shield size={8} />
                {ROLE_LABELS[user?.role] || user?.role}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto no-scrollbar ${collapsed ? 'p-2 space-y-1' : 'p-3 space-y-0.5'} transition-all`}>
        {/* Home button: navigates to the role's default tab, not the landing page */}
        {user?.role !== 'waiter' && !collapsed && (
          <button
            onClick={() => { onTabChange?.(defaultTabForRole(user?.role)); setMobileOpen(false); }}
            className="nav-item mb-2 w-full"
          >
            <Home size={14} className="shrink-0" />
            <span>Trang Chủ</span>
          </button>
        )}
        {user?.role !== 'waiter' && collapsed && (
          <button
            onClick={() => { onTabChange?.(defaultTabForRole(user?.role)); setMobileOpen(false); }}
            className="nav-item justify-center p-2.5 w-full"
            title="Trang Chủ"
          >
            <Home size={16} />
          </button>
        )}

        {!collapsed && navItems.length > 0 && user?.role !== 'waiter' && (
          <div className="text-[8px] text-muted/50 tracking-widest uppercase px-3 py-1.5 mt-1">Menu</div>
        )}

        {navItems.map(({ icon: Icon, label, tab }) => (
          <button
            key={tab}
            onClick={() => { onTabChange?.(tab); setMobileOpen(false); }}
            className={`nav-item w-full ${collapsed ? 'justify-center p-2.5' : ''} ${activeTab === tab ? 'active border-l-2 border-gold bg-gold/10 text-gold' : 'text-cream hover:bg-gold/5'}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={collapsed ? 16 : 14} className={`shrink-0 ${activeTab === tab ? 'text-gold' : 'text-muted'}`} />
            {!collapsed && <span className="truncate">{label}</span>}
            {!collapsed && activeTab === tab && <ChevronRight size={10} className="ml-auto text-gold" />}
          </button>
        ))}
      </nav>

      {/* Decorative Fuji Mountain & Torii Gate */}
      {!collapsed && user?.role === 'manager' && (
        <div className="relative h-32 w-full shrink-0 overflow-hidden opacity-30 pointer-events-none mt-auto">
          {/* Vẽ núi Phú Sĩ bằng CSS gradient / hình học đơn giản để giả lập hoặc dùng ảnh nếu có */}
          <div className="absolute -bottom-4 -left-4 w-40 h-32 bg-gradient-to-tr from-gold/10 to-transparent clip-triangle"></div>
          <div className="absolute bottom-2 left-6 text-gold/40 font-serif text-3xl font-light">⛩</div>
        </div>
      )}

      {/* Collapse toggle (expanded) & Logout */}
      <div className={`border-t border-gold/10 ${collapsed ? 'p-2 space-y-1' : 'p-3 space-y-2'}`}>
        {collapsed && (
          <button onClick={() => setCollapsed(false)}
            className="nav-item justify-center p-2.5 w-full" title="Mở rộng">
            <ChevronRight size={16} />
          </button>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'} rounded-lg text-wine-light hover:bg-wine/10 hover:text-wine-bright border border-transparent hover:border-wine/20 transition-all text-xs uppercase tracking-wider font-medium`}
          title={collapsed ? 'Đăng Xuất' : undefined}
        >
          <LogOut size={collapsed ? 16 : 13} className="shrink-0" />
          {!collapsed && <span>Đăng Xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-cream flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — Desktop */}
      <aside className={`hidden lg:flex flex-col shrink-0 border-r border-gold/8 bg-bg-2 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent />
      </aside>

      {/* Sidebar — Mobile drawer */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-bg-2 border-r border-gold/10 z-50 flex flex-col transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-gold/5 flex items-center justify-between px-4 md:px-8 bg-bg/90 backdrop-blur-sm shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden text-muted hover:text-gold transition-colors p-1">
              <Menu size={18} />
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Search (Removed based on mockup, but keeping it small if needed, mockup doesn't have it on topbar) */}

            {/* Date & Time */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-muted">
                {time.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
              <span className="text-sm font-semibold text-cream">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </div>

            {/* Notification bell — realtime socket-driven */}
            <div className="relative flex items-center justify-center">
              <button onClick={() => setNotifOpen(o => !o)}
                className="relative text-gold hover:text-gold-light transition-all flex items-center justify-center">
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border border-bg text-[8px] font-bold flex items-center justify-center text-white animate-pulse">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 glass-panel-luxury p-0 overflow-hidden z-50 shadow-luxury-lg">
                  <div className="px-4 py-3 border-b border-gold/10 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gold tracking-wider uppercase">Thông Báo</span>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button onClick={() => { onClearNotifications?.(); setNotifOpen(false); }}
                          className="text-[10px] text-muted hover:text-cream transition-colors">Xoá tất cả</button>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="text-muted hover:text-cream"><X size={12} /></button>
                    </div>
                  </div>
                  <div className="divide-y divide-gold/5 max-h-80 overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell size={24} className="text-muted/30 mx-auto mb-2" />
                        <p className="text-xs text-muted">Chưa có thông báo mới</p>
                      </div>
                    ) : notifications.map((n, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-gold/5 transition-colors">
                        <div className="flex items-start gap-3">
                          <span className="text-base shrink-0">{n.icon}</span>
                          <div>
                            <p className="text-xs text-cream">{n.message}</p>
                            <p className="text-[10px] text-muted mt-0.5">
                              {Math.floor((Date.now() - new Date(n.time)) / 60000)} phút trước
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar + role */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gold/30">
                {/* Fallback to initials if no image, but mockup has an image. Let's use a placeholder image or gradient */}
                <div className="w-full h-full bg-gradient-to-br from-wood to-bg-3 flex items-center justify-center font-serif text-gold text-lg select-none">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-cream leading-none group-hover:text-gold transition-colors">{user?.name?.split(' ').slice(-1)[0] || 'Manager'}</span>
                  <ChevronDown size={14} className="text-muted" />
                </div>
                <span className="text-[10px] text-muted mt-1">
                  {ROLE_LABELS[user?.role]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-bg">
          <div className="animate-fade-up">
            {children}
          </div>
        </main>
      </div>

      {/* Floating AI bubble — visible to all staff */}
      <FloatingAIChat user={user} />
    </div>
  );
}

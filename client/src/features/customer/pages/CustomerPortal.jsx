import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Calendar, Clock, User, Settings, LogOut,
  Phone, Mail, MapPin, Instagram, Facebook, Heart,
  ArrowRight, Sparkles, CheckCircle2, ChevronDown, Camera,
  X, RefreshCw, Loader2, Edit2, Save, ChevronLeft, ChevronRight,
  UtensilsCrossed, FileText, Search,
} from 'lucide-react';

import spaceGallery from '../../../assets/space_gallery.png';
import sushiDish from '../../../assets/sushi_dish.png';
import wagyuDish from '../../../assets/wagyu.png';
import { reservationAPI, menuAPI, categoryAPI, authAPI } from '../../../api';
import toast from 'react-hot-toast';
import { FloatingAIChat } from '../../../components/layout/DashboardLayout';

const MOCK_SUGGESTIONS = [
  { id: 1, name: 'Sushi Omakase', image: sushiDish },
  { id: 2, name: 'Wagyu A5', image: wagyuDish },
  { id: 3, name: 'Sashimi Deluxe', image: sushiDish },
];

const SIDEBAR_NAV = [
  { id: 'home', label: 'Trang Chủ', icon: Home },
  { id: 'booking', label: 'Đặt Bàn', icon: Calendar },
  { id: 'history', label: 'Lịch Sử Đặt Bàn', icon: Clock },
  { id: 'profile', label: 'Hồ Sơ Cá Nhân', icon: User },
];

const STATUS_CONFIG = {
  pending:   { label: 'Chờ xác nhận', cls: 'bg-gold/15 text-gold border-gold/25' },
  confirmed: { label: 'Đã xác nhận',  cls: 'bg-green-500/15 text-green-400 border-green-500/25' },
  cancelled: { label: 'Đã hủy',        cls: 'bg-red-500/15 text-red-400 border-red-500/25' },
  completed: { label: 'Hoàn thành',    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
};

const today = new Date().toISOString().split('T')[0];

// ── Menu Modal ──────────────────────────────────────────────────────────────
function MenuModal({ onClose }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          menuAPI.getItems({ limit: 200 }),
          categoryAPI.getCategories(),
        ]);
        if (menuRes.success) setItems(menuRes.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (e) {
        toast.error('Không thể tải menu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = items.filter(item => {
    const matchCat = activeCategory === 'all' || item.category?._id === activeCategory || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && item.isAvailable;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0e0a06] border border-[#c9a447]/20 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(201,164,71,0.12)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#c9a447]/10">
          <div>
            <h2 className="font-serif text-2xl text-[#c9a447]">Thực Đơn Sakura</h2>
            <p className="text-xs text-[#8c7355] mt-0.5">Khám phá các món ăn Nhật Bản đặc sắc</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-[#c9a447]/20 flex items-center justify-center text-[#8c7355] hover:text-[#c9a447] hover:border-[#c9a447]/50 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Search + Category tabs */}
        <div className="p-4 border-b border-[#c9a447]/10 space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7355]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm món ăn..."
              className="w-full bg-[#15110d] border border-[#c9a447]/15 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#f2e8d5] placeholder-[#5a4a35] focus:outline-none focus:border-[#c9a447]/40"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === 'all' ? 'bg-[#c9a447] text-[#070503]' : 'border border-[#c9a447]/20 text-[#8c7355] hover:text-[#c9a447]'}`}
            >
              Tất cả
            </button>
            {categories.map(c => (
              <button
                key={c._id}
                onClick={() => setActiveCategory(c._id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === c._id ? 'bg-[#c9a447] text-[#070503]' : 'border border-[#c9a447]/20 text-[#8c7355] hover:text-[#c9a447]'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items grid */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={28} className="text-[#c9a447] animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[#8c7355]">
              <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy món nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(item => (
                <div key={item._id} className="bg-[#15110d] border border-[#c9a447]/10 rounded-xl overflow-hidden hover:border-[#c9a447]/30 transition-all group">
                  <div className="relative h-32 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-[#1a1208] flex items-center justify-center">
                        <UtensilsCrossed size={28} className="text-[#c9a447]/20" />
                      </div>
                    )}
                    {item.isBestSeller && (
                      <span className="absolute top-2 left-2 text-[9px] font-bold bg-[#c9a447] text-[#070503] px-2 py-0.5 rounded-full uppercase tracking-wider">Best Seller</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-serif text-[#f2e8d5] text-sm leading-tight mb-1">{item.name}</p>
                    {item.description && <p className="text-[10px] text-[#7a6040] leading-relaxed line-clamp-2 mb-2">{item.description}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-[#c9a447] font-semibold text-sm">{item.price?.toLocaleString('vi-VN')}₫</span>
                      <div className="flex gap-1">
                        {item.isVegetarian && <span className="text-[9px] bg-green-500/15 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded">Chay</span>}
                        {item.containsSeafood && <span className="text-[9px] bg-blue-500/15 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">Hải sản</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Portal ──────────────────────────────────────────────────────────────
export default function CustomerPortal({ user: initialUser, onLogout, onUserUpdate }) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('home');
  const [user, setUser] = useState(initialUser);
  const [showMenuModal, setShowMenuModal] = useState(false);

  // Booking form state
  const [form, setForm] = useState({
    customerName: initialUser?.name || '',
    phone: initialUser?.phone || '',
    numberOfGuests: '2',
    reservationDate: today,
    reservationTime: '18:00',
    note: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // History state
  const [reservations, setReservations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Profile edit state
  const [editPhone, setEditPhone] = useState(false);
  const [phoneVal, setPhoneVal] = useState(initialUser?.phone || '');
  const [editBio, setEditBio] = useState(false);
  const [bioVal, setBioVal] = useState(initialUser?.bio || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const avatarInputRef = useRef();

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await reservationAPI.getReservations();
      if (res.success) setReservations(res.data);
    } catch (err) {
      toast.error('Không thể tải lịch sử: ' + err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === 'history') loadHistory();
  }, [activeNav]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.phone || !form.numberOfGuests || !form.reservationDate || !form.reservationTime) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setBookingLoading(true);
    try {
      const res = await reservationAPI.create(form);
      if (res.success) {
        setBookingSuccess(res.data);
        toast.success('Đặt bàn thành công! Chúng tôi sẽ xác nhận sớm.');
        setForm(prev => ({ ...prev, note: '' }));
      }
    } catch (err) {
      toast.error(err.message || 'Không thể đặt bàn');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Bạn có chắc muốn hủy đặt bàn này?')) return;
    setCancellingId(id);
    try {
      const res = await reservationAPI.cancel(id);
      if (res.success) {
        toast.success('Đã hủy đặt bàn');
        loadHistory();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  // Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await authAPI.uploadAvatar(formData);
      if (res.success) {
        setUser(res.data);
        onUserUpdate?.(res.data);
        toast.success('Đã cập nhật ảnh đại diện');
      }
    } catch (err) {
      toast.error('Không thể cập nhật ảnh: ' + err.message);
    }
  };

  // Save phone
  const savePhone = async () => {
    setProfileSaving(true);
    try {
      const res = await authAPI.updateProfile({ phone: phoneVal });
      if (res.success) {
        setUser(res.data);
        onUserUpdate?.(res.data);
        setEditPhone(false);
        toast.success('Đã cập nhật số điện thoại');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  // Save bio
  const saveBio = async () => {
    setProfileSaving(true);
    try {
      const res = await authAPI.updateProfile({ bio: bioVal });
      if (res.success) {
        setUser(res.data);
        onUserUpdate?.(res.data);
        setEditBio(false);
        toast.success('Đã cập nhật mô tả');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const upcomingReservations = reservations.filter(r =>
    ['pending', 'confirmed'].includes(r.status) &&
    new Date(r.reservationDate) >= new Date()
  );

  const avatarUrl = user?.avatar || null;

  return (
    <div className="flex h-screen w-full bg-[#070503] text-[#f2e8d5] overflow-hidden font-sans">
      {showMenuModal && <MenuModal onClose={() => setShowMenuModal(false)} />}

      {/* ================= SIDEBAR ================= */}
      <div className="w-[260px] h-full border-r border-[#c9a447]/10 flex flex-col bg-[#0b0805] relative z-20 shrink-0">
        
        {/* Logo */}
        <div className="p-8 pb-10 flex flex-col items-center border-b border-[#c9a447]/5">
          <span className="font-serif text-3xl text-[#c9a447] tracking-[0.25em] glow-text cursor-pointer" onClick={() => navigate('/')}>SAKURA</span>
          <span className="text-[10px] text-[#7a6040] font-jp tracking-[0.3em] mt-2">日本料理店</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {SIDEBAR_NAV.map(nav => (
            <button 
              key={nav.id}
              onClick={() => setActiveNav(nav.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all text-sm font-medium
                ${activeNav === nav.id
                  ? 'bg-gradient-to-r from-[#c9a447]/10 to-transparent border-l-2 border-[#c9a447] text-[#c9a447]' 
                  : 'text-[#8c7355] hover:text-[#c9a447] hover:bg-[#c9a447]/5 border-l-2 border-transparent'
                }`}
            >
              <nav.icon size={18} className={activeNav === nav.id ? 'text-[#c9a447] drop-shadow-[0_0_8px_rgba(201,164,71,0.5)]' : ''} />
              <span className="tracking-wide">{nav.label}</span>
            </button>
          ))}
          
          <button onClick={() => { onLogout(); navigate('/'); }}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-[#8c7355] hover:text-red-400 hover:bg-red-400/5 transition-all text-sm font-medium mt-8 border-l-2 border-transparent">
            <LogOut size={18} />
            <span className="tracking-wide">Đăng Xuất</span>
          </button>
        </div>

        {/* Contact Info */}
        <div className="p-6 border-t border-[#c9a447]/10">
          <div className="glass-panel p-4 rounded-xl space-y-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#c9a447]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-[10px] font-serif text-[#c9a447] tracking-widest uppercase mb-2">Sakura Japanese<br/>Restaurant</div>
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-start gap-3 text-xs text-[#8c7355]">
                <Phone size={14} className="mt-0.5 text-[#c9a447] shrink-0" />
                <div>
                  <div className="text-[#a68a61] mb-0.5">Hotline</div>
                  <div className="text-[#f2e8d5]">(+84) 123 456 789</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-[#8c7355]">
                <Mail size={14} className="mt-0.5 text-[#c9a447] shrink-0" />
                <div>
                  <div className="text-[#a68a61] mb-0.5">Email</div>
                  <div className="text-[#f2e8d5]">info@sakura.com</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-[#8c7355]">
                <MapPin size={14} className="mt-0.5 text-[#c9a447] shrink-0" />
                <div>
                  <div className="text-[#a68a61] mb-0.5">Địa chỉ</div>
                  <div className="text-[#f2e8d5] leading-tight">123 Lê Thánh Tôn, Q.1<br/>TP. Hồ Chí Minh</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-[#c9a447]/10 relative z-10">
              <button className="w-8 h-8 rounded-full bg-[#15110d] border border-[#c9a447]/20 flex items-center justify-center text-[#c9a447] hover:bg-[#c9a447] hover:text-[#070503] transition-colors"><Instagram size={14}/></button>
              <button className="w-8 h-8 rounded-full bg-[#15110d] border border-[#c9a447]/20 flex items-center justify-center text-[#c9a447] hover:bg-[#c9a447] hover:text-[#070503] transition-colors"><Facebook size={14}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 h-full overflow-y-auto relative no-scrollbar bg-[#0a0705] pb-10">
        
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#c9a447]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#15110d] to-transparent pointer-events-none"></div>

        {/* Topbar */}
        <div className="sticky top-0 z-30 px-10 py-5 flex items-center justify-center">
          <div className="flex items-center gap-12 text-sm font-medium tracking-wide">
            {SIDEBAR_NAV.map(nav => (
              <button key={nav.id} onClick={() => setActiveNav(nav.id)}
                className={`transition-colors ${activeNav === nav.id ? 'text-[#c9a447] border-b-2 border-[#c9a447] pb-1' : 'text-[#8c7355] hover:text-[#f2e8d5]'}`}>
                {nav.label}
              </button>
            ))}
          </div>
          
          <div className="absolute right-10 flex items-center gap-3 glass-panel px-4 py-2 rounded-full cursor-pointer hover:bg-[#c9a447]/10 transition-colors">
            <div className="text-right">
              <div className="text-[10px] text-[#8c7355] mb-0.5">Xin chào,</div>
              <div className="text-xs font-semibold text-[#f2e8d5]">{user?.name || 'Khách'}</div>
            </div>
            <ChevronDown size={14} className="text-[#8c7355] ml-1" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a447] to-[#8c7355] border-2 border-[#c9a447]/30 flex items-center justify-center font-serif text-[#070503] text-sm overflow-hidden ml-2">
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Sakura')}&background=c9a447&color=070503&bold=true`} alt="avatar" />
              }
            </div>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="px-10 max-w-[1200px] mx-auto mt-6 relative z-10">

          {/* ===== HOME ===== */}
          {activeNav === 'home' && (
            <div className="space-y-6">
              {/* Welcome & Stats Row */}
              <div className="flex justify-between items-end gap-6 mb-8">
                <div className="flex-1">
                  <p className="text-[#8c7355] text-lg font-serif mb-1">Chào mừng trở lại</p>
                  <h1 className="font-serif text-4xl text-[#c9a447] glow-text tracking-wide mb-4">{user?.name || 'Quý Khách'}</h1>
                  <p className="text-sm text-[#a68a61]">
                    Bạn có <span className="text-[#f2e8d5] font-semibold">{upcomingReservations.length} lượt đặt bàn sắp tới</span>
                  </p>
                  <div className="flex gap-4 mt-6">
                    <button onClick={() => setActiveNav('booking')}
                      className="bg-gradient-to-r from-[#c9a447] to-[#b8953c] text-[#070503] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded hover:scale-105 transition-transform flex items-center gap-2">
                      <Calendar size={14}/> ĐẶT BÀN MỚI
                    </button>
                    <button onClick={() => setActiveNav('history')}
                      className="border border-[#c9a447]/30 text-[#c9a447] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded hover:bg-[#c9a447]/10 transition-colors">
                      XEM LỊCH SỬ
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Booking Card */}
              {upcomingReservations.length > 0 && (
                <div className="glass-panel-luxury p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                    <span className="text-6xl font-serif text-[#c9a447]">🌸</span>
                  </div>
                  <h3 className="section-title mb-5 flex items-center gap-2 text-sm"><Calendar size={16}/> ĐẶT BÀN SẮP TỚI</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative w-full md:w-[280px] h-[180px] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#c9a447]/20 shrink-0">
                      <img src={spaceGallery} className="w-full h-full object-cover" alt="Room" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-serif text-xl text-[#f2e8d5] mb-1">
                            {upcomingReservations[0].table?.tableNumber
                              ? `Bàn ${upcomingReservations[0].table.tableNumber}`
                              : 'Bàn chờ xếp'
                            }
                          </h4>
                        </div>
                        <span className={`text-[9px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border ${STATUS_CONFIG[upcomingReservations[0].status]?.cls}`}>
                          {STATUS_CONFIG[upcomingReservations[0].status]?.label}
                        </span>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar size={15} className="text-[#c9a447]"/>
                          <span className="text-[#a68a61]">{new Date(upcomingReservations[0].reservationDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Clock size={15} className="text-[#c9a447]"/>
                          <span className="text-[#a68a61]">{upcomingReservations[0].reservationTime}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <User size={15} className="text-[#c9a447]"/>
                          <span className="text-[#a68a61]">{upcomingReservations[0].numberOfGuests} khách</span>
                        </div>
                      </div>

                      <button onClick={() => setActiveNav('history')}
                        className="mt-4 border border-[#c9a447]/40 text-[#c9a447] font-semibold text-xs uppercase tracking-widest px-6 py-3 rounded hover:bg-[#c9a447]/10 transition-colors w-max">
                        XEM CHI TIẾT
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Gợi ý dành riêng */}
              <div className="glass-panel-luxury p-6 rounded-2xl relative">
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="section-title flex items-center gap-2 text-sm"><Sparkles size={16}/> GỢI Ý DÀNH RIÊNG CHO BẠN</h3>
                  <button
                    onClick={() => setShowMenuModal(true)}
                    className="text-xs text-[#c9a447] hover:text-[#f2e8d5] flex items-center gap-1 transition-colors border border-[#c9a447]/20 hover:border-[#c9a447]/50 px-3 py-1.5 rounded-lg"
                  >
                    Xem tất cả <ArrowRight size={12}/>
                  </button>
                </div>
                
                <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2 relative z-10">
                  {MOCK_SUGGESTIONS.map((m, i) => (
                    <div key={m.id} className="relative w-[200px] h-[130px] shrink-0 rounded-xl overflow-hidden group cursor-pointer border border-[#c9a447]/10 shadow-lg">
                      <img src={m.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={m.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                         <span className="text-sm font-serif text-[#f2e8d5] drop-shadow-md">{m.name}</span>
                         <button className={`hover:text-white ${i===0 ? 'text-[#c9a447]' : 'text-white/50'}`}><Heart size={16} className={i===0?'fill-[#c9a447]':''}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== BOOKING FORM ===== */}
          {activeNav === 'booking' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-[#c9a447] glow-text mb-2">Đặt Bàn</h1>
                <p className="text-sm text-[#a68a61]">Chúng tôi sẽ xác nhận lại qua điện thoại trong vòng 30 phút</p>
              </div>

              {bookingSuccess ? (
                <div className="glass-panel-luxury p-8 rounded-2xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} className="text-green-400" />
                  </div>
                  <h2 className="font-serif text-2xl text-[#c9a447]">Đặt Bàn Thành Công!</h2>
                  <div className="text-sm text-[#a68a61] space-y-1">
                    <p><span className="text-[#f2e8d5]">{bookingSuccess.customerName}</span> · {bookingSuccess.numberOfGuests} khách</p>
                    <p>{new Date(bookingSuccess.reservationDate).toLocaleDateString('vi-VN')} lúc <span className="text-[#f2e8d5]">{bookingSuccess.reservationTime}</span></p>
                    {bookingSuccess.table && (
                      <p>Bàn dự kiến: <span className="text-[#c9a447]">{bookingSuccess.table.tableNumber}</span></p>
                    )}
                    <p className="text-[#8c7355] text-xs mt-2">Nhân viên sẽ liên hệ xác nhận sớm nhất</p>
                  </div>
                  <div className="flex gap-3 justify-center pt-2">
                    <button onClick={() => { setBookingSuccess(null); setActiveNav('history'); loadHistory(); }}
                      className="border border-[#c9a447]/30 text-[#c9a447] text-xs px-5 py-2.5 rounded hover:bg-[#c9a447]/10 transition-colors">
                      Xem lịch sử
                    </button>
                    <button onClick={() => setBookingSuccess(null)}
                      className="bg-gradient-to-r from-[#c9a447] to-[#b8953c] text-[#070503] font-bold text-xs px-5 py-2.5 rounded">
                      Đặt bàn khác
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBook} className="glass-panel-luxury p-8 rounded-2xl space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="luxury-label">Họ và tên *</label>
                      <input className="luxury-input" value={form.customerName}
                        onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))}
                        placeholder="Nguyễn Văn A" required />
                    </div>
                    <div>
                      <label className="luxury-label">Số điện thoại *</label>
                      <input className="luxury-input" value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="0901 234 567" required />
                    </div>
                    <div>
                      <label className="luxury-label">Ngày đặt *</label>
                      <input type="date" className="luxury-input" value={form.reservationDate}
                        min={today}
                        onChange={e => setForm(p => ({ ...p, reservationDate: e.target.value }))}
                        required />
                    </div>
                    <div>
                      <label className="luxury-label">Giờ đến *</label>
                      <select className="luxury-input luxury-select" value={form.reservationTime}
                        onChange={e => setForm(p => ({ ...p, reservationTime: e.target.value }))}>
                        {['11:00','11:30','12:00','12:30','13:00','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="luxury-label">Số khách *</label>
                      <select className="luxury-input luxury-select" value={form.numberOfGuests}
                        onChange={e => setForm(p => ({ ...p, numberOfGuests: e.target.value }))}>
                        {['1','2','3','4','5','6','7','8','10','12'].map(n => (
                          <option key={n} value={n}>{n} người</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="luxury-label">Ghi chú / Yêu cầu đặc biệt</label>
                    <textarea className="luxury-input" rows={3} value={form.note}
                      onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                      placeholder="Dị ứng thực phẩm, tổ chức sinh nhật, ghế cao cho trẻ em..." />
                  </div>
                  <button type="submit" disabled={bookingLoading}
                    className="w-full bg-gradient-to-r from-[#c9a447] to-[#b8953c] text-[#070503] font-bold text-sm uppercase tracking-widest py-4 rounded hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 disabled:opacity-60">
                    {bookingLoading ? <><Loader2 size={16} className="animate-spin"/> Đang gửi...</> : <><Calendar size={16}/> Xác Nhận Đặt Bàn</>}
                  </button>
                </form>
              )}

              {/* Tips */}
              <div className="glass-panel p-5 rounded-xl border border-[#c9a447]/10 space-y-3">
                <h4 className="text-xs font-semibold text-[#c9a447] tracking-wider uppercase">Lưu ý khi đặt bàn</h4>
                {[
                  'Vui lòng đến đúng giờ hoặc thông báo nếu bị trễ',
                  'Bàn sẽ được giữ trong vòng 15 phút',
                  'Đặt bàn sẽ được xác nhận qua điện thoại',
                  'Thực đơn đặc biệt cần đặt trước 24 giờ',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#8c7355]">
                    <span className="text-[#c9a447] mt-0.5">✦</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== HISTORY ===== */}
          {activeNav === 'history' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-serif text-3xl text-[#c9a447] glow-text mb-1">Lịch Sử Đặt Bàn</h1>
                  <p className="text-sm text-[#a68a61]">Tất cả lịch sử đặt bàn của bạn</p>
                </div>
                <button onClick={loadHistory} className="flex items-center gap-1.5 text-[#8c7355] hover:text-[#c9a447] transition-colors text-xs">
                  <RefreshCw size={12} /> Làm mới
                </button>
              </div>

              {historyLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={24} className="text-[#c9a447] animate-spin" />
                </div>
              ) : reservations.length === 0 ? (
                <div className="glass-panel-luxury p-12 rounded-2xl text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="font-serif text-xl text-[#a68a61] mb-2">Chưa có đặt bàn nào</p>
                  <p className="text-sm text-[#8c7355] mb-6">Hãy đặt bàn để trải nghiệm dịch vụ của Sakura</p>
                  <button onClick={() => setActiveNav('booking')}
                    className="bg-gradient-to-r from-[#c9a447] to-[#b8953c] text-[#070503] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded">
                    Đặt Bàn Ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map(r => (
                    <div key={r._id} className="glass-panel-luxury p-5 rounded-2xl border border-[#c9a447]/10 hover:border-[#c9a447]/20 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#c9a447]/10 border border-[#c9a447]/20 flex items-center justify-center shrink-0">
                            <Calendar size={20} className="text-[#c9a447]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-serif text-[#f2e8d5]">{r.customerName || user?.name}</span>
                              <span className={`text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${STATUS_CONFIG[r.status]?.cls}`}>
                                {STATUS_CONFIG[r.status]?.label}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-[#8c7355]">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={11} className="text-[#c9a447]"/>
                                {new Date(r.reservationDate).toLocaleDateString('vi-VN')}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock size={11} className="text-[#c9a447]"/>
                                {r.reservationTime}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <User size={11} className="text-[#c9a447]"/>
                                {r.numberOfGuests} khách
                              </span>
                              {r.table && (
                                <span className="flex items-center gap-1.5 text-[#c9a447]">
                                  Bàn: {r.table.tableNumber}
                                </span>
                              )}
                            </div>
                            {r.note && (
                              <p className="text-xs text-[#7a6040] mt-1.5 italic">"{r.note}"</p>
                            )}
                          </div>
                        </div>

                        {['pending', 'confirmed'].includes(r.status) && (
                          <button
                            onClick={() => handleCancel(r._id)}
                            disabled={cancellingId === r._id}
                            className="flex items-center gap-1.5 text-xs text-red-400 border border-red-400/20 px-3 py-2 rounded-lg hover:bg-red-400/10 transition-colors disabled:opacity-50 shrink-0">
                            {cancellingId === r._id ? <Loader2 size={12} className="animate-spin"/> : <X size={12}/>}
                            Hủy đặt bàn
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== PROFILE ===== */}
          {activeNav === 'profile' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h1 className="font-serif text-3xl text-[#c9a447] glow-text mb-2">Hồ Sơ Cá Nhân</h1>
                <p className="text-sm text-[#a68a61]">Thông tin tài khoản của bạn</p>
              </div>
              
              <div className="glass-panel-luxury p-8 rounded-2xl">
                {/* Avatar with camera upload */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group mb-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c9a447] to-[#8c7355] border-4 border-[#c9a447]/30 flex items-center justify-center text-[#070503] font-serif text-3xl shadow-[0_0_30px_rgba(201,164,71,0.3)] overflow-hidden">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        : <span>{user?.name?.charAt(0) || 'K'}</span>
                      }
                    </div>
                    {/* Camera icon overlay */}
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      title="Đổi ảnh đại diện"
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#c9a447] border-2 border-[#0e0a06] flex items-center justify-center text-[#070503] hover:bg-[#f2e8d5] transition-colors shadow-lg"
                    >
                      <Camera size={13} />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <h2 className="font-serif text-xl text-[#f2e8d5]">{user?.name}</h2>
                  <span className="text-xs text-[#8c7355] mt-1 bg-[#c9a447]/10 border border-[#c9a447]/20 px-3 py-1 rounded-full">Thành viên Gold</span>
                </div>

                <div className="space-y-1">
                  {/* Email - read only */}
                  <div className="flex items-center gap-4 py-4 border-b border-[#c9a447]/8">
                    <div className="w-8 h-8 rounded-lg bg-[#c9a447]/10 flex items-center justify-center shrink-0">
                      <Mail size={14} className="text-[#c9a447]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-[#7a6040] uppercase tracking-wider">Email</div>
                      <div className="text-sm text-[#f2e8d5] mt-0.5">{user?.email}</div>
                    </div>
                  </div>

                  {/* Phone - editable */}
                  <div className="flex items-center gap-4 py-4 border-b border-[#c9a447]/8">
                    <div className="w-8 h-8 rounded-lg bg-[#c9a447]/10 flex items-center justify-center shrink-0">
                      <Phone size={14} className="text-[#c9a447]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-[#7a6040] uppercase tracking-wider mb-1">Số điện thoại</div>
                      {editPhone ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={phoneVal}
                            onChange={e => setPhoneVal(e.target.value)}
                            placeholder="0901 234 567"
                            className="flex-1 bg-[#15110d] border border-[#c9a447]/30 rounded-lg px-3 py-1.5 text-sm text-[#f2e8d5] focus:outline-none focus:border-[#c9a447]/60"
                            autoFocus
                          />
                          <button onClick={savePhone} disabled={profileSaving}
                            className="w-7 h-7 rounded-lg bg-[#c9a447] flex items-center justify-center text-[#070503] hover:bg-[#f2e8d5] transition-colors disabled:opacity-50">
                            {profileSaving ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>}
                          </button>
                          <button onClick={() => { setEditPhone(false); setPhoneVal(user?.phone || ''); }}
                            className="w-7 h-7 rounded-lg border border-[#c9a447]/20 flex items-center justify-center text-[#8c7355] hover:text-[#c9a447] transition-colors">
                            <X size={12}/>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-[#f2e8d5]">{user?.phone || 'Chưa cập nhật'}</div>
                          <button onClick={() => { setEditPhone(true); setPhoneVal(user?.phone || ''); }}
                            className="w-7 h-7 rounded-lg border border-[#c9a447]/20 flex items-center justify-center text-[#8c7355] hover:text-[#c9a447] hover:border-[#c9a447]/50 transition-colors">
                            <Edit2 size={12}/>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role - read only */}
                  <div className="flex items-center gap-4 py-4 border-b border-[#c9a447]/8">
                    <div className="w-8 h-8 rounded-lg bg-[#c9a447]/10 flex items-center justify-center shrink-0">
                      <User size={14} className="text-[#c9a447]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-[#7a6040] uppercase tracking-wider">Vai trò</div>
                      <div className="text-sm text-[#f2e8d5] mt-0.5">Khách hàng</div>
                    </div>
                  </div>

                  {/* Bio / Dietary preferences - editable */}
                  <div className="flex items-start gap-4 py-4">
                    <div className="w-8 h-8 rounded-lg bg-[#c9a447]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={14} className="text-[#c9a447]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[10px] text-[#7a6040] uppercase tracking-wider">Mô tả / Sở thích ẩm thực</div>
                        {!editBio && (
                          <button onClick={() => { setEditBio(true); setBioVal(user?.bio || ''); }}
                            className="w-7 h-7 rounded-lg border border-[#c9a447]/20 flex items-center justify-center text-[#8c7355] hover:text-[#c9a447] hover:border-[#c9a447]/50 transition-colors">
                            <Edit2 size={12}/>
                          </button>
                        )}
                      </div>
                      {editBio ? (
                        <div className="space-y-2">
                          <textarea
                            value={bioVal}
                            onChange={e => setBioVal(e.target.value)}
                            placeholder="VD: Tôi dị ứng hải sản, không ăn được đồ cay, thích món cuộn và sashimi..."
                            rows={3}
                            maxLength={500}
                            className="w-full bg-[#15110d] border border-[#c9a447]/30 rounded-lg px-3 py-2 text-sm text-[#f2e8d5] placeholder-[#5a4a35] focus:outline-none focus:border-[#c9a447]/60 resize-none"
                            autoFocus
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#5a4a35]">{bioVal.length}/500</span>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditBio(false); setBioVal(user?.bio || ''); }}
                                className="text-xs text-[#8c7355] hover:text-[#c9a447] border border-[#c9a447]/15 px-3 py-1.5 rounded-lg transition-colors">
                                Hủy
                              </button>
                              <button onClick={saveBio} disabled={profileSaving}
                                className="text-xs bg-[#c9a447] text-[#070503] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#f2e8d5] transition-colors disabled:opacity-50 flex items-center gap-1">
                                {profileSaving ? <Loader2 size={11} className="animate-spin"/> : <Save size={11}/>}
                                Lưu
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {user?.bio ? (
                            <p className="text-sm text-[#a68a61] leading-relaxed">{user.bio}</p>
                          ) : (
                            <p className="text-sm text-[#5a4a35] italic">Thêm mô tả về sở thích ăn uống của bạn để nhân viên phục vụ tốt hơn...</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info tip */}
                <div className="mt-4 p-3 bg-[#c9a447]/5 border border-[#c9a447]/10 rounded-xl">
                  <p className="text-[10px] text-[#7a6040] leading-relaxed">
                    <span className="text-[#c9a447]">✦</span> Thông tin mô tả sẽ được nhân viên phục vụ tham khảo khi phục vụ bạn, giúp trải nghiệm ẩm thực phù hợp hơn.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      {/* Floating AI Assistant */}
      <FloatingAIChat user={user} />
    </div>
  );
}

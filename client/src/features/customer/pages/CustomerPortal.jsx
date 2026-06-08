import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Calendar, Clock, Ticket, Star, User, Settings, LogOut,
  Phone, Mail, MapPin, Instagram, Facebook, Heart,
  ChevronRight, ArrowRight, Sparkles, CheckCircle2, ChevronDown, Bot
} from 'lucide-react';

import spaceGallery from '../../../assets/space_gallery.png';
import sushiDish from '../../../assets/sushi_dish.png';
import wagyuDish from '../../../assets/wagyu.png';

const MOCK_UPCOMING = {
  room: "Sakura Premium Room",
  date: "15/06/2026",
  time: "19:00",
  guests: "4 Khách",
  location: "Tầng 3 - Phòng VIP 2",
  status: "ĐÃ XÁC NHẬN"
};

const MOCK_SUGGESTIONS = [
  { id: 1, name: "Sushi Omakase", image: sushiDish },
  { id: 2, name: "Wagyu A5", image: wagyuDish },
  { id: 3, name: "Sashimi Deluxe", image: sushiDish },
];

const MOCK_JOURNEY = [
  { step: 'Đặt bàn', date: '15/06', completed: true },
  { step: 'Dùng bữa', date: '15/06', completed: true },
  { step: 'Thanh toán', date: '15/06', completed: true },
  { step: 'Tích điểm', date: '15/06', completed: true },
];

const SIDEBAR_NAV = [
  { id: 'home', label: 'Trang Chủ', icon: Home, active: true },
  { id: 'booking', label: 'Đặt Bàn', icon: Calendar },
  { id: 'history', label: 'Lịch Sử Đặt Bàn', icon: Clock },
  { id: 'offers', label: 'Ưu Đãi & Voucher', icon: Ticket },
  { id: 'points', label: 'Điểm Thưởng', icon: Star },
  { id: 'profile', label: 'Hồ Sơ Cá Nhân', icon: User },
  { id: 'settings', label: 'Cài Đặt', icon: Settings },
];

export default function CustomerPortal({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full bg-[#070503] text-[#f2e8d5] overflow-hidden font-sans">
      
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
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all text-sm font-medium
                ${nav.active 
                  ? 'bg-gradient-to-r from-[#c9a447]/10 to-transparent border-l-2 border-[#c9a447] text-[#c9a447]' 
                  : 'text-[#8c7355] hover:text-[#c9a447] hover:bg-[#c9a447]/5 border-l-2 border-transparent'
                }`}
            >
              <nav.icon size={18} className={nav.active ? 'text-[#c9a447] drop-shadow-[0_0_8px_rgba(201,164,71,0.5)]' : ''} />
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
              <div className="w-8 h-8 rounded-full bg-[#15110d] border border-[#c9a447]/20 flex items-center justify-center text-[#c9a447] hover:bg-[#c9a447] hover:text-[#070503] transition-colors cursor-pointer font-bold text-xs">
                TikTok
              </div>
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
            <button className="text-[#c9a447] border-b-2 border-[#c9a447] pb-1">Trang Chủ</button>
            <button className="text-[#8c7355] hover:text-[#f2e8d5] transition-colors">Đặt Bàn</button>
            <button className="text-[#8c7355] hover:text-[#f2e8d5] transition-colors">Lịch Sử</button>
            <button className="text-[#8c7355] hover:text-[#f2e8d5] transition-colors">Ưu Đãi</button>
            <button className="text-[#8c7355] hover:text-[#f2e8d5] transition-colors">Hồ Sơ</button>
          </div>
          
          <div className="absolute right-10 flex items-center gap-3 glass-panel px-4 py-2 rounded-full cursor-pointer hover:bg-[#c9a447]/10 transition-colors">
            <div className="text-right">
              <div className="text-[10px] text-[#8c7355] mb-0.5">Xin chào,</div>
              <div className="text-xs font-semibold text-[#f2e8d5]">{user?.name || "Nguyễn Thanh Tùng"}</div>
            </div>
            <ChevronDown size={14} className="text-[#8c7355] ml-1" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a447] to-[#8c7355] border-2 border-[#c9a447]/30 flex items-center justify-center font-serif text-[#070503] text-sm overflow-hidden ml-2">
               {/* User Avatar Placeholder */}
               <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Tung'}&background=c9a447&color=070503&bold=true`} alt="avatar" />
            </div>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="px-10 max-w-[1200px] mx-auto mt-6 relative z-10 space-y-6">
          
          {/* Welcome & Stats Row */}
          <div className="flex justify-between items-end gap-6 mb-8">
            <div className="flex-1">
              <p className="text-[#8c7355] text-lg font-serif mb-1">Chào mừng trở lại</p>
              <h1 className="font-serif text-4xl text-[#c9a447] glow-text tracking-wide mb-4">{user?.name || "Nguyễn Thanh Tùng"}</h1>
              <p className="text-sm text-[#a68a61]">
                Bạn có <span className="text-[#f2e8d5] font-semibold">2 lượt đặt bàn sắp tới</span> <br/>
                và <span className="text-[#f2e8d5] font-semibold">3 ưu đãi đang chờ sử dụng</span>
              </p>
              <div className="flex gap-4 mt-6">
                <button className="bg-gradient-to-r from-[#c9a447] to-[#b8953c] text-[#070503] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded hover:scale-105 transition-transform flex items-center gap-2">
                  <Calendar size={14}/> ĐẶT BÀN MỚI
                </button>
                <button className="border border-[#c9a447]/30 text-[#c9a447] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded hover:bg-[#c9a447]/10 transition-colors">
                  XEM LỊCH SỬ
                </button>
              </div>
            </div>

            {/* 4 Quick Stats */}
            <div className="flex gap-4">
              {/* Đặt bàn */}
              <div className="glass-panel-luxury w-[140px] p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#c9a447]/10 flex items-center justify-center mb-3">
                  <Clock size={18} className="text-[#c9a447]"/>
                </div>
                <div className="text-[10px] text-[#8c7355] uppercase tracking-widest font-semibold mb-1">ĐẶT BÀN</div>
                <div className="text-2xl font-serif text-[#f2e8d5] mb-1">12</div>
                <div className="text-[10px] text-[#7a6040]">Lượt</div>
                <button className="text-[10px] text-[#c9a447] mt-3 flex items-center gap-1 hover:text-white transition-colors">Xem chi tiết <ArrowRight size={10}/></button>
              </div>
              
              {/* Điểm thưởng */}
              <div className="glass-panel-luxury w-[140px] p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#c9a447]/10 flex items-center justify-center mb-3">
                  <Star size={18} className="text-[#c9a447]"/>
                </div>
                <div className="text-[10px] text-[#8c7355] uppercase tracking-widest font-semibold mb-1">ĐIỂM THƯỞNG</div>
                <div className="text-2xl font-serif text-[#f2e8d5] mb-1">2.450</div>
                <div className="text-[10px] text-[#7a6040]">Điểm</div>
                <button className="text-[10px] text-[#c9a447] mt-3 flex items-center gap-1 hover:text-white transition-colors">Xem chi tiết <ArrowRight size={10}/></button>
              </div>

              {/* Voucher */}
              <div className="glass-panel-luxury w-[140px] p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#c9a447]/10 flex items-center justify-center mb-3">
                  <Ticket size={18} className="text-[#c9a447]"/>
                </div>
                <div className="text-[10px] text-[#8c7355] uppercase tracking-widest font-semibold mb-1">VOUCHER</div>
                <div className="text-2xl font-serif text-[#f2e8d5] mb-1">3</div>
                <div className="text-[10px] text-[#7a6040]">Ưu đãi</div>
                <button className="text-[10px] text-[#c9a447] mt-3 flex items-center gap-1 hover:text-white transition-colors">Xem chi tiết <ArrowRight size={10}/></button>
              </div>

              {/* Thành viên */}
              <div className="glass-panel-luxury w-[140px] p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a447] to-[#7a6040] flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(201,164,71,0.3)]">
                  <User size={18} className="text-[#070503]"/>
                </div>
                <div className="text-[10px] text-[#8c7355] uppercase tracking-widest font-semibold mb-1">THÀNH VIÊN</div>
                <div className="text-2xl font-serif text-[#c9a447] glow-text mb-1">Gold</div>
                <div className="text-[10px] text-[#7a6040]">Member</div>
                <button className="text-[10px] text-[#c9a447] mt-3 flex items-center gap-1 hover:text-white transition-colors">Xem chi tiết <ArrowRight size={10}/></button>
              </div>
            </div>
          </div>

          {/* MAIN WIDGETS GRID */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* LEFT COLUMN (8 cols) */}
            <div className="col-span-12 xl:col-span-8 space-y-6">
              
              {/* Đặt bàn sắp tới */}
              <div className="glass-panel-luxury p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                  <span className="text-6xl font-serif text-[#c9a447]">🌸</span>
                </div>
                <h3 className="section-title mb-5 flex items-center gap-2 text-sm"><Calendar size={16}/> ĐẶT BÀN SẮP TỚI</h3>
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="relative w-full md:w-[320px] h-[200px] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-[#c9a447]/20 shrink-0">
                    <img src={spaceGallery} className="w-full h-full object-cover" alt="Room" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-3 right-3 flex gap-2">
                       <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-[#c9a447] hover:text-black transition-colors">&larr;</div>
                       <div className="w-6 h-6 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-[#c9a447] hover:text-black transition-colors">&rarr;</div>
                    </div>
                    {/* Pagination dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#c9a447]"></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <h4 className="font-serif text-2xl text-[#f2e8d5] mb-4">{MOCK_UPCOMING.room}</h4>
                       </div>
                       <span className="text-[9px] font-bold tracking-wider uppercase bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full">
                         {MOCK_UPCOMING.status}
                       </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar size={16} className="text-[#c9a447]"/> <span className="text-[#a68a61]">{MOCK_UPCOMING.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock size={16} className="text-[#c9a447]"/> <span className="text-[#a68a61]">{MOCK_UPCOMING.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <User size={16} className="text-[#c9a447]"/> <span className="text-[#a68a61]">{MOCK_UPCOMING.guests}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin size={16} className="text-[#c9a447]"/> <span className="text-[#a68a61]">{MOCK_UPCOMING.location}</span>
                      </div>
                    </div>

                    <button className="mt-4 border border-[#c9a447]/40 text-[#c9a447] font-semibold text-xs uppercase tracking-widest px-6 py-3 rounded hover:bg-[#c9a447]/10 transition-colors w-max">
                      CHI TIẾT ĐẶT BÀN
                    </button>
                  </div>
                </div>
              </div>

              {/* Hành trình trải nghiệm */}
              <div className="glass-panel-luxury p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none transform -scale-x-100">
                  <span className="text-4xl font-serif text-[#c9a447]">🌸</span>
                </div>
                <div className="absolute bottom-0 left-0 p-4 opacity-20 pointer-events-none">
                  <span className="text-4xl font-serif text-[#c9a447]">🌸</span>
                </div>

                <h3 className="section-title mb-8 flex items-center gap-2 text-sm justify-center"><Sparkles size={16}/> HÀNH TRÌNH TRẢI NGHIỆM</h3>
                
                <div className="flex items-center justify-between relative px-8 pb-4">
                  {/* Connecting Line */}
                  <div className="absolute top-[18px] left-[60px] right-[60px] h-[2px] bg-[#c9a447]/20 z-0"></div>
                  
                  {/* Progress Line */}
                  <div className="absolute top-[18px] left-[60px] right-[60px] h-[2px] bg-[#c9a447] z-0" style={{width: '100%'}}></div>

                  {/* Steps */}
                  {MOCK_JOURNEY.map((s, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                       <div className={`w-9 h-9 rounded-full flex items-center justify-center 
                          ${s.completed ? 'bg-[#c9a447] text-[#070503] shadow-[0_0_20px_rgba(201,164,71,0.5)]' : 'bg-[#15110d] border-2 border-[#c9a447]/30 text-[#8c7355]'}`}>
                         <CheckCircle2 size={20} />
                       </div>
                       <div className="text-center">
                         <div className={`text-xs font-semibold ${s.completed ? 'text-[#f2e8d5]' : 'text-[#8c7355]'}`}>{s.step}</div>
                         <div className="text-[11px] text-[#7a6040] mt-1">{s.date}</div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gợi ý dành riêng */}
              <div className="glass-panel-luxury p-6 rounded-2xl relative">
                <div className="absolute top-2 left-2 p-2 opacity-10 pointer-events-none">
                  <span className="text-3xl font-serif text-[#c9a447]">🌸</span>
                </div>
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="section-title flex items-center gap-2 text-sm"><Sparkles size={16}/> GỢI Ý DÀNH RIÊNG CHO BẠN</h3>
                  <button className="text-xs text-[#c9a447] hover:text-[#f2e8d5] flex items-center gap-1 transition-colors">Xem tất cả <ArrowRight size={12}/></button>
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

            {/* RIGHT COLUMN (4 cols) */}
            <div className="col-span-12 xl:col-span-4 space-y-6">
              
              {/* Ưu đãi của bạn */}
              <div className="glass-panel-luxury p-6 rounded-2xl relative">
                <div className="absolute top-2 left-2 p-2 opacity-10 pointer-events-none">
                  <span className="text-3xl font-serif text-[#c9a447]">🌸</span>
                </div>
                <div className="flex justify-between items-center mb-5 relative z-10">
                  <h3 className="section-title flex items-center gap-2 text-sm"><Ticket size={16}/> ƯU ĐÃI CỦA BẠN</h3>
                  <button className="text-[11px] text-[#c9a447] hover:text-[#f2e8d5] flex items-center gap-1 transition-colors">Xem tất cả <ArrowRight size={10}/></button>
                </div>
                
                <div className="voucher-ticket p-6 flex items-center shadow-[0_10px_30px_rgba(201,164,71,0.15)] relative z-10">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transform -scale-x-100">
                    <span className="text-6xl font-serif text-[#0e0a06]">🌸</span>
                  </div>
                  
                  <div className="flex-1 relative z-10">
                    <div className="text-[10px] font-bold text-[#0e0a06] uppercase tracking-widest flex items-center gap-1.5 mb-3">
                      <Star size={12} className="fill-[#0e0a06]"/> VIP GOLD VOUCHER
                    </div>
                    <div className="text-4xl font-serif text-[#0e0a06] font-bold tracking-tight mb-2">GIẢM 15%</div>
                    <div className="text-[11px] text-[#0e0a06]/80 font-semibold uppercase tracking-wider">Cho hóa đơn từ 2.000.000đ</div>
                  </div>
                  
                  <div className="voucher-divider mx-4 h-20 relative z-10"></div>
                  
                  <div className="flex flex-col justify-center text-right relative z-10 pl-2">
                    <div className="text-[10px] text-[#0e0a06]/70 uppercase tracking-wider mb-1 font-semibold">Hạn sử dụng:</div>
                    <div className="text-base font-bold text-[#0e0a06]">31/12/2026</div>
                  </div>
                </div>
              </div>

              {/* Hạng thành viên */}
              <div className="glass-panel-luxury p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="section-title text-sm">HẠNG THÀNH VIÊN</h3>
                  <div className="bg-[#c9a447]/10 text-[#c9a447] border border-[#c9a447]/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Star size={10} className="fill-[#c9a447]"/> Gold Member
                  </div>
                </div>

                <p className="text-sm text-[#a68a61] mb-4">Bạn còn <span className="text-[#f2e8d5] font-semibold">350 điểm nữa để</span> lên hạng Platinum</p>
                
                <div className="relative h-2 bg-[#15110d] rounded-full overflow-hidden mb-3 border border-[#c9a447]/20">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#7a6040] to-[#c9a447] w-[85%] rounded-full shadow-[0_0_10px_rgba(201,164,71,0.5)]"></div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-[#8c7355]">
                  <span>2.450 điểm</span>
                  <span>2.800 điểm</span>
                </div>
              </div>

              {/* AI Assistant Banner */}
              <div className="glass-panel-luxury p-6 rounded-2xl relative overflow-hidden group cursor-pointer border-[#c9a447]/20">
                {/* Background glow effects */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#c9a447]/20 blur-[40px] rounded-full group-hover:bg-[#c9a447]/30 transition-colors"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                
                <div className="relative z-10 flex flex-col items-start">
                  <h3 className="section-title text-sm mb-3 flex items-center gap-2">AI DINING ASSISTANT</h3>
                  <p className="text-sm text-[#a68a61] mb-6 pr-10">Để tôi gợi ý cho bạn trải nghiệm tuyệt vời nhất!</p>
                  
                  <button className="bg-gradient-to-r from-[#c9a447] to-[#b8953c] text-[#070503] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded shadow-[0_5px_15px_rgba(201,164,71,0.3)] group-hover:scale-105 transition-transform">
                    NHẬN GỢI Ý NGAY
                  </button>
                </div>
                
                {/* Decorative icon bottom right */}
                <div className="absolute bottom-4 right-4 opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500">
                  <div className="w-16 h-16 rounded-full border-2 border-[#c9a447]/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[#c9a447] blur-[15px] opacity-20 rounded-full"></div>
                    <span className="text-3xl text-[#c9a447]">🌸</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}

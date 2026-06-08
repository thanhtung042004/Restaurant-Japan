import React from 'react';
import { Facebook, Instagram, PhoneCall } from 'lucide-react';

export default function Footer() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer" className="bg-bg-2 border-t border-gold/10 pt-20 pb-10 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">

        {/* Brand Column */}
        <div className="flex flex-col">
          <div className="font-serif text-2xl tracking-[0.25em] text-gold mb-1">SAKURA</div>
          <div className="font-jp text-[9px] text-muted tracking-[0.4em] mb-6">桜 — 日本料理</div>
          <p className="text-xs text-muted leading-relaxed max-w-[240px] mb-6 font-light">
            Nhà hàng Nhật Bản cao cấp tại trung tâm TP.Da Nang. Trải nghiệm ẩm thực đích thực, không gian sang trọng và phục vụ chu đáo.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 border border-gold/10 flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-colors">
              <Facebook size={14} />
            </a>
            <a href="#" className="w-9 h-9 border border-gold/10 flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-colors">
              <Instagram size={14} />
            </a>
            <a href="#" className="w-9 h-9 border border-gold/10 flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-colors">
              <PhoneCall size={14} />
            </a>
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <div className="text-[10px] tracking-widest uppercase text-gold/60 mb-6 font-semibold">Khám Phá</div>
          <ul className="space-y-3.5 list-none">
            <li>
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="text-xs text-muted hover:text-cream transition-colors font-light">
                Giới Thiệu
              </a>
            </li>
            <li>
              <a href="#dishes" onClick={(e) => { e.preventDefault(); scrollToSection('dishes'); }} className="text-xs text-muted hover:text-cream transition-colors font-light">
                Món Đặc Trưng
              </a>
            </li>
            <li>
              <a href="#space" onClick={(e) => { e.preventDefault(); scrollToSection('space'); }} className="text-xs text-muted hover:text-cream transition-colors font-light">
                Không Gian
              </a>
            </li>
            <li>
              <a href="#menu" onClick={(e) => { e.preventDefault(); scrollToSection('menu'); }} className="text-xs text-muted hover:text-cream transition-colors font-light">
                Thực Đơn
              </a>
            </li>
            <li>
              <a href="#chef" onClick={(e) => { e.preventDefault(); scrollToSection('chef'); }} className="text-xs text-muted hover:text-cream transition-colors font-light">
                Bếp Trưởng
              </a>
            </li>
          </ul>
        </div>

        {/* Services Links */}
        <div>
          <div className="text-[10px] tracking-widest uppercase text-gold/60 mb-6 font-semibold">Dịch Vụ</div>
          <ul className="space-y-3.5 list-none">
            <li>
              <a href="#booking" onClick={(e) => { e.preventDefault(); scrollToSection('booking'); }} className="text-xs text-muted hover:text-cream transition-colors font-light">
                Đặt Bàn Trực Tuyến
              </a>
            </li>
            <li>
              <a href="#" className="text-xs text-muted hover:text-cream transition-colors font-light">
                Tiệc Riêng & Sự Kiện
              </a>
            </li>
            <li>
              <a href="#" className="text-xs text-muted hover:text-cream transition-colors font-light">
                Omakase Experience
              </a>
            </li>
            <li>
              <a href="#ai" onClick={(e) => { e.preventDefault(); scrollToSection('ai'); }} className="text-xs text-muted hover:text-cream transition-colors font-light">
                AI Gợi Ý Món Ăn
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Links */}
        <div className="space-y-4">
          <div className="text-[10px] tracking-widest uppercase text-gold/60 mb-2 font-semibold">Liên Hệ</div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider text-muted font-medium">Địa Chỉ</span>
            <span className="text-xs text-cream-dim font-light">k155/150 Trần Đình Nam, Hòa An, Cẩm Lệ, TP. Đà Nẵng</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider text-muted font-medium">Điện Thoại</span>
            <span className="text-xs text-cream-dim font-light">+84 0862688173</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider text-muted font-medium">Giờ Mở Cửa</span>
            <span className="text-xs text-cream-dim font-light">T2 - CN: 11:00 — 22:00</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider text-muted font-medium">Email</span>
            <span className="text-xs text-cream-dim font-light">thanhtung@gmail.com</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto h-[1px] bg-gold/10 my-8" />

      {/* Footer Bottom */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[11px] text-muted">
        <span>&copy; {new Date().getFullYear()} Sakura Restaurant. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-cream transition-colors">Chính Sách Bảo Mật</a>
          <a href="#" className="hover:text-cream transition-colors">Điều Khoản Dịch Vụ</a>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import spaceImg1 from '../assets/space_gallery.png';
import spaceImg2 from '../assets/hero_bg.png';
import spaceImg3 from '../assets/wagyu.png';

export default function SpaceGallery() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section id="space" className="bg-bg-2">
      {/* Intro */}
      <div className="max-w-6xl mx-auto py-20 lg:py-32 px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-4 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-gold/60 reveal">
            Không Gian
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight tracking-wide mb-6 reveal reveal-delay-1">
            <em className="font-serif font-light italic text-gold">Trải Nghiệm</em><br />Thượng Hạng
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-gold to-transparent mb-8 reveal reveal-delay-2" />
          <p className="text-sm text-cream-dim mb-6 leading-relaxed reveal reveal-delay-3">
            Sakura được thiết kế bởi kiến trúc sư hàng đầu Nhật Bản, kết hợp giữa vẻ đẹp truyền thống
            wabi-sabi và thiết kế hiện đại tối giản. Mỗi góc nhỏ của không gian đều được chăm chút tỉ mỉ,
            tạo nên một bầu không khí đặc trưng — thầm lặng, ấm áp và sang trọng.
          </p>
          <p className="text-sm text-cream-dim mb-8 leading-relaxed reveal reveal-delay-4">
            Hệ thống ba khu vực riêng biệt: Phòng chính cho trải nghiệm ăn uống thoải mái,
            quầy sushi để tận mắt tiếp xem bếp trưởng chế biến,
            và phòng VIP sang trọng dành cho những bữa tiệc riêng tư.
          </p>
          <button 
            onClick={() => scrollToSection('booking')}
            className="bg-gold text-bg px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-gold-light hover:shadow-[0_0_30px_rgba(201,164,71,0.4)] hover:-translate-y-0.5 transition-all duration-300 reveal reveal-delay-5"
          >
            Đặt Bàn VIP
          </button>
        </div>

        {/* Feature Image Showcase */}
        <div className="reveal reveal-delay-2">
          <div className="relative aspect-[4/3] overflow-hidden group">
            <img 
              src={spaceImg2} 
              alt="Không gian nhà hàng" 
              className="w-full h-full object-cover transition-transform duration-[8s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-2/50 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-bg">
        {/* Main Room - takes 2x2 cells in grid on lg screen */}
        <div className="relative group overflow-hidden aspect-[4/3] md:col-span-2 lg:row-span-2 lg:col-span-2 bg-bg-3 reveal">
          <img 
            src={spaceImg1} 
            alt="Phòng Ăn Chính" 
            className="w-full h-full object-cover transition-transform duration-700 ease-out brightness-90 saturate-[0.85] group-hover:scale-[1.03] group-hover:brightness-70 group-hover:saturate-100"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
            <span className="font-serif text-lg text-cream tracking-wider">Phòng Ăn Chính</span>
          </div>
        </div>

        {/* Sushi Bar */}
        <div className="relative group overflow-hidden aspect-square bg-bg-3 reveal reveal-delay-1">
          <img 
            src={spaceImg2} 
            alt="Quầy Sushi" 
            className="w-full h-full object-cover transition-transform duration-700 ease-out brightness-90 saturate-[0.85] group-hover:scale-[1.03] group-hover:brightness-70 group-hover:saturate-100"
            style={{ objectPosition: '70% center' }}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <span className="font-serif text-base text-cream tracking-wider">Quầy Sushi</span>
          </div>
        </div>

        {/* VIP Room */}
        <div className="relative group overflow-hidden aspect-square bg-bg-3 reveal reveal-delay-2">
          <img 
            src={spaceImg3} 
            alt="Phòng VIP" 
            className="w-full h-full object-cover transition-transform duration-700 ease-out brightness-90 saturate-[0.85] group-hover:scale-[1.03] group-hover:brightness-70 group-hover:saturate-100"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <span className="font-serif text-base text-cream tracking-wider">Phòng VIP</span>
          </div>
        </div>
      </div>
    </section>
  );
}

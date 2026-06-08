import React from 'react';
import { ArrowRight } from 'lucide-react';
import sushiDishImg from '../../assets/sushi_dish.png';
import wagyuImg from '../../assets/wagyu.png';

export default function SignatureDishes() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section id="dishes" className="relative py-20 lg:py-32 px-6 md:px-12 lg:px-24 bg-bg">
      <div className="max-w-6xl mx-auto flex flex-col">
        
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-4 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-gold/60 reveal">
              Món Đặc Trưng
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight tracking-wide reveal reveal-delay-1">
              Những <em className="font-serif font-light italic text-gold">Tác Phẩm</em><br />Ẩm Thực
            </h2>
            <p className="font-jp text-[10px] sm:text-xs text-muted tracking-[0.35em] uppercase mt-2 reveal reveal-delay-2">
              シグネチャーメニュー
            </p>
          </div>
          <button 
            onClick={() => scrollToSection('menu')}
            className="flex items-center gap-2 bg-transparent border border-cream/30 text-cream px-6 py-3 text-xs tracking-widest uppercase hover:border-cream hover:bg-cream/5 transition-all duration-300 reveal reveal-delay-2"
          >
            Xem Tất Cả
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature Card (Omakase Premium Set) - takes full width on md, and 2 cols on lg */}
          <div 
            onClick={() => scrollToSection('menu')}
            className="group relative md:col-span-2 aspect-[16/9] lg:aspect-[16/7] overflow-hidden bg-bg-3 cursor-pointer reveal"
          >
            <img 
              className="w-full h-full object-cover transition-all duration-[1s] ease-out brightness-[0.8] saturate-[0.9] group-hover:scale-[1.04] group-hover:brightness-[0.6] group-hover:saturate-[1.1]" 
              src={sushiDishImg} 
              alt="Omakase Premium Set" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-2/95 via-bg-2/30 to-transparent pointer-events-none transition-all duration-300 group-hover:via-bg-2/50" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <div className="font-jp text-[9px] sm:text-[10px] text-gold/60 tracking-[0.3em] uppercase mb-2 flex items-center gap-2 before:content-[''] before:w-4 before:h-[1px] before:bg-gold/60">
                    Thương Hiệu — Sakura Signature
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-cream group-hover:text-gold-light transition-colors">
                    Omakase Premium Set
                  </h3>
                  <p className="text-xs text-muted mt-2 leading-relaxed opacity-0 transform translate-y-2.5 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    Lý tưởng cho mọi dịp đặc biệt. Bộ 12 món được bếp trưởng lựa chọn theo mùa, từng món là một cuộc hành trình ẩm thực không ngờ.
                  </p>
                </div>
                <div className="md:text-right flex md:flex-col justify-between items-baseline md:items-end">
                  <div className="font-serif text-lg sm:text-2xl text-gold flex items-center gap-2">
                    850,000 <span className="font-sans text-[10px] text-muted font-light">VND / người</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wagyu A5 */}
          <div 
            onClick={() => scrollToSection('menu')}
            className="group relative aspect-[3/4] overflow-hidden bg-bg-3 cursor-pointer reveal reveal-delay-1"
          >
            <img 
              className="w-full h-full object-cover transition-all duration-[1s] ease-out brightness-[0.8] saturate-[0.9] group-hover:scale-[1.04] group-hover:brightness-[0.6] group-hover:saturate-[1.1]" 
              src={wagyuImg} 
              alt="Wagyu Teppanyaki A5" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-2/95 via-bg-2/30 to-transparent pointer-events-none transition-all duration-300 group-hover:via-bg-2/50" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className="font-jp text-[9px] text-gold/60 tracking-[0.3em] uppercase mb-2 flex items-center gap-2 before:content-[''] before:w-4 before:h-[1px] before:bg-gold/60">
                Teppanyaki
              </div>
              <h3 className="font-serif text-xl text-cream group-hover:text-gold-light transition-colors">
                Wagyu Teppanyaki A5
              </h3>
              <p className="text-xs text-muted mt-2 leading-relaxed opacity-0 transform translate-y-2.5 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                Thịt bò Wagyu hạng A5 nướng bàn sắt trước mặt, kèm sốt ponzu đặc biệt.
              </p>
              <div className="font-serif text-lg text-gold mt-3">
                450,000 <span className="font-sans text-[10px] text-muted font-light">VND</span>
              </div>
            </div>
          </div>

          {/* Sashimi */}
          <div 
            onClick={() => scrollToSection('menu')}
            className="group relative aspect-[3/4] overflow-hidden bg-gradient-to-tr from-[#150a04] via-[#0a0604] to-bg cursor-pointer reveal reveal-delay-1"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-bg-2/97 via-bg-2/40 to-transparent pointer-events-none transition-all duration-300 group-hover:via-bg-2/60" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className="font-jp text-[9px] text-gold/60 tracking-[0.3em] uppercase mb-2 flex items-center gap-2 before:content-[''] before:w-4 before:h-[1px] before:bg-gold/60">
                Sashimi
              </div>
              <h3 className="font-serif text-xl text-cream group-hover:text-gold-light transition-colors">
                Sashimi Thập Cẩm
              </h3>
              <p className="text-xs text-muted mt-2 leading-relaxed opacity-0 transform translate-y-2.5 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                Năm loại cá tươi ngon nhất — cá hồi, cá ngừ, tôm, mực và bạch tuộc, thái lát chính xác theo kỹ thuật Nhật.
              </p>
              <div className="font-serif text-lg text-gold mt-3">
                280,000 <span className="font-sans text-[10px] text-muted font-light">VND</span>
              </div>
            </div>
          </div>

          {/* Ramen */}
          <div 
            onClick={() => scrollToSection('menu')}
            className="group relative aspect-[3/4] overflow-hidden bg-gradient-to-tr from-[#2a1010] via-[#100606] to-bg cursor-pointer reveal reveal-delay-2"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-bg-2/97 via-bg-2/30 to-transparent pointer-events-none transition-all duration-300 group-hover:via-bg-2/50" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className="font-jp text-[9px] text-gold/60 tracking-[0.3em] uppercase mb-2 flex items-center gap-2 before:content-[''] before:w-4 before:h-[1px] before:bg-gold/60">
                Ramen
              </div>
              <h3 className="font-serif text-xl text-cream group-hover:text-gold-light transition-colors">
                Spicy Miso Ramen
              </h3>
              <p className="text-xs text-muted mt-2 leading-relaxed opacity-0 transform translate-y-2.5 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                Mì tương miso Hokkaido, hầm 12 giờ, nước dùng béo ngậy, cay vừa đúng vị.
              </p>
              <div className="font-serif text-lg text-gold mt-3">
                125,000 <span className="font-sans text-[10px] text-muted font-light">VND</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

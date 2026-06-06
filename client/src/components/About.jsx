import React, { useEffect, useRef } from 'react';
import spaceGallery from '../assets/space_gallery.png';

export default function About() {
  const cardsRef = useRef([]);

  useEffect(() => {
    // Hover glow effect on stats cards
    const cards = cardsRef.current;
    const handleMouseMove = (e, card) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(201,164,71,0.08) 0%, rgba(255, 255, 255, 0.03) 60%)`;
    };

    const handleMouseLeave = (card) => {
      card.style.background = 'rgba(255, 255, 255, 0.03)';
    };

    cards.forEach((card) => {
      if (!card) return;
      card.addEventListener('mousemove', (e) => handleMouseMove(e, card));
      card.addEventListener('mouseleave', () => handleMouseLeave(card));
    });

    return () => {
      cards.forEach((card) => {
        if (!card) return;
        card.removeEventListener('mousemove', (e) => handleMouseMove(e, card));
        card.removeEventListener('mouseleave', () => handleMouseLeave(card));
      });
    };
  }, []);

  return (
    <section id="about" className="relative py-20 lg:py-32 px-6 md:px-12 lg:px-24 bg-bg-2 overflow-hidden">
      {/* Background Japanese pattern decoration */}
      <div className="absolute right-6 lg:right-16 top-1/2 -translate-y-1/2 font-jp text-[6rem] lg:text-[8rem] font-extralight text-gold/[0.04] text-writing-vertical select-none pointer-events-none tracking-widest">
        桜和食
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        {/* Left text section */}
        <div className="flex flex-col">
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-4 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-gold/60 reveal">
            Về Chúng Tôi
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight tracking-wide mb-6 reveal reveal-delay-1">
            Nghệ Thuật <br />
            <em className="font-serif font-light italic text-gold">Omakase</em> Đích Thực
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-gold to-transparent mb-8 reveal reveal-delay-2" />
          <div className="font-serif text-lg sm:text-xl font-light italic text-gold border-l-2 border-gold pl-6 mb-8 leading-relaxed reveal reveal-delay-2">
            "Mỗi món ăn là một bức tranh, mỗi thực khách là một người nghệ sĩ."
          </div>
          <p className="text-sm text-cream-dim mb-6 leading-relaxed reveal reveal-delay-3">
            Sakura được thành lập với khát vọng mang đến trải nghiệm ẩm thực Nhật Bản
            chính thống và cao cấp nhất. Chúng tôi tin rằng ăn uống không chỉ là nhu cầu
            sinh tồn mà còn là nghệ thuật — nghệ thuật của sự chọn lựa nguyên liệu,
            kỹ thuật chế biến và sự trân trọng dành cho thực khách.
          </p>
          <p className="text-sm text-cream-dim mb-10 leading-relaxed reveal reveal-delay-4">
            Toàn bộ nguyên liệu được nhập khẩu trực tiếp từ Nhật Bản — cá hồi Hokkaido,
            wagyu Kobe, tương miso truyền thống — đảm bảo từng trải nghiệm vị giác là
            hành trình đến tâm hồn ẩm thực Nhật Bản.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-6 reveal reveal-delay-5">
            <div 
              ref={(el) => (cardsRef.current[0] = el)}
              className="border border-gold/10 p-6 bg-glass relative transition-all duration-300 before:content-[''] before:absolute before:top-0 before:left-0 before:w-[2px] before:h-full before:bg-gradient-to-b before:from-gold before:to-transparent"
            >
              <div className="font-serif text-3xl sm:text-4xl text-gold mb-2">15+</div>
              <div className="text-[10px] sm:text-xs text-muted tracking-wider uppercase">Năm Kinh Nghiệm</div>
            </div>
            <div 
              ref={(el) => (cardsRef.current[1] = el)}
              className="border border-gold/10 p-6 bg-glass relative transition-all duration-300 before:content-[''] before:absolute before:top-0 before:left-0 before:w-[2px] before:h-full before:bg-gradient-to-b before:from-gold before:to-transparent"
            >
              <div className="font-serif text-3xl sm:text-4xl text-gold mb-2">80+</div>
              <div className="text-[10px] sm:text-xs text-muted tracking-wider uppercase">Món Ăn Đặc Sắc</div>
            </div>
            <div 
              ref={(el) => (cardsRef.current[2] = el)}
              className="border border-gold/10 p-6 bg-glass relative transition-all duration-300 before:content-[''] before:absolute before:top-0 before:left-0 before:w-[2px] before:h-full before:bg-gradient-to-b before:from-gold before:to-transparent"
            >
              <div className="font-serif text-3xl sm:text-4xl text-gold mb-2">3</div>
              <div className="text-[10px] sm:text-xs text-muted tracking-wider uppercase">Sao Michelin</div>
            </div>
            <div 
              ref={(el) => (cardsRef.current[3] = el)}
              className="border border-gold/10 p-6 bg-glass relative transition-all duration-300 before:content-[''] before:absolute before:top-0 before:left-0 before:w-[2px] before:h-full before:bg-gradient-to-b before:from-gold before:to-transparent"
            >
              <div className="font-serif text-3xl sm:text-4xl text-gold mb-2">10K+</div>
              <div className="text-[10px] sm:text-xs text-muted tracking-wider uppercase">Thực Khách Hài Lòng</div>
            </div>
          </div>
        </div>

        {/* Right image section */}
        <div className="relative reveal">
          <div className="relative aspect-[3/4] overflow-hidden group">
            <img 
              src={spaceGallery} 
              alt="Không gian nhà hàng Sakura" 
              className="w-full h-full object-cover transition-transform duration-[8s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent pointer-events-none" />
          </div>
          {/* Badge */}
          <div className="absolute bottom-6 -right-4 md:-right-6 bg-wood border border-gold/10 p-5 md:p-6 backdrop-blur-md">
            <div className="font-serif text-base sm:text-lg text-gold font-normal">Omakase</div>
            <div className="text-[9px] sm:text-[10px] text-muted tracking-wider uppercase mt-1">Chef's Selection — Premium</div>
          </div>
        </div>
      </div>
    </section>
  );
}

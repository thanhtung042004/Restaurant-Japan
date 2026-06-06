import React, { useEffect, useRef } from 'react';
import heroBg from '../assets/hero_bg.png';
import { CalendarRange, Menu } from 'lucide-react';

export default function Hero() {
  const canvasRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    // Parallax scrolling effect
    const handleScroll = () => {
      if (bgRef.current) {
        const sy = window.scrollY;
        bgRef.current.style.transform = `scale(1) translateY(${sy * 0.25}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.speedY = -Math.random() * 0.3 - 0.05;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.life = 0;
        this.maxLife = Math.random() * 300 + 150;
        const isGold = Math.random() > 0.4;
        this.color = isGold ? `rgba(201,164,71,` : `rgba(242,232,213,`;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;
        const progress = this.life / this.maxLife;
        this.currentOpacity = this.opacity * Math.sin(progress * Math.PI);
        if (this.life >= this.maxLife) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.currentOpacity + ')';
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 8000);
      const targetCount = Math.min(count, 120);
      for (let i = 0; i < targetCount; i++) {
        const p = new Particle();
        p.life = Math.floor(Math.random() * p.maxLife);
        particles.push(p);
      }
    };
    initParticles();

    // Glow orbs
    const orbs = [
      { x: 0.2, y: 0.3, r: 200, color: 'rgba(201,164,71,' },
      { x: 0.8, y: 0.6, r: 160, color: 'rgba(92,21,21,' },
      { x: 0.5, y: 0.9, r: 250, color: 'rgba(42,26,8,' },
    ];

    const drawOrbs = () => {
      orbs.forEach((orb) => {
        const grad = ctx.createRadialGradient(
          orb.x * canvas.width,
          orb.y * canvas.height,
          0,
          orb.x * canvas.width,
          orb.y * canvas.height,
          orb.r
        );
        grad.addColorStop(0, orb.color + '0.04)');
        grad.addColorStop(1, orb.color + '0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x * canvas.width, orb.y * canvas.height, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    let orbAngle = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      orbAngle += 0.003;
      orbs[0].x = 0.2 + Math.sin(orbAngle) * 0.05;
      orbs[1].x = 0.8 + Math.cos(orbAngle * 0.7) * 0.04;
      drawOrbs();
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      <div 
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-[1.03] z-0"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          backgroundPosition: 'center 40%'
        }}
      />
      {/* Gradients */}
      <div className="absolute inset-0 bg-hero-gradient z-0" />
      <div className="absolute inset-0 bg-side-gradient z-0" />

      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 text-center max-w-3xl px-6 flex flex-col items-center">
        <div className="inline-block font-jp text-[10px] sm:text-xs text-gold/60 tracking-[0.5em] uppercase mb-6 relative px-5 after:content-[''] after:absolute after:top-1/2 after:left-full after:w-10 after:h-[1px] after:bg-gold/60 before:content-[''] before:absolute before:top-1/2 before:right-full before:w-10 before:h-[1px] before:bg-gold/60">
          Nhà Hàng Nhật Bản Cao Cấp — Từ Năm 2018
        </div>
        <h1 className="font-serif text-5xl sm:text-7xl lg:text-[7rem] font-light leading-[1.05] tracking-wide text-cream mb-4 select-none">
          <span className="block translate-y-full opacity-0 animate-fade-up">Tinh Hoa</span>
          <span className="block translate-y-full opacity-0 animate-fade-up [animation-delay:0.15s]">
            <em className="font-serif font-light italic text-gold">Ẩm Thực</em> Nhật
          </span>
        </h1>
        <p className="font-jp text-xs sm:text-base text-muted tracking-[0.4em] mb-4 uppercase select-none">
          日本の味、心を込めて
        </p>
        <p className="text-xs sm:text-sm text-cream-dim max-w-lg mb-8 leading-relaxed font-light select-none">
          Trải nghiệm ẩm thực Nhật Bản đích thực — nơi mỗi món ăn là một tác phẩm nghệ thuật,
          được tạo ra với sự tinh tế, tâm huyết và nguyên liệu thượng hạng.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => scrollToSection('booking')}
            className="flex items-center gap-2.5 bg-gold text-bg px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-gold-light hover:shadow-[0_0_30px_rgba(201,164,71,0.4)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
          >
            <CalendarRange size={14} />
            Đặt Bàn Ngay
          </button>
          <button 
            onClick={() => scrollToSection('menu')}
            className="flex items-center gap-2.5 bg-transparent border border-cream/30 text-cream px-8 py-4 text-xs tracking-widest uppercase hover:border-cream-dim hover:bg-cream/5 transition-all duration-300"
          >
            <Menu size={14} />
            Xem Thực Đơn
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => scrollToSection('about')}>
        <span className="text-[10px] text-muted tracking-[0.25em] uppercase">Khám Phá</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold/60 to-transparent animate-[pulse_2s_ease-in-out_infinite]" />
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenLogin }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    if (location.pathname !== '/') {
      // If not on homepage, navigate to homepage first, then scroll
      e.preventDefault();
      navigate(`/#${targetId}`);
    } else {
      // On homepage, scroll smoothly
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        setIsMobileMenuOpen(false);
      }
    }
  };

  const dashboardPath = user?.role === 'customer' ? '/dashboard' : '/dashboard';

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 md:px-12 transition-all duration-500 ${
        isScrolled 
          ? 'bg-bg/85 backdrop-blur-md border-b border-glass-border' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* Logo */}
      <Link to="/" className="flex flex-col select-none">
        <span className="font-serif text-xl tracking-[0.25em] text-gold font-normal">SAKURA</span>
        <span className="font-jp text-[8px] text-muted tracking-[0.4em] font-light">桜 — 日本料理</span>
      </Link>

      {/* Desktop Links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        <li>
          <a 
            href="#about" 
            onClick={(e) => handleNavClick(e, 'about')}
            className="text-[11px] font-normal tracking-[0.15em] uppercase text-cream-dim hover:text-gold transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
          >
            Giới Thiệu
          </a>
        </li>
        <li>
          <a 
            href="#dishes" 
            onClick={(e) => handleNavClick(e, 'dishes')}
            className="text-[11px] font-normal tracking-[0.15em] uppercase text-cream-dim hover:text-gold transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
          >
            Món Đặc Trưng
          </a>
        </li>
        <li>
          <a 
            href="#space" 
            onClick={(e) => handleNavClick(e, 'space')}
            className="text-[11px] font-normal tracking-[0.15em] uppercase text-cream-dim hover:text-gold transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
          >
            Không Gian
          </a>
        </li>
        <li>
          <a 
            href="#menu" 
            onClick={(e) => handleNavClick(e, 'menu')}
            className="text-[11px] font-normal tracking-[0.15em] uppercase text-cream-dim hover:text-gold transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
          >
            Thực Đơn
          </a>
        </li>
        <li>
          <a 
            href="#chef" 
            onClick={(e) => handleNavClick(e, 'chef')}
            className="text-[11px] font-normal tracking-[0.15em] uppercase text-cream-dim hover:text-gold transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
          >
            Bếp Trưởng
          </a>
        </li>
      </ul>

      {/* Auth Actions */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <>
            <Link 
              to="/dashboard"
              className="flex items-center gap-2 border border-glass-border px-5 py-2 text-[11px] tracking-wider uppercase text-gold hover:bg-gold/5 hover:border-gold hover:shadow-[0_0_15px_rgba(201,164,71,0.15)] transition-all duration-300"
            >
              <LayoutDashboard size={13} />
              Dashboard ({user.name})
            </Link>
            <button 
              onClick={onLogout}
              className="text-cream-dim hover:text-wine-light transition-colors p-2"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <button 
            onClick={onOpenLogin}
            className="border border-glass-border px-6 py-2.5 text-[11px] tracking-[0.15em] uppercase text-gold hover:bg-gold/8 hover:border-gold hover:shadow-[0_0_15px_rgba(201,164,71,0.15)] transition-all duration-300"
          >
            Đăng Nhập
          </button>
        )}
      </div>

      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden text-gold p-2"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-bg-2 border-b border-glass-border flex flex-col p-6 space-y-4 md:hidden shadow-lg">
          <a 
            href="#about" 
            onClick={(e) => handleNavClick(e, 'about')}
            className="text-xs tracking-wider uppercase text-cream-dim py-2"
          >
            Giới Thiệu
          </a>
          <a 
            href="#dishes" 
            onClick={(e) => handleNavClick(e, 'dishes')}
            className="text-xs tracking-wider uppercase text-cream-dim py-2"
          >
            Món Đặc Trưng
          </a>
          <a 
            href="#space" 
            onClick={(e) => handleNavClick(e, 'space')}
            className="text-xs tracking-wider uppercase text-cream-dim py-2"
          >
            Không Gian
          </a>
          <a 
            href="#menu" 
            onClick={(e) => handleNavClick(e, 'menu')}
            className="text-xs tracking-wider uppercase text-cream-dim py-2"
          >
            Thực Đơn
          </a>
          <a 
            href="#chef" 
            onClick={(e) => handleNavClick(e, 'chef')}
            className="text-xs tracking-wider uppercase text-cream-dim py-2"
          >
            Bếp Trưởng
          </a>
          
          <div className="pt-4 border-t border-gold/10 flex flex-col gap-3">
            {user ? (
              <>
                <Link 
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 border border-gold/40 px-5 py-2.5 text-xs text-gold"
                >
                  <LayoutDashboard size={14} />
                  Dashboard ({user.name})
                </Link>
                <button 
                  onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 border border-wine/40 px-5 py-2.5 text-xs text-wine-light"
                >
                  <LogOut size={14} />
                  Đăng Xuất
                </button>
              </>
            ) : (
              <button 
                onClick={() => { onOpenLogin(); setIsMobileMenuOpen(false); }}
                className="border border-gold px-5 py-2.5 text-xs text-gold uppercase tracking-wider text-center"
              >
                Đăng Nhập
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogOut, Shield, ChevronRight } from 'lucide-react';

export default function DashboardLayout({ user, onLogout, children }) {
  const navigate = useNavigate();

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Quan Tri Vien';
      case 'receptionist': return 'Le Tan';
      case 'waiter': return 'Phuc Vu Table';
      case 'chef': return 'Bep Truong';
      default: return 'Nhan Vien';
    }
  };

  return (
    <div className="min-h-screen bg-bg text-cream flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gold/10 bg-bg-2 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="flex flex-col">
          {/* Brand Logo */}
          <div className="h-20 border-b border-gold/10 flex items-center px-6">
            <Link to="/" className="flex flex-col select-none">
              <span className="font-serif text-lg tracking-[0.2em] text-gold font-normal">SAKURA</span>
              <span className="font-jp text-[7px] text-muted tracking-[0.3em] font-light">桜 — KHACH DOAN</span>
            </Link>
          </div>

          {/* User Details */}
          <div className="p-6 border-b border-gold/10 bg-glass/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-gold/30 bg-wood flex items-center justify-center font-serif text-gold text-lg select-none">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-cream truncate max-w-[140px]">{user.name}</span>
                <span className="text-[9px] text-gold tracking-wider uppercase mt-0.5 flex items-center gap-1 font-medium">
                  <Shield size={9} />
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            <Link 
              to="/" 
              className="flex items-center justify-between px-4 py-3 text-xs tracking-wider uppercase text-cream-dim hover:text-gold hover:bg-gold/5 transition-all"
            >
              <span className="flex items-center gap-3">
                <Home size={13} />
                Trang Chu
              </span>
              <ChevronRight size={10} className="opacity-30" />
            </Link>
          </nav>
        </div>

        {/* Logout Bottom */}
        <div className="p-4 border-t border-gold/10">
          <button 
            onClick={() => { onLogout(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 border border-wine/40 px-4 py-2.5 text-xs text-wine-light hover:bg-wine/5 hover:border-wine/80 hover:text-wine-light transition-all uppercase tracking-wider"
          >
            <LogOut size={12} />
            Dang Xuat
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-20 border-b border-gold/10 flex items-center justify-between px-6 md:px-8 bg-bg-2 shrink-0">
          <h1 className="font-serif text-lg tracking-wider uppercase text-gold">
            He Thong Quan Ly Sakura
          </h1>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-gold/10 border border-gold/20 text-gold px-3 py-1 uppercase tracking-widest font-medium">
              Vận Hành
            </span>
            <button 
              onClick={() => { onLogout(); navigate('/'); }}
              className="text-cream-dim hover:text-wine-light transition-colors md:hidden p-2"
              title="Dang xuat"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-bg">
          {children}
        </main>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const QUICK_USERS = [
  { name: 'Admin', email: 'admin@sakura-japan.com', password: 'admin123', role: 'admin' },
  { name: 'Lễ Tân', email: 'letan@sakura-japan.com', password: 'letan123', role: 'receptionist' },
  { name: 'Phục Vụ', email: 'phucvu@sakura-japan.com', password: 'phucvu123', role: 'waiter' },
  { name: 'Đầu Bếp', email: 'bep@sakura-japan.com', password: 'bep123', role: 'chef' },
  { name: 'Khách Hàng', email: 'khach@gmail.com', password: 'khach123', role: 'customer' },
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        if (!name || !phone || !email || !password) {
          toast.error('Vui lòng điền đầy đủ thông tin');
          setLoading(false);
          return;
        }
        const res = await authAPI.register({ name, email, password, phone });
        if (res.success) {
          toast.success('Đăng ký tài khoản thành công');
          setIsRegister(false);
        }
      } else {
        if (!email || !password) {
          toast.error('Vui lòng điền email và mật khẩu');
          setLoading(false);
          return;
        }
        const res = await authAPI.login({ email, password });
        if (res.success) {
          toast.success(`Chào mừng quay trở lại, ${res.data.name}`);
          onLoginSuccess(res.data.token, res.data);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Hành động thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (preset) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email: preset.email, password: preset.password });
      if (res.success) {
        toast.success(`Đăng nhập nhanh: ${preset.name}`);
        onLoginSuccess(res.data.token, res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Đăng nhập nhanh thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-8 rounded-none border border-gold/20 bg-bg-2 shadow-2xl glass-panel">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-cream-dim hover:text-gold transition-colors text-lg"
          aria-label="Đóng modal"
        >
          &times;
        </button>

        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl tracking-[0.1em] text-gold uppercase">
            {isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
          </h2>
          <p className="font-jp text-[10px] text-muted tracking-[0.2em] mt-1">
            SAKURA — RESTAURANT
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-[10px] tracking-wider uppercase text-muted mb-1">Họ và Tên</label>
                <input 
                  type="text" 
                  className="w-full bg-bg/30 border border-gold/10 text-cream px-4 py-2 text-sm outline-none focus:border-gold/50 focus:bg-gold/5 transition-all"
                  placeholder="Nguyen Van A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-wider uppercase text-muted mb-1">Số Điện Thoại</label>
                <input 
                  type="tel" 
                  className="w-full bg-bg/30 border border-gold/10 text-cream px-4 py-2 text-sm outline-none focus:border-gold/50 focus:bg-gold/5 transition-all"
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] tracking-wider uppercase text-muted mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-bg/30 border border-gold/10 text-cream px-4 py-2 text-sm outline-none focus:border-gold/50 focus:bg-gold/5 transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-wider uppercase text-muted mb-1">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full bg-bg/30 border border-gold/10 text-cream px-4 py-2 text-sm outline-none focus:border-gold/50 focus:bg-gold/5 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-transparent border border-gold text-gold py-3 text-xs tracking-widest uppercase hover:bg-gold hover:text-bg hover:shadow-[0_0_20px_rgba(201,164,71,0.2)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : (isRegister ? 'Đăng Ký' : 'Đăng Nhập')}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-4">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-cream-dim hover:text-gold transition-colors underline underline-offset-4"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký ở đây'}
          </button>
        </div>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-6 border-t border-gold/10">
          <p className="block text-[10px] tracking-wider uppercase text-center text-muted mb-3">
            Đăng nhập nhanh cho demo (Vai trò)
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_USERS.map((preset) => (
              <button 
                key={preset.role}
                onClick={() => handleQuickLogin(preset)}
                disabled={loading}
                className="px-3 py-1.5 bg-bg border border-gold/10 text-[11px] text-cream-dim hover:text-gold hover:border-gold/40 transition-colors"
              >
                {preset.name} ({preset.role})
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

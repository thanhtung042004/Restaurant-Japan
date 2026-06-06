import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Calendar, Clock, Users, FileText, Send, Sparkles, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { reservationAPI, aiAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CustomerPortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('bookings');
  const [reservations, setReservations] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await reservationAPI.getReservations();
      if (res.success) {
        setReservations(res.data);
      }
    } catch (err) {
      toast.error('Khong the tai thong tin dat ban: ' + err.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const res = await aiAPI.getChatHistory('food_suggestion');
      if (res.success) {
        // Reverse logs to show chronological order
        const formatted = res.data.reverse().reduce((acc, log) => {
          acc.push({ role: 'user', text: log.question });
          acc.push({ role: 'ai', text: log.answer });
          return acc;
        }, []);
        setChatHistory(formatted.length > 0 ? formatted : [
          { role: 'ai', text: 'Xin chao! Toi la tro ly AI cua Sakura. Toi da san sang goi y mon ngon phu hop cho ban.' }
        ]);
      }
    } catch (err) {
      console.error('Khong the tai lich su chat:', err.message);
    }
  };

  useEffect(() => {
    loadBookings();
    loadChatHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Ban co chac chan muon huy dat ban nay?')) return;
    try {
      const res = await reservationAPI.cancel(id);
      if (res.success) {
        toast.success('Huy dat ban thanh cong');
        loadBookings();
      }
    } catch (err) {
      toast.error(err.message || 'Khong the huy dat ban');
    }
  };

  const handleSendChat = async () => {
    const msgText = input.trim();
    if (!msgText) return;

    setChatHistory(prev => [...prev, { role: 'user', text: msgText }]);
    setInput('');
    setChatLoading(true);

    try {
      const res = await aiAPI.getFoodSuggestion(msgText);
      if (res.success) {
        setChatHistory(prev => [...prev, { role: 'ai', text: res.data.answer }]);
      }
    } catch (err) {
      toast.error(err.message || 'Huy chat that bai');
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Co loi xay ra trong khi ket noi AI.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'confirmed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted/10 text-muted border-muted/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Cho xac nhan';
      case 'confirmed': return 'Da xac nhan';
      case 'completed': return 'Hoan thanh';
      case 'cancelled': return 'Da huy';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen animate-fade-up bg-bg text-cream flex flex-col">
      {/* Top Header */}
      <header className="h-20 border-b border-gold/10 flex items-center justify-between px-6 md:px-12 bg-bg-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="font-serif text-lg tracking-[0.2em] text-gold font-normal"
          >
            SAKURA
          </button>
          <span className="h-4 w-[1px] bg-gold/20" />
          <span className="text-xs text-cream-dim font-light">Cong Thuc Khach Hang</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-wood border border-gold/20 flex items-center justify-center font-serif text-gold text-sm select-none">
              {user.name.charAt(0)}
            </div>
            <span className="text-xs text-cream-dim hidden sm:inline">{user.name}</span>
          </div>
          <button 
            onClick={() => { onLogout(); navigate('/'); }}
            className="text-cream-dim hover:text-wine-light transition-colors p-2"
            title="Dang xuat"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:py-10 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 md:flex-initial text-left px-5 py-3 text-xs tracking-wider uppercase border transition-all duration-300 ${
              activeTab === 'bookings'
                ? 'border-gold text-gold bg-gold/[0.02]'
                : 'border-gold/10 text-muted hover:text-cream'
            }`}
          >
            Lich Su Dat Ban
          </button>
          <button
            onClick={() => setActiveTab('ai-advisor')}
            className={`flex-1 md:flex-initial text-left px-5 py-3 text-xs tracking-wider uppercase border transition-all duration-300 ${
              activeTab === 'ai-advisor'
                ? 'border-gold text-gold bg-gold/[0.02]'
                : 'border-gold/10 text-muted hover:text-cream'
            }`}
          >
            Tu Van Am Thuc AI
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 glass-panel-luxury p-6 md:p-8 min-h-[480px]">
          
          {/* BOOKINGS PANEL */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gold/10">
                <h2 className="font-serif text-xl text-gold glow-text">Lich Su Dat Ban Cua Ban</h2>
                <button 
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="bg-gold text-bg text-[10px] tracking-wider uppercase px-4 py-2 font-semibold hover:bg-gold-light transition-all"
                >
                  Tao Dat Ban Moi
                </button>
              </div>

              {loadingBookings ? (
                <div className="py-20 text-center text-xs text-muted uppercase tracking-wider">
                  Dang tai danh sach dat ban...
                </div>
              ) : reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((res) => (
                    <div 
                      key={res._id}
                      className="glass-panel-luxury p-5 flex flex-col md:flex-row justify-between md:items-center gap-6 bg-glass/20 hover:bg-glass/40 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2 py-0.5 border text-[9px] uppercase tracking-wider font-medium ${getStatusStyle(res.status)}`}>
                            {getStatusLabel(res.status)}
                          </span>
                          <span className="text-[10px] text-muted">Ma: {res._id.substring(18)}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
                          <span className="text-xs text-cream-dim flex items-center gap-1.5 font-light">
                            <Calendar size={12} className="text-gold" />
                            {new Date(res.reservationDate).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="text-xs text-cream-dim flex items-center gap-1.5 font-light">
                            <Clock size={12} className="text-gold" />
                            {res.reservationTime}
                          </span>
                          <span className="text-xs text-cream-dim flex items-center gap-1.5 font-light">
                            <Users size={12} className="text-gold" />
                            {res.numberOfGuests} nguoi
                          </span>
                        </div>

                        {res.table && (
                          <div className="text-[10px] text-gold tracking-wide">
                            Ban an duoc giep: {res.table.tableNumber} (Khu: {res.table.area})
                          </div>
                        )}

                        {res.note && (
                          <p className="text-[11px] text-muted leading-relaxed font-light">
                            Ghi chu: {res.note}
                          </p>
                        )}
                      </div>

                      {/* Cancel Action */}
                      {['pending', 'confirmed'].includes(res.status) && (
                        <button 
                          onClick={() => handleCancelBooking(res._id)}
                          className="border border-wine/40 text-wine-light hover:bg-wine/5 hover:border-wine/80 px-4 py-2 text-[10px] uppercase tracking-wider text-center transition-all md:self-center"
                        >
                          Huy Dat Ban
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-muted uppercase tracking-wider">
                  Ban chua co lich dat ban nao
                </div>
              )}
            </div>
          )}

          {/* AI ADVISOR PANEL */}
          {activeTab === 'ai-advisor' && (
            <div className="flex flex-col h-[520px] justify-between">
              
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gold/10 shrink-0">
                <Sparkles size={14} className="text-gold animate-pulse" />
                <h2 className="font-serif text-lg text-gold glow-text">Tu Van Am Thuc Chuyen Sau</h2>
              </div>

              {/* Chat area */}
              <div className="flex-1 overflow-y-auto my-4 pr-2 space-y-4 no-scrollbar">
                {chatHistory.map((msg, index) => (
                  <div 
                    key={index}
                    className={`max-w-[85%] p-3.5 text-xs leading-relaxed whitespace-pre-line border rounded-none ${
                      msg.role === 'user' 
                        ? 'self-end ml-auto bg-gold/10 border-gold/20 text-cream'
                        : 'self-start mr-auto bg-white/[0.01] border-gold/10 text-cream-dim'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                {chatLoading && (
                  <div className="max-w-[85%] p-4 bg-white/[0.01] border border-gold/10 mr-auto flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Bar */}
              <div className="flex items-center gap-3 pt-4 border-t border-gold/10 shrink-0">
                <input 
                  type="text" 
                  placeholder="Nhap cau hoi ve thuc don hoac khau vi cua ban..."
                  className="flex-1 bg-transparent border-none outline-none text-xs text-cream placeholder-muted"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  disabled={chatLoading}
                />
                <button 
                  onClick={handleSendChat}
                  disabled={chatLoading}
                  className="w-8 h-8 bg-gold hover:bg-gold-light text-bg flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send size={12} />
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

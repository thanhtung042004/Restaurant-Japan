import React, { useState } from 'react';
import { Send, Sparkles, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiAPI } from '../services/api';

export default function AIAssistantDashboard() {
  const [aiChat, setAiChat] = useState([
    { role: 'ai', text: 'Xin chao! Toi la tro ly tu van Sakura AI. Toi co the giup gi cho ban hom nay?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleSend = async () => {
    const questionText = aiInput.trim();
    if (!questionText) return;

    setAiChat(prev => [...prev, { role: 'user', text: questionText }]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await aiAPI.getBusinessAnalysis(questionText);
      if (res.success) {
        setAiChat(prev => [...prev, { role: 'ai', text: res.data.answer }]);
      }
    } catch (err) {
      toast.error('Loi ket noi den Sakura AI.');
      setAiChat(prev => [...prev, { role: 'ai', text: 'Khong the thuc hien phan tich do loi he thong.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 animate-fade-up">
      {/* Sidebar Insights */}
      <div className="w-full lg:w-1/3 space-y-6 flex flex-col">
        <div className="glass-panel-luxury p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center bg-gold/10">
              <Sparkles size={18} className="text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-gold tracking-widest uppercase">Sakura AI</h2>
              <p className="text-[10px] text-cream-dim tracking-wider uppercase">He thong phan tich thong minh</p>
            </div>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            AI Assistant giup ban phan tich doanh thu, goi y mon an, du doan luong khach va toi uu hoa nhan su trong ca truc.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="glass-panel p-4 flex flex-col justify-center items-center gap-2 text-center hover:border-gold/40 transition-colors cursor-pointer" onClick={() => setAiInput('Hay phan tich doanh thu hom nay')}>
            <TrendingUp size={20} className="text-gold mb-1" />
            <span className="text-[10px] uppercase text-cream tracking-wider">Doanh thu nay</span>
          </div>
          <div className="glass-panel p-4 flex flex-col justify-center items-center gap-2 text-center hover:border-gold/40 transition-colors cursor-pointer" onClick={() => setAiInput('Mon an nao ban chay nhat?')}>
            <div className="w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center text-[10px] text-gold">M</div>
            <span className="text-[10px] uppercase text-cream tracking-wider">Mon ban chay</span>
          </div>
          <div className="glass-panel p-4 flex flex-col justify-center items-center gap-2 text-center hover:border-gold/40 transition-colors cursor-pointer" onClick={() => setAiInput('Du doan khach toi nay')}>
            <Users size={20} className="text-gold mb-1" />
            <span className="text-[10px] uppercase text-cream tracking-wider">Du doan khach</span>
          </div>
          <div className="glass-panel p-4 flex flex-col justify-center items-center gap-2 text-center hover:border-gold/40 transition-colors cursor-pointer" onClick={() => setAiInput('Goi y nhan su ca toi')}>
            <Sparkles size={20} className="text-gold mb-1" />
            <span className="text-[10px] uppercase text-cream tracking-wider">Toi uu nhan su</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-full lg:w-2/3 glass-panel-luxury p-0 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 particles-bg opacity-30 pointer-events-none" />
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gold/10 bg-bg-2/50 backdrop-blur-sm z-10">
          <h3 className="font-serif text-sm text-gold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Truc tuyen
          </h3>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 no-scrollbar">
          {aiChat.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                msg.role === 'user' 
                  ? 'bg-gold/10 border border-gold/30 text-cream rounded-tr-none shadow-[0_0_15px_rgba(201,164,71,0.1)]' 
                  : 'bg-glass/10 border border-gold/10 text-cream-dim rounded-tl-none shadow-lg'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-2xl rounded-tl-none bg-glass/10 border border-gold/10 flex gap-2 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gold/10 bg-bg-2/50 backdrop-blur-sm z-10">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhap cau hoi cua ban..."
              className="w-full bg-bg/80 border border-gold/20 rounded-full px-6 py-3.5 text-xs text-cream outline-none focus:border-gold/60 focus:shadow-[0_0_10px_rgba(201,164,71,0.2)] transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={aiLoading}
              className="absolute right-2 w-10 h-10 rounded-full bg-gold hover:bg-gold-light text-bg flex items-center justify-center transition-all disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, TrendingUp, Users, Bot, RefreshCw, Coffee, Utensils, BarChart3, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiAPI } from '../../../api';

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: 'Phân tích doanh thu', q: 'Hãy phân tích doanh thu và xu hướng hiện tại của nhà hàng.' },
  { icon: Utensils, label: 'Món bán chạy', q: 'Món ăn nào đang bán chạy nhất? Hãy đưa ra gợi ý để tối ưu thực đơn.' },
  { icon: Users, label: 'Dự đoán khách', q: 'Dự đoán lượng khách hôm nay dựa trên xu hướng và đưa ra lời khuyên nhân sự.' },
  { icon: Clock, label: 'Giờ cao điểm', q: 'Phân tích giờ cao điểm và gợi ý cách chuẩn bị tốt nhất.' },
  { icon: Coffee, label: 'Tối ưu vận hành', q: 'Đề xuất cách tối ưu hóa quy trình vận hành nhà hàng để giảm chi phí và tăng hiệu quả.' },
  { icon: BarChart3, label: 'Báo cáo tháng', q: 'Đánh giá hiệu suất kinh doanh tháng này và đề xuất chiến lược cho tháng tới.' },
];

export default function AIAssistantDashboard({ user }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Xin chào! Tôi là **Sakura AI** — trợ lý thông minh của nhà hàng.\n\nTôi có thể giúp bạn:\n• Phân tích doanh thu & xu hướng\n• Gợi ý tối ưu thực đơn\n• Dự đoán lượng khách & nhân sự\n• Tư vấn vận hành nhà hàng\n\nHãy đặt câu hỏi hoặc chọn gợi ý bên dưới! 🌸` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;
    
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);

    try {
      // Determine if it's a food/menu question or business analysis
      const isFoodQ = /món|ăn|sushi|ramen|sashimi|saba|thực đơn|nguyên liệu|recipe|food/i.test(q);
      const res = isFoodQ
        ? await aiAPI.getFoodSuggestion(q)
        : await aiAPI.getBusinessAnalysis(q);
      
      if (res.success) {
        setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Xin lỗi, không thể kết nối với Sakura AI lúc này. Vui lòng thử lại sau.' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'ai', text: 'Cuộc trò chuyện đã được làm mới. Tôi có thể giúp gì cho bạn? 🌸' }]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-5 animate-fade-up">
      
      {/* ── Left: Quick Actions Panel ── */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        {/* AI Card */}
        <div className="glass-panel-luxury p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-wood flex items-center justify-center">
                <Bot size={18} className="text-bg" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-bg-2" />
            </div>
            <div>
              <h2 className="font-serif text-base text-gold tracking-wider">Sakura AI</h2>
              <p className="text-[9px] text-green-400 tracking-widest uppercase">Đang hoạt động</p>
            </div>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Trợ lý AI thông minh hỗ trợ phân tích kinh doanh, tư vấn vận hành và dự báo xu hướng nhà hàng.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
            Gemini AI · Phân tích thực tế
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel-luxury p-4 flex-1">
          <div className="text-[9px] text-muted uppercase tracking-widest mb-3">Gợi ý nhanh</div>
          <div className="space-y-1.5">
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => handleSend(p.q)} disabled={loading}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gold/10 text-left hover:border-gold/30 hover:bg-gold/5 transition-all group disabled:opacity-50">
                <p.icon size={12} className="text-gold shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-cream-dim group-hover:text-cream">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clear chat */}
        <button onClick={clearChat} className="btn-ghost flex items-center justify-center gap-1.5 text-[11px]">
          <RefreshCw size={11} /> Làm mới chat
        </button>
      </div>

      {/* ── Right: Chat Area ── */}
      <div className="flex-1 glass-panel-luxury flex flex-col overflow-hidden min-h-0">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-gold/10 bg-gradient-to-r from-bg-2 to-wood/10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-gold" />
            <span className="font-serif text-sm text-gold tracking-wider">Hỏi Đáp Thông Minh</span>
          </div>
          <span className="text-[9px] text-muted">{messages.length - 1} tin nhắn</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar min-h-0">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/30 to-wood/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={13} className="text-gold" />
                </div>
              )}
              <div className={`max-w-[78%] px-4 py-3 text-xs leading-relaxed rounded-2xl whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-gold/12 border border-gold/25 text-cream rounded-tr-sm'
                  : 'bg-wood/25 border border-gold/10 text-cream-dim rounded-tl-sm'
              }`}>
                {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-wood to-bg-3 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5 font-serif text-gold text-sm">
                  {user?.name?.charAt(0) || 'M'}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/30 to-wood/60 flex items-center justify-center shrink-0">
                <Bot size={13} className="text-gold" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-wood/25 border border-gold/10 flex gap-1.5 items-center">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gold/10 bg-bg-2/50 shrink-0">
          <div className="flex items-center gap-2 bg-bg/60 border border-gold/15 rounded-full px-4 py-2 focus-within:border-gold/40 transition-all">
            <input
              className="flex-1 bg-transparent outline-none text-xs text-cream placeholder-muted"
              placeholder="Đặt câu hỏi về kinh doanh, thực đơn, vận hành..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()}
              className="w-7 h-7 rounded-full bg-gold hover:bg-gold-light text-bg flex items-center justify-center transition-all disabled:opacity-40 shrink-0">
              <Send size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

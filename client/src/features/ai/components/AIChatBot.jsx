import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Send, Sparkles, MessageSquare } from 'lucide-react';
import { aiAPI } from '../../../api';

const PRESETS = [
  'Tôi thích ăn cay và muốn thử mì',
  'Gợi ý món chay ăn kèm nước sữa',
  'Tư vấn món sushi bán chạy',
  'Món bò Wagyu nào ngon và bao nhiêu xiên',
];

export default function AIChatBot({ user, onOpenLogin }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Xin chào! Tôi là trợ lý AI của Sakura. Bạn muốn thử món gì tối nay? Hãy kể tôi nghe sở thích của bạn (ví dụ: cay, chay, không hải sản...).',
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input.trim();
    if (!messageText) return;

    if (!user) {
      toast.error('Vui lòng đăng nhập để trò chuyện cùng AI');
      onOpenLogin();
      return;
    }

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: messageText }]);
    if (!textToSend) setInput('');
    setTyping(true);

    try {
      const res = await aiAPI.getFoodSuggestion(messageText);
      if (res.success) {
        setMessages((prev) => [...prev, { role: 'ai', text: res.data.answer }]);
      }
    } catch (err) {
      toast.error(err.message || 'Không thể gửi tin nhắn');
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Xin lỗi, hệ thống AI gặp sự cố. Vui lòng thử lại sau.' },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <section id="ai" className="relative py-20 lg:py-32 px-6 md:px-12 lg:px-24 bg-bg-2 overflow-hidden">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        
        {/* Left Column - Intro */}
        <div className="flex flex-col">
          <div className="inline-block self-start bg-gold/10 border border-gold/20 px-4 py-1.5 text-[9px] tracking-[0.25em] uppercase text-gold mb-6 reveal">
            Trợ Lý AI
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight tracking-wide mb-6 reveal reveal-delay-1">
            AI <em className="font-serif font-light italic text-gold">Hỗ Trợ</em><br />Gợi Ý Món Ăn
          </h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-gold to-transparent mb-8 reveal reveal-delay-2" />
          <p className="text-sm text-cream-dim mb-6 leading-relaxed reveal reveal-delay-3 font-light">
            Hệ thống AI thông minh của Sakura giúp bạn lựa chọn món ăn phù hợp nhất với
            khẩu vị, sở thích ăn uống và dịp đặc biệt của bạn — nhanh chóng, chính xác
            và cá nhân hóa.
          </p>
          <p className="text-sm text-cream-dim mb-8 leading-relaxed reveal reveal-delay-4 font-light">
            Chỉ cần mô tả sở thích, AI sẽ đề xuất các món ăn phù hợp, kết hợp
            với rượu sake tương thích và gợi ý kinh nghiệm ẩm thực trọn vẹn.
          </p>

          <div className="space-y-4 mb-8 reveal reveal-delay-5">
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5" />
              <span className="text-xs text-cream-dim leading-relaxed font-light">Gợi ý món ăn theo khẩu vị cá nhân (cay, ngọt, hải sản, chay...)</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5" />
              <span className="text-xs text-cream-dim leading-relaxed font-light">Kết hợp món ăn với rượu sake và trà Nhật phù hợp</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5" />
              <span className="text-xs text-cream-dim leading-relaxed font-light">Hỗ trợ đặt bàn và xem thực đơn thông minh</span>
            </div>
          </div>
        </div>

        {/* Right Column - Chat Widget */}
        <div className="bg-glass border border-gold/10 p-6 md:p-8 backdrop-blur-md relative overflow-hidden flex flex-col h-[480px] justify-between reveal reveal-delay-2">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          
          {/* Chat Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gold/10">
            <div className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_#c9a447] animate-pulse" />
            <span className="text-[11px] font-medium text-cream-dim tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles size={11} className="text-gold" />
              Sakura AI — Trợ Lý Ẩm Thực
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto my-4 pr-2 space-y-4 no-scrollbar">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`max-w-[85%] p-3.5 text-xs leading-relaxed whitespace-pre-line rounded-none border ${
                  msg.role === 'user' 
                    ? 'self-end ml-auto bg-gold/10 border-gold/20 text-cream'
                    : 'self-start mr-auto bg-white/[0.02] border-gold/10 text-cream-dim'
                }`}
              >
                {msg.text}
              </div>
            ))}
            
            {typing && (
              <div className="max-w-[85%] p-4 bg-white/[0.02] border border-gold/10 mr-auto flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Preset Buttons (only show when last message is from AI and we aren't typing) */}
          {!typing && messages[messages.length - 1]?.role === 'ai' && (
            <div className="mb-4">
              <p className="text-[9px] uppercase tracking-wider text-muted mb-2 font-medium flex items-center gap-1">
                <MessageSquare size={9} /> Gợi ý yêu cầu:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSend(preset)}
                    className="px-2.5 py-1.5 bg-bg border border-gold/5 text-[10px] text-cream-dim hover:text-gold hover:border-gold/20 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-center gap-3 pt-4 border-t border-gold/10">
            <input 
              type="text" 
              placeholder={user ? "Nhập sở thích món ăn của bạn..." : "Đăng nhập để trò chuyện..."}
              className="flex-1 bg-transparent border-none outline-none text-xs text-cream placeholder-muted"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={!user || typing}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!user || typing}
              className="w-8 h-8 bg-gold hover:bg-gold-light text-bg flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_10px_rgba(201,164,71,0.2)]"
            >
              <Send size={12} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

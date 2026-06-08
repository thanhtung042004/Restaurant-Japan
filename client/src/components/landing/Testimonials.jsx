import React from 'react';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    text: '"Trải nghiệm omakase tại Sakura là một trong những bữa ăn đẹp nhất trong cuộc đời tôi. Bếp trưởng Yamamoto có khả năng biến nguyên liệu thành nghệ thuật."',
    author: 'Trần Minh Hòa',
    title: 'Food Blogger — Saigon Gastronomy'
  },
  {
    text: '"Không gian đẹp, món ăn tuyệt vời, phục vụ chu đáo. Chúng tôi đặt bàn sinh nhật tại đây và mọi thứ đều vượt ngoài mong đợi. Sẽ quay lại!"',
    author: 'Nguyễn Phương Linh',
    title: 'Marketing Director, HCM City'
  },
  {
    text: '"Wagyu Teppanyaki ở đây là tốt nhất tôi từng thử tại Việt Nam. Giá trị xứng đáng. Sakura là đỉnh cao của ẩm thực Nhật Bản tại Sài Gòn."',
    author: 'David Chen',
    title: 'CEO, Asia Pacific Ventures'
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 lg:py-32 px-6 md:px-12 lg:px-24 bg-bg text-center">
      <div className="max-w-6xl mx-auto">
        <div className="text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-4 flex items-center justify-center gap-4 reveal">
          Đánh Giá
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight tracking-wide mb-12 reveal reveal-delay-1">
          Khách Hàng <em className="font-serif font-light italic text-gold">Nói Gì</em>
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((rev, index) => (
            <div 
              key={index}
              className="bg-glass border border-gold/10 p-8 text-left transition-all duration-300 hover:border-gold/30 reveal"
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              {/* Gold Stars */}
              <div className="flex gap-1 mb-6 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill="currentColor" stroke="none" />
                ))}
              </div>

              <p className="font-serif text-base text-cream-dim leading-relaxed mb-6 italic">
                {rev.text}
              </p>

              <div className="text-xs text-muted tracking-wider">
                <strong className="text-cream block font-normal mb-1">{rev.author}</strong>
                {rev.title}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

import React from 'react';

export default function ChefPhilosophy() {
  return (
    <section id="chef" className="relative py-20 lg:py-32 px-6 md:px-12 lg:px-24 bg-bg-2 text-center overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Kanji 匠 (Takumi - Craftsman) */}
        <span className="font-jp text-[4rem] text-gold opacity-30 mb-8 select-none pointer-events-none">
          匠
        </span>
        
        <blockquote className="font-serif text-xl sm:text-3xl font-light italic text-cream leading-relaxed mb-6 reveal">
          "Nấu ăn không chỉ là kỹ thuật — <br />
          đó là <em className="font-serif font-light italic text-gold">nghệ thuật</em> truyền đạt cảm xúc <br />
          qua từng vị giác, hương vị và hình thức."
        </blockquote>
        
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent my-8 reveal reveal-delay-1" />
        
        <p className="text-sm text-cream-dim leading-relaxed mb-10 reveal reveal-delay-2 max-w-2xl">
          Bếp trưởng Yamamoto Kenji — với hơn 20 năm kinh nghiệm tại các nhà hàng Michelin-star ở Tokyo và Osaka — 
          là linh hồn của Sakura. Ông đã học nghề từ những bậc thầy omakase vĩ đại nhất Nhật Bản, 
          rồi đưa toàn bộ tinh hoa đó vào từng món ăn tại Sakura, kết hợp với nguyên liệu địa phương 
          để tạo nên phong cách riêng biệt — vừa quen, vừa lạ.
        </p>

        {/* Profile Details */}
        <div className="flex items-center gap-4 reveal reveal-delay-3 justify-center mb-16">
          <div className="w-14 h-14 rounded-full border-2 border-glass-border bg-wood flex items-center justify-center font-jp text-lg text-gold font-normal">
            山
          </div>
          <div className="text-left">
            <div className="font-serif text-base text-cream">Yamamoto Kenji</div>
            <div className="text-[10px] text-muted tracking-wider uppercase">Head Chef — 20 years Michelin experience</div>
          </div>
        </div>

      </div>

      {/* Philosophy Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="bg-glass border border-gold/10 p-8 text-center transition-all duration-300 hover:border-gold/30 hover:bg-glass-hover reveal">
          <span className="font-jp text-3xl text-gold mb-4 block select-none pointer-events-none">旬</span>
          <h3 className="font-serif text-lg text-cream mb-3">Nguyên Liệu Theo Mùa</h3>
          <p className="text-xs text-muted leading-relaxed">
            Mỗi món ăn được xây dựng quanh nguyên liệu tươi nhất theo mùa, nhập khẩu trực tiếp từ Nhật Bản mỗi tuần.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-glass border border-gold/10 p-8 text-center transition-all duration-300 hover:border-gold/30 hover:bg-glass-hover reveal reveal-delay-1">
          <span className="font-jp text-3xl text-gold mb-4 block select-none pointer-events-none">技</span>
          <h3 className="font-serif text-lg text-cream mb-3">Kỹ Thuật Chính Xác</h3>
          <p className="text-xs text-muted leading-relaxed">
            Từ cách thái sashimi đến nhiệt độ nướng teppanyaki — mọi chi tiết được thực hiện chính xác đến từng milimet.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-glass border border-gold/10 p-8 text-center transition-all duration-300 hover:border-gold/30 hover:bg-glass-hover reveal reveal-delay-2">
          <span className="font-jp text-3xl text-gold mb-4 block select-none pointer-events-none">心</span>
          <h3 className="font-serif text-lg text-cream mb-3">Tâm Huyết & Sự Trân Trọng</h3>
          <p className="text-xs text-muted leading-relaxed">
            Mỗi thực khách là một vị khách quý. Chúng tôi trao gửi vào đó sự trân trọng và tâm huyết của toàn bộ ekip.
          </p>
        </div>

      </div>
    </section>
  );
}

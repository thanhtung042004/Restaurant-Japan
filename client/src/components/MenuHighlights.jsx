import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { menuAPI, categoryAPI } from '../services/api';

const FALLBACK_CATEGORIES = [
  { _id: 'sushi_sashimi', name: 'Sushi & Sashimi' },
  { _id: 'ramen', name: 'Ramen' },
  { _id: 'teppanyaki', name: 'Teppanyaki' },
  { _id: 'bento', name: 'Bento' },
  { _id: 'drinks', name: 'Đồ Uống' },
];

const FALLBACK_ITEMS = {
  'sushi_sashimi': [
    { name: 'Sushi Cá Hồi', price: 85000, description: 'Cá hồi Na Uy tươi, đặt trên viên cơm dẻo, kèm wasabi và gừng', isBestSeller: true, isAvailable: true },
    { name: 'Sashimi Thập Cẩm 5 Loại', price: 280000, description: 'Năm loại cá tươi - cá hồi, cá ngừ, tôm, mực, bạch tuộc', isBestSeller: true, isAvailable: true },
    { name: 'Sushi Bọc Lửa Cá Hồi Cay', price: 95000, description: 'Cá hồi cuộn spicy mayo, nướng phun lửa thơm ngon, cay vừa', spicyLevel: 2, isAvailable: true },
    { name: 'Sashimi Cá Hồi', price: 120000, description: 'Cá hồi Na Uy thái lát mỏng, kèm nước tương và wasabi nguyên chất', isBestSeller: true, isAvailable: true },
    { name: 'Sushi Chay Rau Củ', price: 55000, description: 'Rau củ tươi cuộn cơm nori, phù hợp cho người ăn chay', isVegetarian: true, isAvailable: true },
    { name: 'Omakase Premium', price: 850000, description: '12 món bếp trưởng lựa chọn, trải nghiệm đích thực — đặt trước 24h', isBestSeller: true, isAvailable: true },
  ],
  'ramen': [
    { name: 'Tonkotsu Ramen', price: 110000, description: 'Nước hầm xương lợn 12 giờ, béo ngậy, kèm trứng tiềm, thịt ba chỉ', isBestSeller: true, isAvailable: true },
    { name: 'Spicy Miso Ramen', price: 125000, description: 'Tương miso nướng Hokkaido, cay nồng đậm đà, kèm thịt bò', spicyLevel: 3, isBestSeller: true, isAvailable: true },
    { name: 'Shoyu Ramen', price: 100000, description: 'Nước tương nhẹ, trong sáng, vị thanh truyền thống Tokyo', isAvailable: true },
    { name: 'Seafood Ramen', price: 135000, description: 'Mì hải sản nhiều thành phần, nước dashi vị umami đặc trưng', containsSeafood: true, isAvailable: true },
  ],
  'teppanyaki': [
    { name: 'Wagyu A5 Teppanyaki', price: 450000, description: 'Bò Wagyu hạng A5, nướng bàn sắt, giữ nước ngọt tự nhiên — thượng đỉnh của nướng', isBestSeller: true, isAvailable: true },
    { name: 'Hải Sản Hỗn Hợp', price: 380000, description: 'Tôm, mực, sò điệp nướng bàn sắt, kèm sốt ponzu tươi ngon', containsSeafood: true, isAvailable: true },
    { name: 'Gà Cay Nhật Bản', price: 170000, description: 'Gà nướng bàn sắt sốt cay đặc biệt, thơm béo đúng vị', spicyLevel: 2, isAvailable: true },
  ],
  'bento': [
    { name: 'Bento Gà Teriyaki', price: 130000, description: 'Cơm hộp gà nướng sốt teriyaki ngọt béo, kèm rau trộn và súp miso', isBestSeller: true, isAvailable: true },
    { name: 'Bento Bò Wagyu', price: 220000, description: 'Thịt bò Wagyu nướng tự nhiên, đặt trên cơm nóng, kèm rau mùa', isBestSeller: true, isAvailable: true },
    { name: 'Bento Cá Hồi Nướng', price: 165000, description: 'Cá hồi phi lê nướng vàng hồng, cơm dẻo và rau mùa tươi', containsSeafood: true, isAvailable: true },
    { name: 'Bento Chay Nhật Bản', price: 100000, description: 'Cơm hộp chay đa dạng: đậu phụ, rau củ, vừng — phù hợp người ăn chay', isVegetarian: true, isAvailable: true },
  ],
  'drinks': [
    { name: 'Sake Junmai Daiginjo', price: 120000, description: 'Rượu sake thượng hạng Nhật Bản, hương thơm tinh tế, uống ấm hoặc lạnh', isBestSeller: true, isAvailable: true },
    { name: 'Trà Xanh Matcha', price: 45000, description: 'Matcha nguyên chất truyền thống Nhật Bản, pha thủ công', isAvailable: true },
    { name: 'Bia Sapporo', price: 55000, description: 'Bia Nhật Bản thương hiệu Sapporo, vị dịu nhẹ đặc trưng', isAvailable: true },
    { name: 'Nước Cam Ép Tươi', price: 40000, description: 'Cam tươi ép nguyên chất, không thêm đường', isAvailable: true },
  ]
};

export default function MenuHighlights() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const catRes = await categoryAPI.getCategories();
        const menuRes = await menuAPI.getItems({ limit: 100 });
        
        if (catRes.success && catRes.data.length > 0) {
          setCategories(catRes.data);
          setMenuItems(menuRes.data);
          setActiveTab(catRes.data[0]._id);
          setIsFallback(false);
        } else {
          loadFallback();
        }
      } catch (err) {
        console.error('Không thể tải dữ liệu menu thực tế, sử dụng fallback:', err.message);
        loadFallback();
      } finally {
        setLoading(false);
      }
    };

    const loadFallback = () => {
      setCategories(FALLBACK_CATEGORIES);
      setActiveTab(FALLBACK_CATEGORIES[0]._id);
      setIsFallback(true);
    };

    loadMenuData();
  }, []);

  const getFilteredItems = () => {
    if (isFallback) {
      return FALLBACK_ITEMS[activeTab] || [];
    }
    // Filter active items from DB by active category ID
    return menuItems.filter(item => {
      const itemCatId = typeof item.category === 'object' ? item.category?._id : item.category;
      return itemCatId === activeTab;
    });
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-muted tracking-wider uppercase mt-4">Đang tải thực đơn...</p>
      </div>
    );
  }

  const displayedItems = getFilteredItems();

  return (
    <section id="menu" className="relative py-20 lg:py-32 px-6 md:px-12 lg:px-24 bg-bg">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <div className="text-[10px] tracking-[0.4em] uppercase text-gold/60 mb-4 flex items-center gap-4 before:content-[''] before:w-8 before:h-[1px] before:bg-gold/60 reveal">
            Thực Đơn
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight tracking-wide reveal reveal-delay-1">
            Món <em className="font-serif font-light italic text-gold">Chọn Lọc</em>
          </h2>
          <p className="font-jp text-[10px] sm:text-xs text-muted tracking-[0.35em] uppercase mt-2 reveal reveal-delay-2">
            おすすめメニュー
          </p>
        </div>

        {/* Categories Tabs */}
        <div className="flex border-b border-glass-border mb-10 overflow-x-auto no-scrollbar reveal">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveTab(cat._id)}
              className={`px-6 py-4 text-[11px] tracking-widest uppercase border-b-2 whitespace-nowrap transition-all duration-300 font-medium ${
                activeTab === cat._id
                  ? 'text-gold border-gold bg-gold/[0.02]'
                  : 'text-muted border-transparent hover:text-cream'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-glass-border reveal">
          {displayedItems.length > 0 ? (
            displayedItems.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedItem(item)}
                className="bg-bg p-6 sm:p-8 flex justify-between items-start gap-6 hover:bg-glass transition-colors duration-300 group cursor-pointer"
              >
                <div className="flex-1">
                  <h3 className="font-serif text-base sm:text-lg text-cream group-hover:text-gold transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted mt-2 leading-relaxed">
                    {item.description}
                  </p>
                  {/* Food badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.isVegetarian && (
                      <span className="px-2 py-0.5 border border-gold/20 text-[9px] uppercase tracking-wider text-gold-light bg-gold/[0.04]">
                        Chay
                      </span>
                    )}
                    {item.containsSeafood && (
                      <span className="px-2 py-0.5 border border-gold/20 text-[9px] uppercase tracking-wider text-gold-light bg-gold/[0.04]">
                        Hải Sản
                      </span>
                    )}
                    {item.spicyLevel > 0 && (
                      <span className="px-2 py-0.5 border border-wine/20 text-[9px] uppercase tracking-wider text-wine-light bg-wine/[0.04]">
                        Cay {item.spicyLevel}/3
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="font-serif text-sm sm:text-base text-gold font-normal">
                    {item.price.toLocaleString('vi-VN')} VND
                  </span>
                  
                  {/* Availability Badge */}
                  {!item.isAvailable ? (
                    <span className="text-[9px] tracking-wider uppercase text-cream-dim bg-wine px-2 py-0.5 font-light">
                      Tạm Hết
                    </span>
                  ) : item.isBestSeller ? (
                    <span className="text-[9px] tracking-wider uppercase text-bg bg-gold px-2 py-0.5 font-medium">
                      Bán Chạy
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-16 text-center text-xs text-muted uppercase tracking-wider bg-bg">
              Không có món ăn nào trong danh mục này
            </div>
          )}
        </div>

      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="relative w-full max-w-lg p-8 border border-gold/20 bg-bg-2 shadow-2xl glass-panel" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-cream-dim hover:text-gold transition-colors text-lg"
            >
              &times;
            </button>
            <div className="text-center mb-6">
              <h3 className="font-serif text-2xl text-gold mb-2">{selectedItem.name}</h3>
              <p className="font-serif text-lg text-cream-dim">{selectedItem.price.toLocaleString('vi-VN')} VND</p>
            </div>
            
            <div className="space-y-4 text-sm text-muted leading-relaxed">
              <p>{selectedItem.description}</p>
              
              {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                <div>
                  <strong className="text-gold uppercase text-[10px] tracking-wider block mb-1">Thành phần:</strong>
                  <span>{selectedItem.ingredients.join(', ')}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4">
                {selectedItem.isVegetarian && (
                  <span className="px-3 py-1 border border-gold/20 text-[10px] uppercase tracking-wider text-gold-light bg-gold/[0.04]">
                    Món Chay
                  </span>
                )}
                {selectedItem.containsSeafood && (
                  <span className="px-3 py-1 border border-gold/20 text-[10px] uppercase tracking-wider text-gold-light bg-gold/[0.04]">
                    Có Hải Sản
                  </span>
                )}
                {selectedItem.spicyLevel > 0 && (
                  <span className="px-3 py-1 border border-wine/20 text-[10px] uppercase tracking-wider text-wine-light bg-wine/[0.04]">
                    Độ cay: {selectedItem.spicyLevel}/3
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

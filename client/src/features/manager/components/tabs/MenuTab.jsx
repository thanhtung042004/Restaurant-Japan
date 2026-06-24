import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { menuAPI, categoryAPI } from '../../../../api';

export default function MenuTab() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editMenuItem, setEditMenuItem] = useState(null);
  
  // Form State
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuDesc, setMenuDesc] = useState('');
  const [menuCat, setMenuCat] = useState('');
  const [menuIngredients, setMenuIngredients] = useState('');
  const [menuSpicy, setMenuSpicy] = useState('0');
  const [menuSeafood, setMenuSeafood] = useState(false);
  const [menuVegetarian, setMenuVegetarian] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        menuAPI.getItems({ limit: 100 }),
        categoryAPI.getCategories()
      ]);
      if (menuRes.success) setMenuItems(menuRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) { toast.error('Lỗi tải dữ liệu: ' + err.message); }
  };

  const clearMenuForm = () => {
    setMenuName(''); setMenuPrice(''); setMenuDesc(''); 
    setMenuCat(categories[0]?._id || ''); setMenuIngredients(''); 
    setMenuSpicy('0'); setMenuSeafood(false); setMenuVegetarian(false); 
  };

  const handleEditClick = (item) => {
    setEditMenuItem(item); setMenuName(item.name); setMenuPrice(item.price); setMenuDesc(item.description);
    setMenuCat(typeof item.category === 'object' ? item.category?._id : item.category);
    setMenuIngredients(item.ingredients?.join(', ') || ''); setMenuSpicy(String(item.spicyLevel));
    setMenuSeafood(item.containsSeafood); setMenuVegetarian(item.isVegetarian); setShowMenuForm(true);
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', menuName); fd.append('price', menuPrice); fd.append('description', menuDesc);
      fd.append('category', menuCat); fd.append('ingredients', menuIngredients); fd.append('spicyLevel', menuSpicy);
      fd.append('containsSeafood', menuSeafood); fd.append('isVegetarian', menuVegetarian);
      const res = editMenuItem ? await menuAPI.updateItem(editMenuItem._id, fd) : await menuAPI.createItem(fd);
      if (res.success) { 
        toast.success(editMenuItem ? 'Cập nhật thành công' : 'Tạo món mới thành công'); 
        setShowMenuForm(false); setEditMenuItem(null); clearMenuForm(); loadData(); 
      }
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteMenu = async (id) => {
    if (!confirm('Xóa món ăn này?')) return;
    try { const res = await menuAPI.deleteItem(id); if (res.success) { toast.success('Đã xóa'); loadData(); } } catch (err) { toast.error(err.message); }
  };

  const handleToggleMenu = async (id) => {
    try { const res = await menuAPI.toggleAvailability(id); if (res.success) { toast.success(res.message); loadData(); } } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex justify-between items-center">
        <h3 className="section-title">Quản Lý Thực Đơn <span className="text-muted/60 normal-case text-xs ml-2">({menuItems.length} món)</span></h3>
        <button onClick={() => { setEditMenuItem(null); clearMenuForm(); setShowMenuForm(true); }} className="btn-gold flex items-center gap-1.5">
          <Plus size={12} /> Thêm Món
        </button>
      </div>

      {showMenuForm && (
        <form onSubmit={handleMenuSubmit} className="glass-panel-luxury p-6 space-y-4">
          <h4 className="section-title">{editMenuItem ? 'Chỉnh sửa món' : 'Thêm món mới'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="luxury-label">Tên món</label><input className="luxury-input" value={menuName} onChange={e => setMenuName(e.target.value)} required /></div>
            <div><label className="luxury-label">Giá (₫)</label><input type="number" className="luxury-input" value={menuPrice} onChange={e => setMenuPrice(e.target.value)} required /></div>
            <div><label className="luxury-label">Danh mục</label>
              <select className="luxury-input luxury-select" value={menuCat} onChange={e => setMenuCat(e.target.value)} required>
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="luxury-label">Mô tả</label><textarea className="luxury-input" rows={2} value={menuDesc} onChange={e => setMenuDesc(e.target.value)} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="luxury-label">Thành phần (phân cách bằng dấu phẩy)</label><input className="luxury-input" placeholder="cá hồi, cơm, nori..." value={menuIngredients} onChange={e => setMenuIngredients(e.target.value)} /></div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-xs text-cream-dim cursor-pointer">
                <input type="checkbox" checked={menuSeafood} onChange={e => setMenuSeafood(e.target.checked)} className="accent-gold" /> Hải sản
              </label>
              <label className="flex items-center gap-2 text-xs text-cream-dim cursor-pointer">
                <input type="checkbox" checked={menuVegetarian} onChange={e => setMenuVegetarian(e.target.checked)} className="accent-gold" /> Món chay
              </label>
              <div><label className="luxury-label">Độ cay</label>
                <select className="luxury-input luxury-select w-20" value={menuSpicy} onChange={e => setMenuSpicy(e.target.value)}>
                  {['0','1','2','3'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => { setShowMenuForm(false); setEditMenuItem(null); }} className="btn-ghost">Hủy</button>
            <button type="submit" className="btn-gold">Lưu món</button>
          </div>
        </form>
      )}

      <div className="glass-panel-luxury overflow-hidden">
        <table className="luxury-table">
          <thead><tr><th>Tên món</th><th>Danh mục</th><th>Giá</th><th>Thành phần</th><th className="text-center">Trạng thái</th><th className="text-right">Thao tác</th></tr></thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item._id}>
                <td><span className="font-serif text-cream">{item.name}</span></td>
                <td><span className="text-muted">{item.category?.name || 'Khác'}</span></td>
                <td><span className="text-gold font-serif">{item.price?.toLocaleString('vi-VN')} ₫</span></td>
                <td><span className="text-muted text-[11px] truncate max-w-[160px] block">{item.ingredients?.join(', ') || '—'}</span></td>
                <td className="text-center">
                  <button onClick={() => handleToggleMenu(item._id)} className={`status-badge cursor-pointer ${item.isAvailable ? 'status-ready' : 'status-occupied'}`}>
                    {item.isAvailable ? '● Đang bán' : '○ Tạm hết'}
                  </button>
                </td>
                <td className="text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => handleEditClick(item)} className="w-7 h-7 rounded border border-gold/15 text-muted hover:text-gold hover:border-gold/30 flex items-center justify-center transition-all"><Edit size={12} /></button>
                    <button onClick={() => handleDeleteMenu(item._id)} className="w-7 h-7 rounded border border-wine/15 text-muted hover:text-red-400 hover:border-wine/30 flex items-center justify-center transition-all"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

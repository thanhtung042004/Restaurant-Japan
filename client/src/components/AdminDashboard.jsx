import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Utensils, Table as TableIcon, Users as UsersIcon, 
  Plus, Edit, Trash2, ToggleLeft, ToggleRight, Sparkles, Send 
} from 'lucide-react';
import { invoiceAPI, menuAPI, tableAPI, categoryAPI, aiAPI, authAPI, userAPI } from '../services/api';

const COLORS = ['#c9a447', '#e8c87a', '#8b2020', '#3d2510', '#b8a888'];

export default function AdminDashboard() {
  const [subTab, setSubTab] = useState('users');

  // Stats Data
  const [summary, setSummary] = useState(null);
  const [dailyRev, setDailyRev] = useState([]);
  const [monthlyRev, setMonthlyRev] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [peakHours, setPeakHours] = useState([]);

  // CRUD Data
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  // User Form States
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('waiter');
  
  // AI Consultant
  const [aiChat, setAiChat] = useState([
    { role: 'ai', text: 'Xin chao! Toi la tro ly tu van doanh nghiep Sakura. Hay dat cau hoi ve doanh thu, mon an chay/man ban chay, hoac khung gio cao diem de toi phan tich.' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Form states
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editMenuItem, setEditMenuItem] = useState(null);
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuDesc, setMenuDesc] = useState('');
  const [menuCat, setMenuCat] = useState('');
  const [menuIngredients, setMenuIngredients] = useState('');
  const [menuSpicy, setMenuSpicy] = useState('0');
  const [menuSeafood, setMenuSeafood] = useState(false);
  const [menuVegetarian, setMenuVegetarian] = useState(false);

  // Table form states
  const [showTableForm, setShowTableForm] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [tableCapacity, setTableCapacity] = useState('4');
  const [tableArea, setTableArea] = useState('Tang 1');
  const [tableDesc, setTableDesc] = useState('');

  const loadStats = async () => {
    try {
      const [sumRes, dailyRes, monthlyRes, topRes, peakRes] = await Promise.all([
        invoiceAPI.getStatistics(),
        invoiceAPI.getDailyRevenue(),
        invoiceAPI.getMonthlyRevenue(),
        invoiceAPI.getTopItems(),
        invoiceAPI.getPeakHours()
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (dailyRes.success) setDailyRev(dailyRes.data);
      if (monthlyRes.success) setMonthlyRev(monthlyRes.data);
      if (topRes.success) setTopItems(topRes.data);
      if (peakRes.success) setPeakHours(peakRes.data);
    } catch (err) {
      toast.error('Loi tai du lieu bao cao: ' + err.message);
    }
  };

  const loadCRUDData = async () => {
    try {
      const [menuRes, catRes, tableRes, userRes, invoiceRes] = await Promise.all([
        menuAPI.getItems({ limit: 100 }),
        categoryAPI.getCategories(),
        tableAPI.getTables(),
        userAPI.getUsers({ limit: 100 }),
        invoiceAPI.getInvoices({ limit: 100 })
      ]);
      if (menuRes.success) setMenuItems(menuRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (tableRes.success) setTables(tableRes.data);
      if (userRes.success) setUsers(userRes.data);
      if (invoiceRes.success) setInvoices(invoiceRes.data);
    } catch (err) {
      toast.error('Loi tai danh sach thong tin CRUD: ' + err.message);
    }
  };

  useEffect(() => {
    loadStats();
    loadCRUDData();
  }, []);

  // Menu CRUD actions
  const handleToggleMenuAvailability = async (id) => {
    try {
      const res = await menuAPI.toggleAvailability(id);
      if (res.success) {
        toast.success(res.message);
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Ban co chac chan muon xoa mon an nay?')) return;
    try {
      const res = await menuAPI.deleteItem(id);
      if (res.success) {
        toast.success('Xoa mon an thanh cong');
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', menuName);
      formData.append('price', menuPrice);
      formData.append('description', menuDesc);
      formData.append('category', menuCat);
      formData.append('ingredients', menuIngredients);
      formData.append('spicyLevel', menuSpicy);
      formData.append('containsSeafood', menuSeafood);
      formData.append('isVegetarian', menuVegetarian);

      let res;
      if (editMenuItem) {
        res = await menuAPI.updateItem(editMenuItem._id, formData);
        toast.success('Cap nhat mon an thanh cong');
      } else {
        res = await menuAPI.createItem(formData);
        toast.success('Tao mon an moi thanh cong');
      }

      if (res.success) {
        setShowMenuForm(false);
        setEditMenuItem(null);
        clearMenuForm();
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const clearMenuForm = () => {
    setMenuName('');
    setMenuPrice('');
    setMenuDesc('');
    setMenuCat(categories[0]?._id || '');
    setMenuIngredients('');
    setMenuSpicy('0');
    setMenuSeafood(false);
    setMenuVegetarian(false);
  };

  const handleEditClick = (item) => {
    setEditMenuItem(item);
    setMenuName(item.name);
    setMenuPrice(item.price);
    setMenuDesc(item.description);
    setMenuCat(typeof item.category === 'object' ? item.category?._id : item.category);
    setMenuIngredients(item.ingredients?.join(', ') || '');
    setMenuSpicy(String(item.spicyLevel));
    setMenuSeafood(item.containsSeafood);
    setMenuVegetarian(item.isVegetarian);
    setShowMenuForm(true);
  };

  // Table actions
  const handleTableSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await tableAPI.createTable({
        tableNumber,
        capacity: Number(tableCapacity),
        area: tableArea,
        description: tableDesc
      });
      if (res.success) {
        toast.success('Tao ban an thanh cong');
        setShowTableForm(false);
        setTableNumber('');
        setTableDesc('');
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Ban co chac chan muon xoa ban nay?')) return;
    try {
      const res = await tableAPI.deleteTable(id);
      if (res.success) {
        toast.success('Xoa ban an thanh cong');
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // User Actions
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editUser) {
        res = await userAPI.updateUser(editUser._id, {
          name: userName,
          phone: userPhone,
          role: userRole
        });
        toast.success('Cap nhat nhan vien thanh cong');
      } else {
        res = await userAPI.createUser({
          name: userName,
          email: userEmail,
          password: userPassword,
          phone: userPhone,
          role: userRole
        });
        toast.success('Tao nhan vien moi thanh cong');
      }

      if (res.success) {
        setShowUserForm(false);
        setEditUser(null);
        clearUserForm();
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const clearUserForm = () => {
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserPhone('');
    setUserRole('waiter');
  };

  const handleEditUserClick = (u) => {
    setEditUser(u);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserPhone(u.phone || '');
    setUserRole(u.role);
    setShowUserForm(true);
  };

  const handleToggleUser = async (id, currentStatus) => {
    try {
      const res = await userAPI.updateUser(id, { isActive: !currentStatus });
      if (res.success) {
        toast.success('Cap nhat trang thai thanh cong');
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Ban co chac chan muon khoa tai khoan nay?')) return;
    try {
      const res = await userAPI.deleteUser(id);
      if (res.success) {
        toast.success('Khoa tai khoan thanh cong');
        loadCRUDData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // AI consultant submit
  const handleSendAIConsultant = async () => {
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
      toast.error(err.message);
      setAiChat(prev => [...prev, { role: 'ai', text: 'Khong the thuc hien phan tich do loi he thong.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Sub Tabs */}
      <div className="flex border-b border-gold/10 gap-4 overflow-x-auto no-scrollbar">
        
        
        
        
        
      </div>

      
      {/* CONFIG CRUD */}
      {subTab === 'config' && (
        <div className="glass-panel-luxury p-8 animate-fade-up flex flex-col items-center justify-center h-96">
          <div className="w-16 h-16 rounded-full border border-gold/40 flex items-center justify-center bg-gold/10 mb-4">
            <span className="text-gold font-serif text-2xl">S</span>
          </div>
          <h3 className="font-serif text-xl text-gold uppercase tracking-wider mb-2">Cau Hinh He Thong</h3>
          <p className="text-cream-dim text-sm text-center max-w-md">
            Dang phat trien: Cai dat ngon ngu, timezone, backup du lieu va cau hinh AI.
          </p>
          <button className="mt-6 px-6 py-2 bg-gold/10 border border-gold/30 text-gold text-xs uppercase hover:bg-gold/20 transition-all rounded-full">
            Backup Du Lieu
          </button>
        </div>
      )}

      {/* USERS CRUD */}
      {subTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gold/10">
            <h3 className="font-serif text-lg text-gold uppercase tracking-wider">Danh sach nhan vien</h3>
            <button 
              onClick={() => { setEditUser(null); clearUserForm(); setShowUserForm(true); }}
              className="bg-gold text-bg text-[10px] tracking-wider uppercase px-4 py-2 font-semibold hover:bg-gold-light transition-all flex items-center gap-1.5"
            >
              <Plus size={12} /> Tao Tai Khoan
            </button>
          </div>

          {/* User Form Create/Edit */}
          {showUserForm && (
            <form onSubmit={handleUserSubmit} className="glass-panel-luxury p-6  space-y-4 max-w-2xl">
              <h4 className="font-serif text-sm text-gold uppercase tracking-wider">
                {editUser ? 'Chinh sua nhan vien' : 'Tao tai khoan moi'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">Ho va Ten</label>
                  <input 
                    type="text" 
                    className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">Email dang nhap</label>
                  <input 
                    type="email" 
                    className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    disabled={!!editUser}
                    required={!editUser}
                  />
                </div>
                {!editUser && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-muted font-medium">Mat khau</label>
                    <input 
                      type="password" 
                      className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">So dien thoai</label>
                  <input 
                    type="text" 
                    className="bg-bg/50 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-muted font-medium">Vai tro (Role)</label>
                  <select 
                    className="bg-bg-2 border border-gold/10 text-cream px-3 py-2 text-xs outline-none focus:border-gold/50"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                  >
                    <option value="waiter">Phuc vu (Waiter)</option>
                    <option value="receptionist">Le tan (Receptionist)</option>
                    <option value="chef">Bep (Chef)</option>
                    <option value="admin">Quan ly (Admin)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowUserForm(false)}
                  className="px-4 py-2 border border-gold/20 text-cream-dim text-xs uppercase"
                >
                  Huy
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-gold text-bg text-xs uppercase font-semibold"
                >
                  Luu tai khoan
                </button>
              </div>
            </form>
          )}

          {/* Users List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gold/20 text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Nhan vien</th>
                  <th className="py-3 px-4">Lien he</th>
                  <th className="py-3 px-4 text-center">Vai tro</th>
                  <th className="py-3 px-4 text-center">Trang thai</th>
                  <th className="py-3 px-4 text-right">Thao tac</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-glass/10 transition-colors">
                    <td className="py-4 px-4 font-serif text-sm text-cream">{u.name}</td>
                    <td className="py-4 px-4 text-cream-dim">
                      <div>{u.email}</div>
                      <div className="text-muted">{u.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 border border-gold/20 text-gold text-[10px] uppercase tracking-wider">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button 
                        onClick={() => handleToggleUser(u._id, u.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-medium ${
                          u.isActive ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
                        }`}
                      >
                        {u.isActive ? 'Hoat dong' : 'Da khoa'}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEditUserClick(u)}
                        className="p-1.5 hover:text-gold text-muted"
                        title="Sua"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-1.5 hover:text-wine-light text-muted"
                        title="Khoa/Xoa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVOICES LIST */}
      {subTab === 'invoices' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-gold/10">
            <h3 className="font-serif text-lg text-gold uppercase tracking-wider">Lich su hoa don</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gold/20 text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Ma HD</th>
                  <th className="py-3 px-4">Ngay thanh toan</th>
                  <th className="py-3 px-4 text-center">Ban an</th>
                  <th className="py-3 px-4 text-right">Tong tien</th>
                  <th className="py-3 px-4 text-center">Trang thai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-glass/10 transition-colors">
                    <td className="py-4 px-4 font-serif text-cream">#{inv._id.substring(18)}</td>
                    <td className="py-4 px-4 text-cream-dim">
                      {new Date(inv.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-4 px-4 text-center text-gold">
                      {inv.table?.tableNumber || '-'}
                    </td>
                    <td className="py-4 px-4 text-right font-serif text-sm">
                      {inv.total.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider font-medium ${
                        inv.paymentStatus === 'paid' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                      }`}>
                        {inv.paymentStatus === 'paid' ? 'Da Thu' : 'Cho'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

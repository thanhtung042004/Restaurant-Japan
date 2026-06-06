import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, DollarSign, Printer, Search, FileText } from 'lucide-react';
import { invoiceAPI } from '../services/api';

export default function CashierDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceAPI.getInvoices({ status: 'unpaid' });
      if (res.success) {
        setInvoices(res.data);
      }
    } catch (err) {
      toast.error('Loi tai danh sach hoa don: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handlePay = async (id, method) => {
    try {
      const res = await invoiceAPI.payInvoice(id, method);
      if (res.success) {
        toast.success('Thanh toan thanh cong!');
        setSelectedInvoice(null);
        loadInvoices();
      }
    } catch (err) {
      toast.error('Loi thanh toan: ' + err.message);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.order?.table?.tableNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv._id.includes(searchQuery)
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Left List */}
      <div className="w-full lg:w-1/3 glass-panel-luxury p-0 flex flex-col overflow-hidden animate-fade-up">
        <div className="p-6 border-b border-gold/10">
          <h2 className="font-serif text-lg text-gold uppercase tracking-widest flex items-center gap-2">
            <DollarSign size={20} /> Danh Sach Thanh Toan
          </h2>
          <div className="relative mt-4">
            <input 
              type="text" 
              placeholder="Tim kiem so ban hoac ma hoa don..."
              className="w-full bg-bg/50 border border-gold/20 rounded-lg pl-10 pr-4 py-2.5 text-xs text-cream outline-none focus:border-gold/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 no-scrollbar space-y-2">
          {loading ? (
            <div className="p-4 text-center text-muted text-xs">Dang tai...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-4 text-center text-muted text-xs">Khong co hoa don dang cho</div>
          ) : (
            filteredInvoices.map(inv => (
              <div 
                key={inv._id}
                onClick={() => setSelectedInvoice(inv)}
                className={`p-4 rounded-xl border transition-all cursor-pointer \${
                  selectedInvoice?._id === inv._id 
                    ? 'bg-gold/10 border-gold/40 shadow-[0_0_15px_rgba(201,164,71,0.15)]' 
                    : 'bg-glass/5 border-gold/5 hover:border-gold/20 hover:bg-glass/10'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-serif text-gold text-lg">Ban {inv.order?.table?.tableNumber || 'Mang ve'}</span>
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded uppercase tracking-wider">Chua thanh toan</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-[10px] text-muted">
                    Ma HD: ...{inv._id.slice(-6)}
                  </div>
                  <div className="font-sans text-cream font-medium">
                    {inv.totalAmount.toLocaleString('vi-VN')} VND
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="w-full lg:w-2/3 glass-panel-luxury p-0 flex flex-col overflow-hidden animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {selectedInvoice ? (
          <div className="flex flex-col h-full relative">
            <div className="absolute inset-0 particles-bg opacity-30 pointer-events-none" />
            
            <div className="p-8 border-b border-gold/10 z-10 bg-bg-2/50 backdrop-blur-sm flex justify-between items-center">
              <div>
                <h3 className="font-serif text-2xl text-gold uppercase tracking-wider">Hoa Don Ban {selectedInvoice.order?.table?.tableNumber || '?'}</h3>
                <p className="text-xs text-muted mt-1">Ma: {selectedInvoice._id} • Khach: {selectedInvoice.order?.customer?.name || 'Khach le'}</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-glass/10 border border-gold/20 text-cream-dim hover:text-gold hover:border-gold/40 transition-all text-xs uppercase tracking-wider rounded-lg">
                <Printer size={14} /> In Hoa Don
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 z-10 no-scrollbar">
              <table className="w-full text-left text-sm mb-8">
                <thead>
                  <tr className="border-b border-gold/20 text-muted uppercase tracking-wider text-[10px]">
                    <th className="py-3 font-medium">Mon an</th>
                    <th className="py-3 font-medium text-center">SL</th>
                    <th className="py-3 font-medium text-right">Don gia</th>
                    <th className="py-3 font-medium text-right">Thanh tien</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/5">
                  {selectedInvoice.order?.items?.map((item, idx) => (
                    <tr key={idx} className="text-cream">
                      <td className="py-4 flex gap-3 items-center">
                        <div className="w-8 h-8 rounded bg-glass/20 flex items-center justify-center text-xs border border-gold/10 text-gold font-serif">
                          {item.menuItem?.name?.charAt(0)}
                        </div>
                        {item.menuItem?.name || 'Mon an'}
                      </td>
                      <td className="py-4 text-center">{item.quantity}</td>
                      <td className="py-4 text-right text-cream-dim">{(item.price || 0).toLocaleString('vi-VN')}</td>
                      <td className="py-4 text-right">{(item.quantity * (item.price || 0)).toLocaleString('vi-VN')} VND</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-gold/20 pt-6 space-y-3 w-1/2 ml-auto">
                <div className="flex justify-between text-xs text-cream-dim">
                  <span>Tam tinh:</span>
                  <span>{selectedInvoice.subtotal.toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="flex justify-between text-xs text-cream-dim">
                  <span>VAT (10%):</span>
                  <span>{selectedInvoice.tax.toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="flex justify-between text-lg font-serif text-gold pt-3 border-t border-gold/10">
                  <span>Tong Cong:</span>
                  <span>{selectedInvoice.totalAmount.toLocaleString('vi-VN')} VND</span>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gold/10 z-10 bg-bg-2/50 backdrop-blur-sm">
              <p className="text-[10px] text-muted uppercase tracking-widest mb-4">Phuong thuc thanh toan</p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button onClick={() => handlePay(selectedInvoice._id, 'cash')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gold/20 bg-glass/10 hover:bg-gold/10 hover:border-gold/50 transition-all text-cream">
                  <DollarSign size={20} className="text-gold" />
                  <span className="text-[10px] uppercase tracking-wider">Tien mat</span>
                </button>
                <button onClick={() => handlePay(selectedInvoice._id, 'card')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gold/20 bg-glass/10 hover:bg-gold/10 hover:border-gold/50 transition-all text-cream">
                  <CreditCard size={20} className="text-gold" />
                  <span className="text-[10px] uppercase tracking-wider">The ATM / Visa</span>
                </button>
                <button onClick={() => handlePay(selectedInvoice._id, 'transfer')} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gold/20 bg-glass/10 hover:bg-gold/10 hover:border-gold/50 transition-all text-cream">
                  <FileText size={20} className="text-gold" />
                  <span className="text-[10px] uppercase tracking-wider">Chuyen khoan</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted relative z-10">
            <div className="w-20 h-20 rounded-full border border-gold/20 flex items-center justify-center bg-glass/5 mb-6 animate-pulse-gold">
              <FileText size={32} className="text-gold" />
            </div>
            <p className="font-serif text-xl text-gold uppercase tracking-widest">Sakura Cashier</p>
            <p className="text-xs mt-2 uppercase tracking-wider">Chon mot hoa don de xu ly</p>
          </div>
        )}
      </div>
    </div>
  );
}

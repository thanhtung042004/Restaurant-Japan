import React, { useState, useEffect } from 'react';
import {
  Utensils, Table2, Users, BarChart3, FileText, CalendarDays, Bot
} from 'lucide-react';
import AIAssistantDashboard from '../../admin/components/AIAssistantDashboard';

// Import Tabs
import AnalyticsTab from '../components/tabs/AnalyticsTab';
import MenuTab from '../components/tabs/MenuTab';
import TablesTab from '../components/tabs/TablesTab';
import InvoicesTab from '../components/tabs/InvoicesTab';
import ReservationsTab from '../components/tabs/ReservationsTab';
import StaffTab from '../components/tabs/StaffTab';

export default function ManagerDashboard({ activeTab: propTab, onTabChange: propOnTabChange, user, socket }) {
  const [subTab, setSubTab] = useState(propTab || 'analytics');

  useEffect(() => {
    const validTabs = ['analytics', 'menu', 'tables', 'invoices', 'reservations', 'staff', 'ai'];
    if (propTab && validTabs.includes(propTab)) {
      setSubTab(propTab);
    }
  }, [propTab]);

  const setTabWrapper = (tab) => {
    setSubTab(tab);
    propOnTabChange?.(tab);
  };

  const TAB_ITEMS = [
    { id: 'analytics', icon: BarChart3, label: 'Tổng Quan' },
    { id: 'menu', icon: Utensils, label: 'Thực Đơn' },
    { id: 'tables', icon: Table2, label: 'Bàn Ăn' },
    { id: 'invoices', icon: FileText, label: 'Hóa Đơn' },
    { id: 'reservations', icon: CalendarDays, label: 'Đặt Bàn' },
    { id: 'staff', icon: Users, label: 'Nhân Sự' },
    { id: 'ai', icon: Bot, label: 'Sakura AI' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title flex items-center gap-2"><BarChart3 size={16} /> Quản Lý Nhà Hàng</h1>
        <p className="section-subtitle mt-1">Dashboard tổng quản · Vận hành toàn diện</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gold/10 gap-0.5 overflow-x-auto no-scrollbar">
        {TAB_ITEMS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTabWrapper(id)} className={`luxury-tab ${subTab === id ? 'active' : ''}`}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Render Active Tab */}
      {subTab === 'analytics' && <AnalyticsTab socket={socket} onNavigateTab={setTabWrapper} />}
      {subTab === 'menu' && <MenuTab />}
      {subTab === 'tables' && <TablesTab socket={socket} />}
      {subTab === 'invoices' && <InvoicesTab socket={socket} />}
      {subTab === 'reservations' && <ReservationsTab socket={socket} />}
      {subTab === 'staff' && <StaffTab currentUser={user} />}
      {subTab === 'ai' && <AIAssistantDashboard user={user} />}
    </div>
  );
}

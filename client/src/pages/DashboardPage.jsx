import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

// Layout & Portals
import DashboardLayout from '../components/layout/DashboardLayout';
import CustomerPortal from '../features/customer/pages/CustomerPortal';

// Role-based Dashboards
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import ManagerDashboard from '../features/manager/pages/ManagerDashboard';
import WaiterProfile from '../features/waiter/pages/WaiterProfile';

const defaultTab = (role) => {
  if (role === 'admin') return 'overview';
  if (role === 'manager') return 'analytics';
  return 'profile'; // waiter
};

export default function DashboardPage({ user, socket, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState(() => defaultTab(user?.role));

  if (!user) return <Navigate to="/" replace />;

  // Customer Portal — full-screen, no sidebar
  if (user.role === 'customer') return <CustomerPortal user={user} onLogout={onLogout} onUserUpdate={onUserUpdate} />;

  // Waiter — simple profile, no complex dashboard
  if (user.role === 'waiter') {
    return (
      <DashboardLayout
        user={user}
        onLogout={onLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notifications={[]}
        onClearNotifications={() => {}}
      >
        <WaiterProfile user={user} onLogout={onLogout} />
      </DashboardLayout>
    );
  }

  // Roles without dedicated dashboard
  if (!['admin', 'manager'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className="text-5xl mb-2">🔧</div>
        <h2 className="font-serif text-xl text-gold">Đang phát triển</h2>
        <p className="text-sm text-muted max-w-xs">
          Giao diện cho vai trò <span className="text-cream capitalize">{user.role}</span> đang được xây dựng.
          Vui lòng liên hệ quản trị viên.
        </p>
        <button onClick={onLogout} className="btn-ghost mt-2">Đăng xuất</button>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      notifications={[]}
      onClearNotifications={() => {}}
    >
      {user.role === 'admin' && <AdminDashboard activeTab={activeTab} onTabChange={setActiveTab} socket={socket} />}
      {user.role === 'manager' && <ManagerDashboard activeTab={activeTab} onTabChange={setActiveTab} socket={socket} user={user} />}
    </DashboardLayout>
  );
}

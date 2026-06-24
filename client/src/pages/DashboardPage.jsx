import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Layout & Portals
import DashboardLayout from '../components/layout/DashboardLayout';
import CustomerPortal from '../features/customer/pages/CustomerPortal';

// Role-based Dashboards
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import ManagerDashboard from '../features/manager/pages/ManagerDashboard';
import WaiterDashboard from '../features/waiter/pages/WaiterDashboard';
import WaiterHome from '../features/waiter/pages/WaiterHome';

// ponytail: waiter defaults to home tab now
const defaultTab = (role) =>
  role === 'admin' ? 'users' : role === 'waiter' ? 'home' : 'analytics';

export default function DashboardPage({ user, socket, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState(() => defaultTab(user?.role));
  // ponytail: shared notification state lifted here so topbar bell + waiter home both see it
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket || user?.role !== 'waiter') return;
    const handle = (n) => {
      setNotifications(prev => [n, ...prev].slice(0, 30)); // cap at 30
      toast(n.message, { icon: n.icon, duration: 5000 });
    };
    socket.on('notification:new', handle);
    return () => socket.off('notification:new', handle);
  }, [socket, user?.role]);

  if (!user) return <Navigate to="/" replace />;

  // Customer Portal — full-screen, no sidebar
  if (user.role === 'customer') return <CustomerPortal user={user} onLogout={onLogout} onUserUpdate={onUserUpdate} />;

  // Roles without dedicated dashboard yet
  if (!['admin', 'manager', 'waiter'].includes(user.role)) {
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
      notifications={notifications}
      onClearNotifications={() => setNotifications([])}
    >
      {user.role === 'admin' && <AdminDashboard activeTab={activeTab} onTabChange={setActiveTab} socket={socket} />}
      {user.role === 'manager' && <ManagerDashboard activeTab={activeTab} onTabChange={setActiveTab} socket={socket} user={user} />}
      {user.role === 'waiter' && activeTab === 'home' && (
        <WaiterHome
          socket={socket}
          user={user}
          notifications={notifications}
          onClearNotifications={() => setNotifications([])}
        />
      )}
      {user.role === 'waiter' && (activeTab === 'floor' || activeTab === 'order') && (
        <WaiterDashboard socket={socket} />
      )}
    </DashboardLayout>
  );
}

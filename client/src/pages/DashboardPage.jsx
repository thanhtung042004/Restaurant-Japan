import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

// Layout & Portals
import DashboardLayout from '../components/layout/DashboardLayout';
import CustomerPortal from '../features/customer/pages/CustomerPortal';

// Role-based Dashboards
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import ManagerDashboard from '../features/manager/pages/ManagerDashboard';
import WaiterDashboard from '../features/waiter/pages/WaiterDashboard';

const DEFAULT_TAB = {
  admin: 'users',
  manager: 'analytics',
  waiter: 'floor',
};

export default function DashboardPage({ user, socket, onLogout }) {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB[user?.role] || 'analytics');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Customer Portal — full-screen, no sidebar
  if (user.role === 'customer') {
    return <CustomerPortal user={user} onLogout={onLogout} />;
  }

  // Staff Portal Layout Wrap
  return (
    <DashboardLayout user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={setActiveTab}>
      {user.role === 'admin' && <AdminDashboard activeTab={activeTab} onTabChange={setActiveTab} socket={socket} />}
      {user.role === 'manager' && <ManagerDashboard activeTab={activeTab} onTabChange={setActiveTab} socket={socket} user={user} />}
      {user.role === 'waiter' && <WaiterDashboard socket={socket} />}
    </DashboardLayout>
  );
}

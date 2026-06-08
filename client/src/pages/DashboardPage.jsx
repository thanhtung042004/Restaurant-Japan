import React from 'react';
import { Navigate } from 'react-router-dom';

// Layout & Portals
import DashboardLayout from '../components/layout/DashboardLayout';
import CustomerPortal from '../features/customer/pages/CustomerPortal';

// Role-based Dashboards
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import ManagerDashboard from '../features/manager/pages/ManagerDashboard';
import WaiterDashboard from '../features/waiter/pages/WaiterDashboard';

export default function DashboardPage({ user, socket, onLogout }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Customer Portal
  if (user.role === 'customer') {
    return <CustomerPortal user={user} onLogout={onLogout} />;
  }

  // Staff Portal Layout Wrap
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'manager' && <ManagerDashboard />}
      {user.role === 'waiter' && <WaiterDashboard />}
    </DashboardLayout>
  );
}

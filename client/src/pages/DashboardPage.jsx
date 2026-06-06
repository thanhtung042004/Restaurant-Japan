import React from 'react';
import { Navigate } from 'react-router-dom';

// Layout & Portals
import DashboardLayout from '../components/DashboardLayout';
import CustomerPortal from '../components/CustomerPortal';

// Role-based Dashboards
import AdminDashboard from '../components/AdminDashboard';
import ManagerDashboard from '../components/ManagerDashboard';
import CashierDashboard from '../components/CashierDashboard';
import ChefDashboard from '../components/ChefDashboard';
import WaiterDashboard from '../components/WaiterDashboard';
import ReceptionistDashboard from '../components/ReceptionistDashboard';

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
      {user.role === 'cashier' && <CashierDashboard />}
      {user.role === 'chef' && <ChefDashboard socket={socket} />}
      {user.role === 'waiter' && <WaiterDashboard />}
      {user.role === 'receptionist' && <ReceptionistDashboard socket={socket} />}
    </DashboardLayout>
  );
}

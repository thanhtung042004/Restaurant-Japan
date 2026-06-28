import React, { useState, useEffect } from 'react';
import OverviewTab from '../components/tabs/OverviewTab';
import UsersTab from '../components/tabs/UsersTab';
import AnalyticsTab from '../components/tabs/AnalyticsTab';
import AuditLogsTab from '../components/tabs/AuditLogsTab';
import ConfigTab from '../components/tabs/ConfigTab';
import SecurityTab from '../components/tabs/SecurityTab';

const VALID_TABS = ['overview', 'users', 'analytics', 'audit', 'config', 'security'];

export default function AdminDashboard({ activeTab: propTab, onTabChange: propOnTabChange }) {
  const [tab, setTab] = useState(
    VALID_TABS.includes(propTab) ? propTab : 'overview'
  );

  useEffect(() => {
    if (propTab && VALID_TABS.includes(propTab)) setTab(propTab);
  }, [propTab]);

  const setTabWrapper = (t) => {
    setTab(t);
    propOnTabChange?.(t);
  };

  const renderTab = () => {
    switch (tab) {
      case 'overview':  return <OverviewTab onTabChange={setTabWrapper} />;
      case 'users':     return <UsersTab />;
      case 'analytics': return <AnalyticsTab />;
      case 'audit':     return <AuditLogsTab />;
      case 'config':    return <ConfigTab />;
      case 'security':  return <SecurityTab />;
      default:          return <OverviewTab onTabChange={setTabWrapper} />;
    }
  };

  return <div className="space-y-0">{renderTab()}</div>;
}

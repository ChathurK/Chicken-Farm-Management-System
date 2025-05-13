import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { Tabs } from '../../shared/Tabs';
import Feed from './feed/Feed';
import Medications from './medications/Medications';
import Other from './other/Other';
import { Package, FirstAid, Hamburger } from '@phosphor-icons/react';

const Inventory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  // Determine active tab from URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/feed')) {
      setActiveTab(0);
    } else if (path.includes('/medications')) {
      setActiveTab(1);
    } else if (path.includes('/other')) {
      setActiveTab(2);
    }
  }, [location]);

  // Define tabs
  const tabs = [
    {
      label: 'Feed',
      icon: <Hamburger size={20} weight="duotone" />,
      onClick: () => navigate('/admin/inventory/feed'),
    },
    {
      label: 'Medications',
      icon: <FirstAid size={20} weight="duotone" />,
      onClick: () => navigate('/admin/inventory/medications'),
    },
    {
      label: 'Other Supplies',
      icon: <Package size={20} weight="duotone" />,
      onClick: () => navigate('/admin/inventory/other'),
    },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <Feed />;
      case 1:
        return <Medications />;
      case 2:
        return <Other />;
      default:
        return <Feed />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Inventory Management</h1>
        <Tabs tabs={tabs} activeTab={activeTab} />
        <div className="mt-6 flex-1">{renderContent()}</div>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;

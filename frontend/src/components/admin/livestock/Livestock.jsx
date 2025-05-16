import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { Tabs } from '../../shared/Tabs';
import Eggs from './eggs/Eggs';
import Chicks from './chicks/Chicks';
import Chickens from './chickens/Chickens';

const Livestock = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const location = useLocation();

  // Determine active tab based on URL
  const getInitialTab = () => {
    // First check if we have a type parameter from the URL
    if (type && ['eggs', 'chicks', 'chickens'].includes(type)) {
      return type;
    }
    // Fallback to checking the full path
    const path = location.pathname;
    if (path.endsWith('/eggs')) return 'eggs';
    if (path.endsWith('/chicks')) return 'chicks';
    if (path.endsWith('/chickens')) return 'chickens';
    return 'eggs'; // Default tab
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/livestock/${tab}`);
  };

  const tabs = [
    { id: 'eggs', label: 'Eggs' },
    { id: 'chicks', label: 'Chicks' },
    { id: 'chickens', label: 'Chickens' },
  ];

  // Render the appropriate component based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'eggs':
        return <Eggs />;
      case 'chicks':
        return <Chicks />;
      case 'chickens':
        return <Chickens />;
      default:
        return <Eggs />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Livestock Management</h1>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

        <div className="mt-6 flex-1">{renderContent()}</div>
      </div>
    </DashboardLayout>
  );
};

export default Livestock;

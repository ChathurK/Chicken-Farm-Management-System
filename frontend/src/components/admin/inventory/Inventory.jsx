import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { Tabs } from '../../shared/Tabs';
import Feed from './feed/Feed';
import Medications from './medications/Medications';
import Other from './other/Other';
import Pagination from '../../shared/Pagination';
import { Package, FirstAid, Hamburger } from '@phosphor-icons/react';

const Inventory = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const location = useLocation();

  // Determine the correct tab based the URL parameter or path
  const currentTab = useMemo(() => {
    // First check if we have a valid type parameter
    if(category&& ['feed', 'medication', 'other'].includes(category)) {
      return category;
    }
    // Fallback to checking the path
    const path = location.pathname;
    if (path.endsWith('/feed')) return 'feed';
    if (path.endsWith('/medication')) return 'medication';
    if (path.endsWith('/other')) return 'other';

    // Default to feed if no match
    return 'feed';
  }, [category, location.pathname]);

  // Set active tab state with the memoized value
  const [activeTab, setActiveTab] = useState(currentTab);

  // Shared pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    totalItems: 0,
    totalPages: 0,
    itemsPerPage: 10,
    currentPageFirstItemIndex: 0,
    currentPageLastItemIndex: 0,
    itemName: 'items',
  });

  // Update active tab only when URL parameters change
  useEffect(() => {
    if (activeTab !== currentTab) {
      setActiveTab(currentTab);
      setCurrentPage(1); // Reset pagination when changing tabs
    }
  }, [currentTab, activeTab]);

  // Handle tab change and navigation
  const handleTabChange = (tab) => {
    if (tab !== category) {
      navigate(`/admin/inventory/${tab}`);
    }
  };

  const tabs = [
    {
      id: 'feed',
      label: 'Feed',
      icon: <Hamburger size={20} weight="duotone" />,
      onClick: () => handleTabChange('feed'),
    },
    {
      id: 'medication',
      label: 'Medications',
      icon: <FirstAid size={20} weight="duotone" />,
      onClick: () => handleTabChange('medication'),
    },
    {
      id: 'other',
      label: 'Other Supplies',
      icon: <Package size={20} weight="duotone" />,
      onClick: () => handleTabChange('other'),
    },
  ];

  // Function to handle pagination updates from child components
  const handlePaginationUpdate = (data) => {
    setPaginationData(data);
  };

  // Render the appropriate component based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <Feed
            currentPage={currentPage}
            onPaginationChange={handlePaginationUpdate}
          />
        );
      case 'medication':
        return (
          <Medications
            currentPage={currentPage}
            onPaginationChange={handlePaginationUpdate}
          />
        );
      case 'other':
        return (
          <Other
            currentPage={currentPage}
            onPaginationChange={handlePaginationUpdate}
          />
        );
    }
  };

  /* 
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
 */
  return (
    <DashboardLayout>
      <div className="flex h-full flex-col rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Inventory Management</h1>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
        <div className="mt-6 flex-1">{renderContent()}</div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={paginationData.totalPages}
          totalItems={paginationData.totalItems}
          itemsPerPage={paginationData.itemsPerPage}
          currentPageFirstItemIndex={paginationData.currentPageFirstItemIndex}
          currentPageLastItemIndex={paginationData.currentPageLastItemIndex}
          onPageChange={setCurrentPage}
          itemName={paginationData.itemName}
        />
      </div>
    </DashboardLayout>
  );
};

export default Inventory;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { Tabs } from '../../shared/Tabs';
import Eggs from './eggs/Eggs';
import Chicks from './chicks/Chicks';
import Chickens from './chickens/Chickens';
import Pagination from '../../shared/Pagination';

const Livestock = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const location = useLocation();
  
  // Determine the correct tab based on the URL parameter or path
  const currentTab = useMemo(() => {
    // First check if we have a valid type parameter
    if (type && ['eggs', 'chicks', 'chickens'].includes(type)) {
      return type;
    }
    
    // Fallback to checking the path
    const path = location.pathname;
    if (path.endsWith('/eggs')) return 'eggs';
    if (path.endsWith('/chicks')) return 'chicks';
    if (path.endsWith('/chickens')) return 'chickens';
    
    // Default to eggs if no match
    return 'eggs';
  }, [type, location.pathname]);
  
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
    itemName: "items"
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
    if (tab !== type) {
      navigate(`/admin/livestock/${tab}`);
    }
  };

  const tabs = [
    { id: 'eggs', label: 'Eggs' },
    { id: 'chicks', label: 'Chicks' },
    { id: 'chickens', label: 'Chickens' },
  ];

  // Function to handle pagination updates from child components
  const handlePaginationUpdate = (data) => {
    setPaginationData(data);
  };

  // Render the appropriate component based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'eggs':
        return <Eggs
          currentPage={currentPage}
          onPaginationChange={handlePaginationUpdate}
        />;
      case 'chicks':
        return <Chicks
          currentPage={currentPage}
          onPaginationChange={handlePaginationUpdate}
        />;
      case 'chickens':
        return <Chickens
          currentPage={currentPage}
          onPaginationChange={handlePaginationUpdate}
        />;
      default:
        return <Eggs
          currentPage={currentPage}
          onPaginationChange={handlePaginationUpdate}
        />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Livestock Management</h1>

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

export default Livestock;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { Plus, MagnifyingGlass, ArrowsDownUp, Eye, Pencil, Trash } from '@phosphor-icons/react';
import api from '../../../utils/api';

const Buyers = () => {
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('first_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(8); // Number of items per page
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [buyerToDelete, setBuyerToDelete] = useState(null);

  // Fetch buyers data
  useEffect(() => {
    fetchBuyers();
  }, [currentPage, sortField, sortDirection, searchTerm]);

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/buyers');
      
      // Process response data
      let data = response.data;
      
      // Filter by search term
      if (searchTerm) {
        data = data.filter(buyer => 
          `${buyer.first_name} ${buyer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          buyer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          buyer.contact_number?.includes(searchTerm)
        );
      }
      
      // Sort data
      data.sort((a, b) => {
        // Handle nested fields like first_name + last_name
        const fieldA = sortField === 'name' 
          ? `${a.first_name} ${a.last_name}`.toLowerCase() 
          : String(a[sortField]).toLowerCase();
          
        const fieldB = sortField === 'name' 
          ? `${b.first_name} ${b.last_name}`.toLowerCase() 
          : String(b[sortField]).toLowerCase();
        
        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      
      // Calculate pagination
      const totalItems = data.length;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
      
      // Get current page items
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = data.slice(startIndex, endIndex);
      
      setBuyers(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching buyers');
      setLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle deleting a buyer
  const deleteBuyer = async (id) => {
    try {
      await api.delete(`/api/buyers/${id}`);
      
      // Refresh buyers list
      fetchBuyers();
      setShowConfirmDelete(false);
      setBuyerToDelete(null);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error deleting buyer');
    }
  };

  // Filtered and sorted buyers for the current page
  const displayBuyers = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="6" className="px-6 py-4 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
              <span className="ml-2">Loading...</span>
            </div>
          </td>
        </tr>
      );
    }
    
    if (buyers.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
            No buyers found
          </td>
        </tr>
      );
    }

    // Calculate pagination slice
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBuyers = buyers.slice(startIndex, startIndex + itemsPerPage);
    
    return paginatedBuyers.map(buyer => (
      <tr key={buyer.buyer_id} className="bg-white border-b hover:bg-gray-50">
        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
          {buyer.first_name} {buyer.last_name}
        </td>
        <td className="px-6 py-4">{buyer.contact_number}</td>
        <td className="px-6 py-4">{buyer.email || "-"}</td>
        <td className="px-6 py-4">{buyer.address || "-"}</td>
        <td className="px-6 py-4 flex gap-2">
          <button 
            onClick={() => navigate(`/admin/buyers/${buyer.buyer_id}`)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye size={20} weight="duotone" />
          </button>
          <button 
            onClick={() => navigate(`/admin/buyers/edit/${buyer.buyer_id}`)}
            className="text-amber-600 hover:text-amber-900"
            title="Edit"
          >
            <Pencil size={20} weight="duotone" />
          </button>
          <button 
            onClick={() => {
              setBuyerToDelete(buyer);
              setShowConfirmDelete(true);
            }}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <Trash size={20} weight="duotone" />
          </button>
        </td>
      </tr>
    ));
  };

  // Pagination controls
  const Pagination = () => {
    return (
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {buyers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, buyers.length)} of {buyers.length} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => {
    if (!showConfirmDelete) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
          <p className="mb-6">
            Are you sure you want to delete buyer: <span className="font-semibold">{buyerToDelete?.first_name} {buyerToDelete?.last_name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowConfirmDelete(false);
                setBuyerToDelete(null);
                setError(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteBuyer(buyerToDelete.buyer_id)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Header with title and add button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Buyers</h1>
          <button 
            onClick={() => navigate('/admin/buyers/add')}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-600 transition-colors"
          >
            <Plus size={20} weight="bold" />
            Add New Buyer
          </button>
        </div>
        
        {/* Error message if any */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlass size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5"
              placeholder="Search by name, email, or phone number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
        </div>
        
        {/* Buyers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Name
                    <ArrowsDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('contact_number')}>
                  <div className="flex items-center">
                    Contact Number
                    <ArrowsDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('email')}>
                  <div className="flex items-center">
                    Email
                    <ArrowsDownUp size={14} className="ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">Address</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayBuyers()}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && buyers.length > 0 && <Pagination />}
        
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal />
      </div>
    </DashboardLayout>
  );
};

export default Buyers;
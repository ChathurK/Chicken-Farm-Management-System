import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, Pencil, Eye, SortAscending, SortDescending, X, Warning } from '@phosphor-icons/react';
import api from '../../../../utils/api';

const Medications = ({ currentPage: parentCurrentPage, onPaginationChange }) => {
  const navigate = useNavigate();

  // State variables
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    field: '',
    direction: '',
  });

  const itemsPerPage = 10;

  // Fetch Medications
  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/inventory/category/Medication');
      setMedications(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load medications. Please try again.');
      setLoading(false);
      console.error('Error fetching medications:', err);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  // Update inventory status
  const updateInventoryStatus = async (id, status) => {
    try {
      await api.patch(`/api/inventory/${id}/status`, { status });
      // Refresh data
      fetchMedications();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update item status. Please try again.');
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    let direction = 'asc';
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
  };

  // Filter and sort medications - memorize to avoid recalculation on every render
  const filteredAndSortedMedications = useMemo(() => {
    const filtered = medications.filter(
      (item) =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.status &&
          item.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return [...filtered].sort((a, b) => {
      const { field, direction } = sortConfig;

      if (!field) return 0;

      // Extract value based on field
      const valA = a[field];
      const valB = b[field];

      const compareResult =
        typeof valA === 'string'
          ? valA.toLowerCase().localeCompare(valB.toLowerCase())
          : valA - valB;

      return direction === 'asc' ? compareResult : -compareResult;
    });
  }, [medications, searchTerm, sortConfig]);

  // Handle view details
  const handleViewDetails = (id) => {
    navigate(`/employee/inventory/view/${id}`);
  };

  // Handle edit item
  const handleEditClick = (id) => {
    navigate(`/employee/inventory/update/${id}`);
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortConfig.field === field) {
      return sortConfig.direction === 'asc' ? (
        <SortAscending
          className="ml-1 inline-block"
          size={16}
          weight="bold"
        />
      ) : (
        <SortDescending
          className="ml-1 inline-block"
          size={16}
          weight="bold"
        />
      );
    }
    return null;
  };

  // Get status color class
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Low':
        return 'bg-yellow-100 text-yellow-800';
      case 'Finished':
        return 'bg-red-100 text-red-800';
      case 'Expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  // Calculate pagination values
  const paginationValues = useMemo(() => {
    const currentPage = parentCurrentPage || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredAndSortedMedications.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredAndSortedMedications.length / itemsPerPage);

    // Pass data to parent for pagination control
    if (onPaginationChange) {
      onPaginationChange({
        totalItems: filteredAndSortedMedications.length,
        totalPages,
        itemsPerPage,
        currentPageFirstItemIndex: filteredAndSortedMedications.length > 0 ? startIndex + 1 : 0,
        currentPageLastItemIndex: Math.min(endIndex, filteredAndSortedMedications.length),
        itemName: 'medication items',
      });
    }

    return { startIndex, endIndex, currentItems, totalPages, currentPage };
  }, [filteredAndSortedMedications, parentCurrentPage, itemsPerPage, onPaginationChange]);

  return (
    <div>
      {/* Top Control Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-grow-1 relative w-full md:w-auto">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlass size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
            placeholder="Search medication items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setSearchTerm('')}
            >
              <X size={18} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {/* Medications Table */}
      <div className="h-[calc(100vh-462px)] overflow-auto rounded-lg border border-gray-200 shadow-md">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('item_name')}
              >
                <div className="flex items-center">
                  Item Name
                  {getSortIcon('item_name')}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center">
                  Quantity
                  {getSortIcon('quantity')}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('expiration_date')}
              >
                <div className="flex items-center">
                  Expiration Date
                  {getSortIcon('expiration_date')}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th scope="col" className="px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
                  </div>
                </td>
              </tr>
            ) : paginationValues.currentItems.length > 0 ? (
              paginationValues.currentItems.map((item) => (
                <tr
                  key={item.inventory_id}
                  className="border-b bg-white hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">
                    {item.item_name}
                  </td>
                  <td className="px-4 py-4">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-4 py-4">
                    {item.expiration_date ? formatDate(item.expiration_date) : 'N/A'}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(item.inventory_id)}
                        className="rounded p-1 text-blue-500 hover:bg-blue-100"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditClick(item.inventory_id)}
                        className="rounded p-1 text-amber-500 hover:bg-amber-100"
                        title="Update Inventory"
                      >
                        <Pencil size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  {searchTerm ? (
                    <div className="flex flex-col items-center py-5">
                      <MagnifyingGlass
                        size={40}
                        weight="thin"
                        className="mb-2 text-gray-300"
                      />
                      <p>No medication items found matching your search.</p>
                      <button
                        className="mt-2 text-sm text-amber-500 hover:underline"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-5">
                      <Warning
                        size={40}
                        weight="thin"
                        className="mb-2 text-gray-300"
                      />
                      <p>No medication items found in inventory.</p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Medications;

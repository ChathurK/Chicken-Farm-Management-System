import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MagnifyingGlass, Pencil, Trash, Eye, SortAscending, SortDescending, X, Warning } from '@phosphor-icons/react';
import { ConfirmationModal } from '../InventoryModal';
import api from '../../../../utils/api';

const Feed = ({ currentPage: parentCurrentPage, onPaginationChange }) => {
  const navigate = useNavigate();

  // State variables
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedToDelete, setFeedToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    field: '',
    direction: '',
  });

  const feedsPerPage = 10;

  // Fetch Feed
  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/inventory/category/Feed');
      setFeed(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load feed. Please try again.');
      setLoading(false);
      console.error('Error fetching feed:', err);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // Handle delete
  const handleDeleteClick = (feed) => {
    setFeedToDelete(feed);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/inventory/${feedToDelete.inventory_id}`);
      setFeed(
        feed.filter((feed) => feed.inventory_id !== feedToDelete.inventory_id)
      );
      setShowDeleteModal(false);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        'Failed to delete feed item. Please try again.'
      );
      console.error('Error deleting feed item:', err);
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

  // Filter and sort feed - memorize to avid recalculation on every render
  const filteredAndSortedFeed = useMemo(() => {
    const filtered = feed.filter(
      (feed) =>
        feed.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feed.status &&
          feed.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return [...filtered].sort((a, b) => {
      const { field, direction } = sortConfig;

      // Handle special numeric fields
      if (field === 'quantity' || field === 'cost_per_unit') {
        const valueA = parseFloat(a[field]) || 0;
        const valueB = parseFloat(b[field]) || 0;

        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Handle date fields
      if (field === 'purchase_date' || field === 'expiration_date') {
        const dateA = a[field] ? new Date(a[field]) : new Date(0);
        const dateB = b[field] ? new Date(b[field]) : new Date(0);

        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // For string fields
      const valueA = (a[field] || '').toLowerCase();
      const valueB = (b[field] || '').toLowerCase();

      if (direction === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  }, [feed, searchTerm, sortConfig]);

  // Calculate pagination values - memoize to prevent unnecessary recalculations
  const paginationValues = useMemo(() => {
    const indexOfLastFeed = parentCurrentPage * feedsPerPage;
    const indexOfFirstFeed = indexOfLastFeed - feedsPerPage;
    const currentFeeds = filteredAndSortedFeed.slice(
      indexOfFirstFeed,
      indexOfLastFeed
    );
    const totalPages = Math.ceil(filteredAndSortedFeed.length / feedsPerPage);

    return {
      indexOfFirstFeed,
      indexOfLastFeed,
      currentFeeds,
      totalPages,
    };
  }, [filteredAndSortedFeed, parentCurrentPage, feedsPerPage]);

  // Ref to store previous pagination string to prevent circular updates
  const lastPaginationRef = useRef('');

  // Update parent component with pagination data when pagination values change
  useEffect(() => {
    // Create a pagination data object
    const paginationData = {
      totalItems: filteredAndSortedFeed.length,
      totalPages: paginationValues.totalPages,
      itemsPerPage: feedsPerPage,
      currentPageFirstItemIndex: paginationValues.indexOfFirstFeed,
      currentPageLastItemIndex: Math.min(
        paginationValues.indexOfLastFeed - 1,
        filteredAndSortedFeed.length - 1
      ),
      itemName: 'feed items',
    };

    // Use JSON.stringify to compare only when the actual content changes
    const paginationString = JSON.stringify(paginationData);

    // Only update if the pagination data actually changed
    if (lastPaginationRef.current !== paginationString) {
      lastPaginationRef.current = paginationString;
      onPaginationChange(paginationData);
    }
  }, [
    filteredAndSortedFeed.length,
    parentCurrentPage,
    paginationValues,
    onPaginationChange,
    feedsPerPage,
  ]);

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortConfig.field !== field) {
      return null;
    }

    return sortConfig.direction === 'asc' ? (
      <SortAscending size={16} weight="bold" className="ml-1 inline" />
    ) : (
      <SortDescending size={16} weight="bold" className="ml-1 inline" />
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Fix: Use local time instead of UTC to avoid off-by-one errors
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get status color
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
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if item is expiring soon (within 30 days)
  const isExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;

    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 && diffDays <= 30;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <h2 className="text-xl font-semibold">Feed Inventory</h2>
        <div className="mt-2 sm:mt-0">
          <button
            onClick={() => navigate('/admin/inventory/add/Feed')}
            className="flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          >
            <Plus size={18} weight="bold" />
            Add New Feed Item
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-4 flex items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlass size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search feed inventory..."
            className="w-full rounded-lg border border-gray-300 p-2 pl-10 text-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
            >
              <X size={18} weight='bold' />
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
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
                onClick={() => handleSort('purchase_date')}
              >
                <div className="flex items-center">
                  Purchase Date
                  {getSortIcon('purchase_date')}
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
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
                  </div>
                </td>
              </tr>
            ) : paginationValues.currentFeeds.length > 0 ? (
              paginationValues.currentFeeds.map((feed) => (
                <tr
                  key={feed.inventory_id}
                  className="border-b bg-white hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">
                    {feed.item_name}
                  </td>
                  <td className="px-4 py-4">
                    {feed.quantity} {feed.unit}
                  </td>
                  <td className="px-4 py-4">
                    {formatDate(feed.purchase_date)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      {formatDate(feed.expiration_date)}
                      {isExpiringSoon(feed.expiration_date) && (
                        <Warning
                          size={16}
                          className="ml-2 text-yellow-500"
                          weight="duotone"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(feed.status)}`}
                    >
                      {feed.status}
                    </span>
                  </td>
                  <td className="flex justify-end gap-2 px-4 py-4">
                    <button
                      onClick={() =>
                        navigate(`/admin/inventory/${feed.inventory_id}`)
                      }
                      className="text-amber-500 hover:text-amber-700"
                      title="View Details"
                    >
                      <Eye size={20} weight="duotone" />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/admin/inventory/edit/${feed.inventory_id}`)
                      }
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <Pencil size={20} weight="duotone" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(feed)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash size={20} weight="duotone" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center">
                  <p className="text-gray-500">No feed inventory items found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete the inventory item "${feedToDelete?.item_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setFeedToDelete(null);
          setError(null);
        }}
      />
    </div>
  );
};

export default Feed;

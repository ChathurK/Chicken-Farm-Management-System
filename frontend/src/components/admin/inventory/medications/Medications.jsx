import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  MagnifyingGlass,
  Pencil,
  Trash,
  Eye,
  SortAscending,
  SortDescending,
  CaretLeft,
  CaretRight,
  X,
  Warning,
} from '@phosphor-icons/react';
import { ConfirmationModal } from '../InventoryModal';
import api from '../../../../utils/api';

const Medications = () => {
  const navigate = useNavigate();

  // State variables
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    field: 'item_name',
    direction: 'asc',
  });

  const itemsPerPage = 10;

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/inventory/category/Medication');
      setInventory(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load inventory. Please try again.');
      setLoading(false);
      console.error('Error fetching inventory:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle delete
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/inventory/${itemToDelete.inventory_id}`);
      setInventory(
        inventory.filter(
          (item) => item.inventory_id !== itemToDelete.inventory_id
        )
      );
      setShowDeleteModal(false);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          'Failed to delete inventory item. Please try again.'
      );
      console.error('Error deleting inventory item:', err);
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

  // Filter and sort inventory
  const filteredInventory = inventory.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.status &&
        item.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedInventory = [...filteredInventory].sort((a, b) => {
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedInventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedInventory.length / itemsPerPage);

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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
        <h2 className="text-xl font-semibold">Medications Inventory</h2>
        <div className="mt-2 sm:mt-0">
          <button
            onClick={() => navigate('/admin/inventory/add/Medication')}
            className="flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          >
            <Plus size={18} weight="bold" />
            Add New Medication
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
            placeholder="Search medications..."
            className="w-full rounded-lg border border-gray-300 p-2 pl-10 text-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('item_name')}
              >
                <div className="flex items-center">
                  Medication Name
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
            ) : currentItems.length > 0 ? (
              currentItems.map((item) => (
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
                    {formatDate(item.purchase_date)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      {formatDate(item.expiration_date)}
                      {isExpiringSoon(item.expiration_date) && (
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
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="flex justify-end gap-2 px-4 py-4">
                    <button
                      onClick={() =>
                        navigate(`/admin/inventory/${item.inventory_id}`)
                      }
                      className="text-amber-500 hover:text-amber-700"
                      title="View Details"
                    >
                      <Eye size={20} weight="duotone" />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/admin/inventory/edit/${item.inventory_id}`)
                      }
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <Pencil size={20} weight="duotone" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
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
                  <p className="text-gray-500">No medications found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && sortedInventory.length > itemsPerPage && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to{' '}
            {Math.min(indexOfLastItem, sortedInventory.length)} of{' '}
            {sortedInventory.length} items
          </div>
          <div className="flex">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center rounded-l-lg border bg-gray-100 px-3 py-1 text-gray-700 ${
                currentPage === 1
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:text-amber-500'
              }`}
            >
              <CaretLeft size={14} weight="duotone" />
              Prev
            </button>

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`flex items-center rounded-r-lg border bg-gray-100 px-3 py-1 text-gray-700 ${
                currentPage === totalPages
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:text-amber-500'
              }`}
            >
              Next
              <CaretRight size={14} weight="duotone" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Medication"
        message={`Are you sure you want to delete the medication "${itemToDelete?.item_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
          setError(null);
        }}
      />
    </div>
  );
};

export default Medications;

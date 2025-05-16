import React, { useState, useEffect, useMemo } from 'react';
import { Plus, MagnifyingGlass, Pencil, Trash, SortAscending, SortDescending, X } from '@phosphor-icons/react';
import { ConfirmationModal } from '../../buyers/BuyerModal';
import api from '../../../../utils/api';
import ChickModal from './ChickModal';

const Chicks = ({ currentPage: parentCurrentPage, onPaginationChange }) => {
  // State variables
  const [chicks, setChicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chickToDelete, setChickToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [currentChick, setCurrentChick] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    field: 'hatched_date',
    direction: 'desc',
  });

  const chicksPerPage = 10;

  // Fetch chicks
  const fetchChicks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/chicks');
      setChicks(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load chicks. Please try again.');
      setLoading(false);
      console.error('Error fetching chicks:', err);
    }
  };

  useEffect(() => {
    fetchChicks();
  }, []);

  // Handle add/edit chick
  const handleAddClick = () => {
    setCurrentChick(null);
    setShowAddEditModal(true);
  };

  const handleEditClick = (chick) => {
    setCurrentChick(chick);
    setShowAddEditModal(true);
  };

  // Handle delete chick
  const handleDeleteClick = (chick) => {
    setChickToDelete(chick);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/chicks/${chickToDelete.chick_record_id}`);
      setChicks(
        chicks.filter(
          (chick) => chick.chick_record_id !== chickToDelete.chick_record_id
        )
      );
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error deleting chick record');
      console.error('Error deleting chick:', err);
    }
  };

  // Handle chick save (add/edit)
  const handleSaveChick = async (chickData) => {
    try {
      if (currentChick) {
        // Edit mode
        await api.put(`/api/chicks/${currentChick.chick_record_id}`, chickData);
      } else {
        // Add mode
        await api.post('/api/chicks', chickData);
      }
      fetchChicks(); // Refresh the list
      setShowAddEditModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error saving chick record');
      console.error('Error saving chick:', err);
      return false;
    }
    return true;
  };

  // Handle sorting
  const handleSort = (field) => {
    let direction = 'asc';
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
  };

  // Filter and sort chicks - memoize to avoid recalculation on every render
  const filteredAndSortedChicks = useMemo(() => {
    // First filter chicks
    const filtered = chicks.filter(
      (chick) =>
        chick.parent_breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chick.notes &&
          chick.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Then sort them
    return [...filtered].sort((a, b) => {
      const { field, direction } = sortConfig;

      if (field === 'hatched_date') {
        const dateA = new Date(a[field]);
        const dateB = new Date(b[field]);

        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (field === 'quantity') {
        return direction === 'asc'
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      }

      // For other fields
      const valueA = (a[field] || '').toString().toLowerCase();
      const valueB = (b[field] || '').toString().toLowerCase();

      if (direction === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  }, [chicks, searchTerm, sortConfig]);

  // Calculate pagination values - memoize to prevent unnecessary recalculations
  const paginationValues = useMemo(() => {
    const indexOfLastChick = parentCurrentPage * chicksPerPage;
    const indexOfFirstChick = indexOfLastChick - chicksPerPage;
    const currentChicks = filteredAndSortedChicks.slice(
      indexOfFirstChick,
      indexOfLastChick
    );
    const totalPages = Math.ceil(
      filteredAndSortedChicks.length / chicksPerPage
    );

    return {
      indexOfFirstChick,
      indexOfLastChick,
      currentChicks,
      totalPages,
    };
  }, [filteredAndSortedChicks, parentCurrentPage, chicksPerPage]);

  // Update parent component with pagination data when pagination values change
  useEffect(() => {
    onPaginationChange({
      totalItems: filteredAndSortedChicks.length,
      totalPages: paginationValues.totalPages,
      itemsPerPage: chicksPerPage,
      currentPageFirstItemIndex: paginationValues.indexOfFirstChick,
      currentPageLastItemIndex: Math.min(
        paginationValues.indexOfLastChick - 1,
        filteredAndSortedChicks.length - 1
      ),
      itemName: 'chicks',
    });
  }, [paginationValues, filteredAndSortedChicks.length, onPaginationChange]);

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
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <h2 className="text-xl font-semibold">Chick Inventory</h2>
        <div className="mt-2 sm:mt-0">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          >
            <Plus size={18} weight="bold" />
            Add New Chicks
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlass
              size={20}
              className="text-gray-400"
              weight="duotone"
            />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 pr-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
            placeholder="Search by parent breed or notes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              <X size={18} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* Chicks Table */}
      <div className="h-[calc(100vh-470px)] overflow-auto rounded-lg border border-gray-200 shadow-md">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('parent_breed')}
              >
                <div className="flex items-center">
                  Parent Breed
                  {getSortIcon('parent_breed')}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('hatched_date')}
              >
                <div className="flex items-center">
                  Hatched Date
                  {getSortIcon('hatched_date')}
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
              <th scope="col" className="px-4 py-3">
                Notes
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
            ) : paginationValues.currentChicks.length > 0 ? (
              paginationValues.currentChicks.map((chick) => (
                <tr
                  key={chick.chick_record_id}
                  className="border-b bg-white hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">
                    {chick.parent_breed}
                  </td>
                  <td className="px-4 py-4">
                    {formatDate(chick.hatched_date)}
                  </td>
                  <td className="px-4 py-4">{chick.quantity}</td>
                  <td className="max-w-xs truncate px-4 py-4">
                    {chick.notes || '-'}
                  </td>
                  <td className="flex justify-end gap-2 px-4 py-4">
                    <button
                      onClick={() => handleEditClick(chick)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <Pencil size={20} weight="duotone" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(chick)}
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
                <td
                  colSpan="6"
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No chicks found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Chick Record"
        message={`Are you sure you want to delete this chick record? This action cannot be undone and will affect inventory levels.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setChickToDelete(null);
          setError(null);
        }}
      />

      {/* Add/Edit Chick Modal */}
      <ChickModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        onSave={handleSaveChick}
        chick={currentChick}
      />
    </div>
  );
};

export default Chicks;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, MagnifyingGlass, Pencil, Trash, Eye, SortAscending, SortDescending, CaretLeft, CaretRight, X } from '@phosphor-icons/react';
import { ConfirmationModal } from '../../buyers/BuyerModal';
import api from '../../../../utils/api';
import EggModal from './EggModal';

const Eggs = ({ currentPage: parentCurrentPage, onPaginationChange }) => {
  // State variables
  const [eggs, setEggs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eggToDelete, setEggToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [currentEgg, setCurrentEgg] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    field: 'laid_date',
    direction: 'desc',
  });

  const eggsPerPage = 10;

  // Fetch eggs
  const fetchEggs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/eggs');
      setEggs(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load eggs. Please try again.');
      setLoading(false);
      console.error('Error fetching eggs:', err);
    }
  };

  useEffect(() => {
    fetchEggs();
  }, []);

  // Handle add/edit egg
  const handleAddClick = () => {
    setCurrentEgg(null);
    setShowAddEditModal(true);
  };

  const handleEditClick = (egg) => {
    setCurrentEgg(egg);
    setShowAddEditModal(true);
  };

  // Handle delete egg
  const handleDeleteClick = (egg) => {
    setEggToDelete(egg);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/eggs/${eggToDelete.egg_record_id}`);
      setEggs(
        eggs.filter((egg) => egg.egg_record_id !== eggToDelete.egg_record_id)
      );
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error deleting egg record');
      console.error('Error deleting egg:', err);
    }
  };

  // Handle egg save (add/edit)
  const handleSaveEgg = async (eggData) => {
    try {
      if (currentEgg) {
        // Edit mode
        await api.put(`/api/eggs/${currentEgg.egg_record_id}`, eggData);
      } else {
        // Add mode
        await api.post('/api/eggs', eggData);
      }
      fetchEggs(); // Refresh the list
      setShowAddEditModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error saving egg record');
      console.error('Error saving egg:', err);
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

  // Filter and sort eggs - memoize to avoid recalculation on every render
  const filteredAndSortedEggs = useMemo(() => {
    // First filter eggs
    const filtered = eggs.filter(
      (egg) =>
        egg.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
        egg.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (egg.notes &&
          egg.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Then sort them
    return [...filtered].sort((a, b) => {
      const { field, direction } = sortConfig;

      if (field === 'laid_date' || field === 'expiration_date') {
        const dateA = new Date(a[field]);
        const dateB = new Date(b[field]);

        return direction === 'asc' ? dateA - dateB : dateB - dateA;
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
  }, [eggs, searchTerm, sortConfig]);

  // Calculate pagination values - memoize to prevent unnecessary recalculations
  const paginationValues = useMemo(() => {
    const indexOfLastEgg = parentCurrentPage * eggsPerPage;
    const indexOfFirstEgg = indexOfLastEgg - eggsPerPage;
    const currentEggs = filteredAndSortedEggs.slice(
      indexOfFirstEgg,
      indexOfLastEgg
    );
    const totalPages = Math.ceil(filteredAndSortedEggs.length / eggsPerPage);

    return {
      indexOfFirstEgg,
      indexOfLastEgg,
      currentEggs,
      totalPages,
    };
  }, [filteredAndSortedEggs, parentCurrentPage, eggsPerPage]);
  // Ref to store previous pagination string to prevent circular updates
  const lastPaginationRef = useRef("");
  
  // Update parent component with pagination data when pagination values change
  useEffect(() => {
    // Create a pagination data object
    const paginationData = {
      totalItems: filteredAndSortedEggs.length,
      totalPages: paginationValues.totalPages,
      itemsPerPage: eggsPerPage,
      currentPageFirstItemIndex: paginationValues.indexOfFirstEgg,
      currentPageLastItemIndex: Math.min(
        paginationValues.indexOfLastEgg - 1,
        filteredAndSortedEggs.length - 1
      ),
      itemName: 'eggs',
    };
    
    // Use JSON.stringify to compare only when the actual content changes
    const paginationString = JSON.stringify(paginationData);
    
    // Only update if the pagination data actually changed
    if (lastPaginationRef.current !== paginationString) {
      lastPaginationRef.current = paginationString;
      onPaginationChange(paginationData);
    }
  }, [filteredAndSortedEggs.length, parentCurrentPage, paginationValues, onPaginationChange, eggsPerPage]);

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
        <h2 className="text-xl font-semibold">Egg Inventory</h2>
        <div className="mt-2 sm:mt-0">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          >
            <Plus size={18} weight="bold" />
            Add New Eggs
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
            placeholder="Search by size, color, or notes"
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

      {/* Eggs Table */}
      <div className="h-[calc(100vh-470px)] overflow-auto rounded-lg border border-gray-200 shadow-md">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('laid_date')}
              >
                <div className="flex items-center">
                  Laid Date
                  {getSortIcon('laid_date')}
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
                onClick={() => handleSort('size')}
              >
                <div className="flex items-center">
                  Size
                  {getSortIcon('size')}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('color')}
              >
                <div className="flex items-center">
                  Color
                  {getSortIcon('color')}
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
                <td colSpan="7" className="px-4 py-10 text-center">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
                  </div>
                </td>
              </tr>
            ) : paginationValues.currentEggs.length > 0 ? (
              paginationValues.currentEggs.map((egg) => (
                <tr
                  key={egg.egg_record_id}
                  className="border-b bg-white hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-4 py-4">
                    {formatDate(egg.laid_date)}
                  </td>
                  <td className="px-4 py-4">
                    {formatDate(egg.expiration_date)}
                  </td>
                  <td className="px-4 py-4">{egg.quantity}</td>
                  <td className="px-4 py-4">{egg.size}</td>
                  <td className="px-4 py-4">{egg.color}</td>
                  <td className="px-4 py-4">{egg.notes || '-'}</td>
                  <td className="flex justify-end gap-2 px-4 py-4">
                    <button
                      onClick={() => handleEditClick(egg)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <Pencil size={20} weight="duotone" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(egg)}
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
                  colSpan="7"
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No eggs found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Egg Record"
        message={`Are you sure you want to delete this egg record? This action cannot be undone and will affect inventory levels.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setEggToDelete(null);
          setError(null);
        }}
      />

      {/* Add/Edit Egg Modal */}
      <EggModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        onSave={handleSaveEgg}
        egg={currentEgg}
      />
    </div>
  );
};

export default Eggs;

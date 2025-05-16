import React, { useState, useEffect } from 'react';
import { Plus, MagnifyingGlass, Pencil, Trash, SortAscending, SortDescending, CaretLeft, CaretRight, X } from '@phosphor-icons/react';
import { ConfirmationModal } from '../../buyers/BuyerModal';
import api from '../../../../utils/api';
import ChickenModal from './ChickenModal';

const Chickens = ({ currentPage: parentCurrentPage, onPaginationChange }) => {
  // State variables
  const [chickens, setChickens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chickenToDelete, setChickenToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [currentChicken, setCurrentChicken] = useState(null);
  // Use parent's current page state instead of local state
  // const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    field: 'acquisition_date',
    direction: 'desc',
  });

  const chickensPerPage = 10;

  // Fetch chickens
  const fetchChickens = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/chickens');
      setChickens(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load chickens. Please try again.');
      setLoading(false);
      console.error('Error fetching chickens:', err);
    }
  };

  useEffect(() => {
    fetchChickens();
  }, []);

  // Handle add/edit chicken
  const handleAddClick = () => {
    setCurrentChicken(null);
    setShowAddEditModal(true);
  };

  const handleEditClick = (chicken) => {
    setCurrentChicken(chicken);
    setShowAddEditModal(true);
  };

  // Handle delete chicken
  const handleDeleteClick = (chicken) => {
    setChickenToDelete(chicken);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/chickens/${chickenToDelete.chicken_record_id}`);
      setChickens(
        chickens.filter(
          (chicken) =>
            chicken.chicken_record_id !== chickenToDelete.chicken_record_id
        )
      );
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error deleting chicken record');
      console.error('Error deleting chicken:', err);
    }
  };

  // Handle chicken save (add/edit)
  const handleSaveChicken = async (chickenData) => {
    try {
      if (currentChicken) {
        // Edit mode
        await api.put(
          `/api/chickens/${currentChicken.chicken_record_id}`,
          chickenData
        );
      } else {
        // Add mode
        await api.post('/api/chickens', chickenData);
      }
      fetchChickens(); // Refresh the list
      setShowAddEditModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error saving chicken record');
      console.error('Error saving chicken:', err);
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

  // Filter and sort chickens
  const filteredChickens = chickens.filter(
    (chicken) =>
      chicken.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chicken.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chicken.notes &&
        chicken.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedChickens = [...filteredChickens].sort((a, b) => {
    const { field, direction } = sortConfig;

    if (field === 'acquisition_date') {
      const dateA = new Date(a[field]);
      const dateB = new Date(b[field]);

      return direction === 'asc' ? dateA - dateB : dateB - dateA;
    }

    if (field === 'quantity' || field === 'age_weeks') {
      return direction === 'asc' ? a[field] - b[field] : b[field] - a[field];
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

  // Pagination
  const indexOfLastChicken = parentCurrentPage * chickensPerPage;
  const indexOfFirstChicken = indexOfLastChicken - chickensPerPage;
  const currentChickens = sortedChickens.slice(
    indexOfFirstChicken,
    indexOfLastChicken
  );
  const totalPages = Math.ceil(sortedChickens.length / chickensPerPage);
  
  // Update parent component with pagination data
  useEffect(() => {
    onPaginationChange({
      totalItems: sortedChickens.length,
      totalPages: totalPages,
      itemsPerPage: chickensPerPage,
      currentPageFirstItemIndex: indexOfFirstChicken,
      currentPageLastItemIndex: indexOfLastChicken - 1,
      itemName: "chickens"
    });
  }, [sortedChickens, parentCurrentPage, chickensPerPage, indexOfFirstChicken, indexOfLastChicken, totalPages, onPaginationChange]);

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
        <h2 className="text-xl font-semibold">Chicken Inventory</h2>
        <div className="mt-2 sm:mt-0">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          >
            <Plus size={18} weight="bold" />
            Add New Chickens
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
            placeholder="Search by breed, type, or notes"
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

      {/* Chickens Table */}
      <div className="h-[calc(100vh-470px)] overflow-auto rounded-lg border border-gray-200 shadow-md">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center">
                  Type
                  {getSortIcon('type')}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('breed')}
              >
                <div className="flex items-center">
                  Breed
                  {getSortIcon('breed')}
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
                onClick={() => handleSort('age_weeks')}
              >
                <div className="flex items-center">
                  Age (Weeks)
                  {getSortIcon('age_weeks')}
                </div>
              </th>
              <th
                scope="col"
                className="cursor-pointer px-4 py-3 hover:text-amber-600"
                onClick={() => handleSort('acquisition_date')}
              >
                <div className="flex items-center">
                  Acquisition Date
                  {getSortIcon('acquisition_date')}
                </div>
              </th>
              <th scope="col" className="px-4 py-3">
                <div className="flex items-center">Notes</div>
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
            ) : currentChickens.length > 0 ? (
              currentChickens.map((chicken) => (
                <tr
                  key={chicken.chicken_record_id}
                  className="border-b bg-white hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-4 py-4">
                    {chicken.type}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {chicken.breed}
                  </td>
                  <td className="px-4 py-4">{chicken.quantity}</td>
                  <td className="px-4 py-4">{chicken.age_weeks || '-'}</td>
                  <td className="px-4 py-4">
                    {formatDate(chicken.acquisition_date)}
                  </td>
                  <td className="px-4 py-4">{chicken.notes || '-'}</td>
                  <td className="flex justify-end gap-2 px-4 py-4">
                    <button
                      onClick={() => handleEditClick(chicken)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Edit"
                    >
                      <Pencil size={20} weight="duotone" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(chicken)}
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
                  No chickens found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Chicken Record"
        message={`Are you sure you want to delete this chicken record? This action cannot be undone and will affect inventory levels.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setChickenToDelete(null);
          setError(null);
        }}
      />

      {/* Add/Edit Chicken Modal */}
      <ChickenModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        onSave={handleSaveChicken}
        chicken={currentChicken}
      />
    </div>
  );
};

export default Chickens;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
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
} from '@phosphor-icons/react';
import { ConfirmationModal } from './BuyerModal';
import api from '../../../utils/api';

const Buyers = () => {
  const navigate = useNavigate();

  // State variables
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [buyerToDelete, setBuyerToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    field: 'first_name',
    direction: 'asc',
  });

  const buyersPerPage = 10;
  // Fetch buyers
  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/buyers');
      setBuyers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load buyers. Please try again.');
      setLoading(false);
      console.error('Error fetching buyers:', err);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  // Handle delete buyer
  const handleDeleteClick = (buyer) => {
    setBuyerToDelete(buyer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/buyers/${buyerToDelete.buyer_id}`);
      setBuyers(
        buyers.filter((buyer) => buyer.buyer_id !== buyerToDelete.buyer_id)
      );
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response.data.msg);
      console.error('Error deleting buyer:', err);
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

  // Filter and sort buyers
  const filteredBuyers = buyers.filter(
    (buyer) =>
      `${buyer.first_name} ${buyer.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (buyer.email &&
        buyer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      buyer.contact_number.includes(searchTerm)
  );

  const sortedBuyers = [...filteredBuyers].sort((a, b) => {
    const { field, direction } = sortConfig;

    // Handle nested fields (e.g., first_name + last_name for full name)
    if (field === 'name') {
      const fullNameA = `${a.first_name} ${a.last_name}`.toLowerCase();
      const fullNameB = `${b.first_name} ${b.last_name}`.toLowerCase();

      if (direction === 'asc') {
        return fullNameA.localeCompare(fullNameB);
      } else {
        return fullNameB.localeCompare(fullNameA);
      }
    }

    // For other fields
    const valueA = (a[field] || '').toLowerCase();
    const valueB = (b[field] || '').toLowerCase();

    if (direction === 'asc') {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  // Pagination
  const indexOfLastBuyer = currentPage * buyersPerPage;
  const indexOfFirstBuyer = indexOfLastBuyer - buyersPerPage;
  const currentBuyers = sortedBuyers.slice(indexOfFirstBuyer, indexOfLastBuyer);
  const totalPages = Math.ceil(sortedBuyers.length / buyersPerPage);

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
  return (
    <DashboardLayout>
      <div className="flex h-full flex-col rounded-lg bg-white p-6 shadow">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between">
          <h1 className="text-2xl font-bold">Buyers</h1>
          <div className="mt-2 sm:mt-0">
            <button
              onClick={() => navigate('/admin/buyers/add')}
              className="flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
            >
              <Plus size={18} weight="bold" />
              Add New Buyer
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
              placeholder="Search by name, email, or phone number"
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

        {/* Buyers Table */}
        <div className="h-[calc(100vh-336px)] overflow-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th
                  scope="col"
                  className="cursor-pointer px-4 py-3 hover:text-amber-600"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Buyer Name
                    {getSortIcon('name')}
                  </div>
                </th>
                <th scope="col" className="px-4 py-3">
                  Contact Number
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-4 py-3 hover:text-amber-600"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {getSortIcon('email')}
                  </div>
                </th>
                <th scope="col" className="px-4 py-3">
                  Address
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
                    </div>
                  </td>
                </tr>
              ) : currentBuyers.length > 0 ? (
                currentBuyers.map((buyer) => (
                  <tr
                    key={buyer.buyer_id}
                    className="border-b bg-white hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">
                      {buyer.first_name} {buyer.last_name}
                    </td>
                    <td className="px-4 py-4">{buyer.contact_number}</td>
                    <td className="px-4 py-4">{buyer.email || '-'}</td>
                    <td className="px-4 py-4">{buyer.address || '-'}</td>
                    <td className="flex justify-end gap-2 px-4 py-4">
                      <button
                        onClick={() =>
                          navigate(`/admin/buyers/${buyer.buyer_id}`)
                        }
                        className="text-amber-500 hover:text-amber-700"
                        title="View Details"
                      >
                        <Eye size={20} weight="duotone" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/buyers/edit/${buyer.buyer_id}`)
                        }
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        <Pencil size={20} weight="duotone" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(buyer)}
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
                    colSpan="5"
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No buyers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstBuyer + 1} to{' '}
              {Math.min(indexOfLastBuyer, sortedBuyers.length)} of{' '}
              {sortedBuyers.length} buyers
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
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Buyer"
        message={`Are you sure you want to delete the buyer "${buyerToDelete ? `${buyerToDelete.first_name} ${buyerToDelete.last_name}` : ''}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setBuyerToDelete(null);
          setError(null);
        }}
      />
    </DashboardLayout>
  );
};

export default Buyers;

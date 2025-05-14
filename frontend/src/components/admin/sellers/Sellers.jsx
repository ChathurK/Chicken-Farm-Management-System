import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { Plus, MagnifyingGlass, Pencil, Trash, Eye, SortAscending, SortDescending, X } from '@phosphor-icons/react';
import { ConfirmationModal } from './SellerModal';
import Pagination from '../../shared/Pagination';
import api from '../../../utils/api';

const Sellers = () => {
  const navigate = useNavigate();

  // State variables
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sellerToDelete, setSellerToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    field: 'first_name',
    direction: 'asc',
  });

  const sellersPerPage = 10;

  // Fetch sellers
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/sellers');
      setSellers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load sellers. Please try again.');
      setLoading(false);
      console.error('Error fetching sellers:', err);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // Handle delete seller
  const handleDeleteClick = (seller) => {
    setSellerToDelete(seller);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/sellers/${sellerToDelete.seller_id}`);
      setSellers(
        sellers.filter(
          (seller) => seller.seller_id !== sellerToDelete.seller_id
        )
      );
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response.data.msg);
      console.error('Error deleting seller:', err);
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

  // Filter and sort sellers
  const filteredSellers = sellers.filter(
    (seller) =>
      `${seller.first_name} ${seller.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (seller.email &&
        seller.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      seller.contact_number.includes(searchTerm)
  );

  const sortedSellers = [...filteredSellers].sort((a, b) => {
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
  const indexOfLastSeller = currentPage * sellersPerPage;
  const indexOfFirstSeller = indexOfLastSeller - sellersPerPage;
  const currentSellers = sortedSellers.slice(
    indexOfFirstSeller,
    indexOfLastSeller
  );
  const totalPages = Math.ceil(sortedSellers.length / sellersPerPage);

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
      <div className="flex flex-col rounded-lg h-full bg-white p-6 shadow">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between">
          <h1 className="text-2xl font-bold">Sellers</h1>
          <div className="mt-2 sm:mt-0">
            <button
              onClick={() => navigate('/admin/sellers/add')}
              className="flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
            >
              <Plus size={18} weight="bold" />
              Add New Seller
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
              <MagnifyingGlass size={20} className="text-gray-400" weight='duotone' />
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

        {/* Sellers Table */}
        <div className="h-[calc(100vh-336px)] overflow-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 sticky top-0">
              <tr>
                <th
                  scope="col"
                  className="cursor-pointer px-4 py-3 hover:text-amber-600"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Seller Name
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
              ) : currentSellers.length > 0 ? (
                currentSellers.map((seller) => (
                  <tr
                    key={seller.seller_id}
                    className="border-b bg-white hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900">
                      {seller.first_name} {seller.last_name}
                    </td>
                    <td className="px-4 py-4">{seller.contact_number}</td>
                    <td className="px-4 py-4">{seller.email || '-'}</td>
                    <td className="px-4 py-4">{seller.address || '-'}</td>
                    <td className="flex justify-end gap-2 px-4 py-4">
                      <button
                        onClick={() =>
                          navigate(`/admin/sellers/${seller.seller_id}`)
                        }
                        className="text-amber-500 hover:text-amber-700"
                        title="View Details"
                      >
                        <Eye size={20} weight="duotone" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/sellers/edit/${seller.seller_id}`)
                        }
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        <Pencil size={20} weight="duotone" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(seller)}
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
                    No sellers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedSellers.length}
          itemsPerPage={sellersPerPage}
          currentPageFirstItemIndex={indexOfFirstSeller}
          currentPageLastItemIndex={indexOfLastSeller - 1}
          onPageChange={setCurrentPage}
          itemName="sellers"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Seller"
        message={`Are you sure you want to delete the seller "${sellerToDelete ? `${sellerToDelete.first_name} ${sellerToDelete.last_name}` : ''}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSellerToDelete(null);
          setError(null);
        }}
      />
    </DashboardLayout>
  );
};

export default Sellers;

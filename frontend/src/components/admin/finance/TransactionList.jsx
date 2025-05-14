import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MagnifyingGlass, Funnel, ArrowUp, ArrowDown, Trash, Eye, Pencil, CurrencyDollar, ArrowsHorizontal, CaretRight, CaretLeft, Bird, Egg } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

const TransactionList = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);

  // Filtering and sorting state
  const [filters, setFilters] = useState({
    transaction_type: '',
    category: '',
    buyer_id: '',
    seller_id: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('transaction_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Options for dropdowns
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [transactionCategories] = useState([
    'Chicken Sale',
    'Chicken Purchase',
    'Chick Sale',
    'Chick Purchase',
    'Egg Sale',
    'Egg Purchase',
    'Inventory Purchase',
    'Other'
  ]);

  // Load transactions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch transactions with filters and sorting
        const queryParams = new URLSearchParams();

        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        // Add search query if exists
        if (searchQuery) queryParams.append('search', searchQuery);

        // Add sorting        queryParams.append('sortBy', sortBy);
        queryParams.append('sortDir', sortDirection);

        // Add pagination (handled on the frontend)
        const limit = perPage;

        // If paginating, calculate the offset (for frontend pagination only)
        const offset = (currentPage - 1) * perPage;

        console.log(`Fetching transactions with params: ${queryParams.toString()}`);

        // Fetch transactions
        const transactionsRes = await api.get(`/api/transactions?${queryParams.toString()}`);
        console.log('Transactions API response:', transactionsRes);

        // Handle the response data safely
        const transactionsData = Array.isArray(transactionsRes.data) ? transactionsRes.data : [];

        if (!Array.isArray(transactionsRes.data)) {
          console.warn('Expected transactions data to be an array but got:', typeof transactionsRes.data);
        }

        // Update state with the fetched transactions
        setTransactions(transactionsData);

        // Set pagination based on response
        if (transactionsData.length < perPage) {
          // If we got fewer results than the page size, we're on the last page
          setTotalPages(currentPage);
        } else {
          // Otherwise, there might be more pages
          setTotalPages(currentPage + 1);
        }

        // Fetch buyers and sellers for filters
        try {
          const [buyersRes, sellersRes] = await Promise.all([
            api.get('/api/buyers'),
            api.get('/api/sellers')
          ]);

          console.log('Buyers response:', buyersRes);
          console.log('Sellers response:', sellersRes);

          setBuyers(buyersRes.data || []);
          setSellers(sellersRes.data || []);
        } catch (err) {
          console.error('Error fetching buyers/sellers:', err);
          // Don't set error state here - allow the transactions to display
          // even if the filters data couldn't be loaded
        }

        setLoading(false);
      } catch (err) {
        setError('Error loading transactions. Please try again.');
        setLoading(false);
        console.error('Error fetching transactions:', err);
      }
    };

    fetchData();
  }, [filters, searchQuery, sortBy, sortDirection, currentPage, perPage]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      transaction_type: '',
      category: '',
      buyer_id: '',
      seller_id: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    });
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Chicken Sale':
      case 'Chicken Purchase':
      case 'Chick Sale':
      case 'Chick Purchase':
        return <Bird size={20} weight="duotone" className="text-amber-500" />;
      case 'Egg Sale':
      case 'Egg Purchase':
        return <Egg size={20} weight="duotone" className="text-amber-500" />;
      case 'Inventory Purchase':
        return <ArrowsHorizontal size={20} weight="duotone" className="text-amber-500" />;
      default:
        return <CurrencyDollar size={20} weight="duotone" className="text-amber-500" />;
    }
  };

  // Delete transaction
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/api/transactions/${id}`);
        setTransactions(transactions.filter(transaction => transaction.transaction_id !== id));
      } catch (err) {
        setError('Error deleting transaction. Please try again.');
        console.error('Error deleting transaction:', err);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Handle pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col rounded-lg bg-white p-6 shadow">
        {/* Header */}
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <button
            onClick={() => navigate('/admin/finance/transactions/add')}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <Plus size={20} weight="bold" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex w-full max-w-md items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  name="search"
                  placeholder="Search transactions..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlass size={20} className="text-gray-500" />
                </div>
              </div>
              <button
                type="submit"
                className="ml-2 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Search
              </button>
            </form>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <Funnel size={20} weight="duotone" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Transaction Type Filter */}
                <div>
                  <label htmlFor="transaction_type" className="mb-1 block text-sm font-medium text-gray-700">
                    Transaction Type
                  </label>
                  <select
                    id="transaction_type"
                    name="transaction_type"
                    value={filters.transaction_type}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  >
                    <option value="">All Types</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  >
                    <option value="">All Categories</option>
                    {transactionCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filters */}
                <div>
                  <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-gray-700">
                    From Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-gray-700">
                    To Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>

                {/* Amount Range Filters */}
                <div>
                  <label htmlFor="minAmount" className="mb-1 block text-sm font-medium text-gray-700">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    id="minAmount"
                    name="minAmount"
                    min="0"
                    value={filters.minAmount}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="maxAmount" className="mb-1 block text-sm font-medium text-gray-700">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    id="maxAmount"
                    name="maxAmount"
                    min="0"
                    value={filters.maxAmount}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>

                {/* Buyer Filter - Only show if transaction type is Income */}
                {(filters.transaction_type === 'Income' || filters.transaction_type === '') && (
                  <div>
                    <label htmlFor="buyer_id" className="mb-1 block text-sm font-medium text-gray-700">
                      Buyer
                    </label>
                    <select
                      id="buyer_id"
                      name="buyer_id"
                      value={filters.buyer_id}
                      onChange={handleFilterChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    >
                      <option value="">All Buyers</option>
                      {buyers.map((buyer) => (
                        <option key={buyer.buyer_id} value={buyer.buyer_id}>
                          {buyer.first_name} {buyer.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Seller Filter - Only show if transaction type is Expense */}
                {(filters.transaction_type === 'Expense' || filters.transaction_type === '') && (
                  <div>
                    <label htmlFor="seller_id" className="mb-1 block text-sm font-medium text-gray-700">
                      Seller
                    </label>
                    <select
                      id="seller_id"
                      name="seller_id"
                      value={filters.seller_id}
                      onChange={handleFilterChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    >
                      <option value="">All Sellers</option>
                      {sellers.map((seller) => (
                        <option key={seller.seller_id} value={seller.seller_id}>
                          {seller.first_name} {seller.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Filter Actions */}
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={resetFilters}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="rounded-lg bg-white shadow">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500"></div>
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="mb-4 text-lg text-red-600">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setCurrentPage(1);
                  resetFilters();
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <span>Try Again</span>
              </button>
            </div>
          ) : transactions && transactions.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="mb-4 text-lg text-gray-600">No transactions found</p>
              {Object.values(filters).some(value => value) || searchQuery ? (
                <button
                  onClick={() => {
                    resetFilters();
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="mb-4 inline-flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  <span>Clear All Filters</span>
                </button>
              ) : null}
              <button
                onClick={() => navigate('/admin/finance/transactions/add')}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <Plus size={20} weight="bold" />
                <span>Add New Transaction</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:px-6"
                      onClick={() => handleSort('transaction_id')}
                    >
                      <div className="flex items-center gap-1">
                        <span className="hidden sm:inline">ID</span>
                        <span className="sm:hidden">#</span>
                        {sortBy === 'transaction_id' && (
                          sortDirection === 'asc' ?
                            <ArrowUp size={14} weight="bold" /> :
                            <ArrowDown size={14} weight="bold" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:px-6"
                      onClick={() => handleSort('transaction_date')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        {sortBy === 'transaction_date' && (
                          sortDirection === 'asc' ?
                            <ArrowUp size={14} weight="bold" /> :
                            <ArrowDown size={14} weight="bold" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:px-6"
                      onClick={() => handleSort('transaction_type')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Type</span>
                        {sortBy === 'transaction_type' && (
                          sortDirection === 'asc' ?
                            <ArrowUp size={14} weight="bold" /> :
                            <ArrowDown size={14} weight="bold" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell md:px-6"
                      onClick={() => handleSort('category')}                  >
                      <div className="flex items-center gap-1">
                        <span>Category</span>
                        {sortBy === 'category' && (
                          sortDirection === 'asc' ?
                            <ArrowUp size={14} weight="bold" /> :
                            <ArrowDown size={14} weight="bold" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell md:px-6"
                    >
                      <span>Description</span>
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell md:px-6"
                    >
                      <span>Related Party</span>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:px-6"
                      onClick={() => handleSort('amount')}
                    >                    <div className="flex items-center gap-1">
                        <span>Amount</span>
                        {sortBy === 'amount' && (
                          sortDirection === 'asc' ?
                            <ArrowUp size={14} weight="bold" /> :
                            <ArrowDown size={14} weight="bold" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 md:px-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.transaction_id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/finance/transactions/${transaction.transaction_id}`)}
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 md:px-6">
                        {transaction.transaction_id || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 md:px-6">
                        {formatDate(transaction.transaction_date)}                    </td>
                      <td className="whitespace-nowrap px-4 py-4 md:px-6">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${transaction.transaction_type === 'Income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {transaction.transaction_type || 'Unknown'}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 md:table-cell md:px-6">
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(transaction.category || 'Other')}
                          <span>{transaction.category || 'Other'}</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 text-sm text-gray-500 md:table-cell md:px-6">
                        <div className="max-w-xs truncate">
                          {transaction.notes || 'No description'}
                        </div>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-gray-500 lg:table-cell md:px-6">
                        {transaction.transaction_type === 'Income'
                          ? transaction.buyer_name || 'N/A'
                          : transaction.seller_name || 'N/A'}                    </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm md:px-6">
                        <span className={`font-medium ${transaction.transaction_type === 'Income'
                            ? 'text-green-600'
                            : 'text-red-600'
                          }`}>
                          {transaction.transaction_type === 'Income' ? '+' : '-'}
                          ₹{parseFloat(transaction.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium md:px-6">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/finance/transactions/${transaction.transaction_id}`);
                            }}
                            className="text-amber-600 hover:text-amber-900"
                            title="View Details"
                          >
                            <Eye size={20} weight="duotone" />                        </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/finance/transactions/edit/${transaction.transaction_id}`);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Pencil size={20} weight="duotone" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(transaction.transaction_id);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash size={20} weight="duotone" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && transactions.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === 1
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-gray-50'
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === totalPages
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-gray-50'
                    }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {transactions.length > 0 ? (
                      <>
                        Showing <span className="font-medium">{Math.min((currentPage - 1) * perPage + 1, transactions.length)}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * perPage, transactions.length)}</span>{' '}
                        {totalPages > 1 && (
                          <>of approximately <span className="font-medium">{perPage * totalPages}</span></>
                        )}
                        {' '}results
                      </>
                    ) : (
                      'No transactions found'
                    )}
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${currentPage === 1
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-gray-50'
                        }`}
                    >
                      <span className="sr-only">Previous</span>
                      <CaretLeft size={18} weight="bold" />
                    </button>

                    {/* Page Numbers */}
                    {totalPages > 0 && [...Array(totalPages).keys()].map((page) => {
                      const pageNumber = page + 1;
                      const showPage =
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

                      // Show ellipsis for skipped pages
                      if (!showPage && pageNumber === currentPage - 2) {
                        return (
                          <span
                            key={`ellipsis-prev`}
                            className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }

                      if (!showPage && pageNumber === currentPage + 2) {
                        return (
                          <span
                            key={`ellipsis-next`}
                            className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`relative inline-flex items-center border ${pageNumber === currentPage
                              ? 'z-10 border-amber-500 bg-amber-50 text-amber-600'
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            } px-4 py-2 text-sm font-medium`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 ${currentPage === totalPages
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-gray-50'
                        }`}
                    >
                      <span className="sr-only">Next</span>
                      <CaretRight size={18} weight="bold" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransactionList;
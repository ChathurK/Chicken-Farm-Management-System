import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Funnel, SortAscending, SortDescending, Trash, Eye, Pencil, Coin, Barn, Bird, Egg } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import Pagination from '../../shared/Pagination';
import api from '../../../utils/api';

const TransactionList = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

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

        // Add sorting
        queryParams.append('sortBy', sortBy);
        queryParams.append('sortDir', sortDirection);

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
  }, [filters, sortBy, sortDirection, currentPage]);

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
        return <Barn size={20} weight="duotone" className="text-amber-500" />;
      default:
        return <Coin size={20} weight="duotone" className="text-amber-500" />;
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

  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col overflow-y-auto rounded-lg bg-white p-6 shadow">
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h1 className="text-2xl font-bold">Transactions</h1>

            <div className="flex items-center gap-4">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:border-amber-500 focus:outline-none"
              >
                <Funnel size={20} weight="duotone" className={showFilters ? 'text-amber-500' : 'text-gray-500'} />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </button>
              <button
                onClick={() => navigate('/admin/finance/transactions/add')}
                className="flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
              >
                <Plus size={20} weight="bold" />
                <span>Add Transaction</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Transaction Type Filter */}
                <div>
                  <label
                    htmlFor="transaction_type"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
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
                  <label
                    htmlFor="category"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
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
                  <label
                    htmlFor="startDate"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
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
                  <label
                    htmlFor="endDate"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
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
                  <label
                    htmlFor="minAmount"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
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
                  <label
                    htmlFor="maxAmount"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
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
                {(filters.transaction_type === 'Income' ||
                  filters.transaction_type === '') && (
                    <div>
                      <label
                        htmlFor="buyer_id"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
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
                {(filters.transaction_type === 'Expense' ||
                  filters.transaction_type === '') && (
                    <div>
                      <label
                        htmlFor="seller_id"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
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
        <div className="rounded-lg bg-white shadow-md">
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
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <span>Try Again</span>
              </button>
            </div>
          ) : transactions && transactions.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="mb-4 text-lg text-gray-600">
                No transactions found
              </p>
              {Object.values(filters).some((value) => value) ? (
                <button
                  onClick={() => {
                    resetFilters();
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
            <div className="h-[calc(100vh-304px)] overflow-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:px-4 cursor-pointer hover:text-amber-500"
                      onClick={() => handleSort('transaction_date')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        {sortBy === 'transaction_date' &&
                          (sortDirection === 'asc' ? (
                            <SortAscending size={14} weight="bold" />
                          ) : (
                            <SortDescending size={14} weight="bold" />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:px-4"
                    >
                      <div className="flex items-center gap-1">
                        <span>Type</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell md:px-4"
                    >
                      <div className="flex items-center gap-1">
                        <span>Category</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell md:px-4"
                    >
                      <span>Description</span>
                    </th>
                    <th
                      scope="col"
                      className="hidden px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:px-4 lg:table-cell"
                    >
                      <span>Related Party</span>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:px-4 cursor-pointer hover:text-amber-500"
                      onClick={() => handleSort('amount')}
                    >
                      {' '}
                      <div className="flex items-center gap-1">
                        <span>Amount</span>
                        {sortBy === 'amount' &&
                          (sortDirection === 'asc' ? (
                            <SortAscending size={14} weight="bold" />
                          ) : (
                            <SortDescending size={14} weight="bold" />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 md:px-4"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {currentTransactions.map((transaction) => (
                    <tr
                      key={transaction.transaction_id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        navigate(
                          `/admin/finance/transactions/${transaction.transaction_id}`
                        )
                      }
                    >
                      <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500 md:px-4">
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 md:px-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${transaction.transaction_type === 'Income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {transaction.transaction_type || 'Unknown'}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-2 py-4 text-sm text-gray-500 md:table-cell md:px-4">
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(transaction.category || 'Other')}
                          <span>{transaction.category || 'Other'}</span>
                        </div>
                      </td>
                      <td className="hidden px-2 py-4 text-sm text-gray-500 md:table-cell md:px-4">
                        <div className="max-w-xs truncate">
                          {transaction.notes || 'No description'}
                        </div>
                      </td>
                      <td className="hidden whitespace-nowrap px-2 py-4 text-sm text-gray-500 md:px-4 lg:table-cell">
                        {transaction.transaction_type === 'Income'
                          ? transaction.buyer_name || 'N/A'
                          : transaction.seller_name || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-sm md:px-4">
                        <span
                          className={`font-medium ${transaction.transaction_type === 'Income'
                            ? 'text-green-600'
                            : 'text-red-600'
                            }`}
                        >
                          {transaction.transaction_type === 'Income'
                            ? '+'
                            : '-'}
                          LKR{' '}
                          {parseFloat(transaction.amount || 0).toLocaleString(
                            'en-US',
                            { minimumFractionDigits: 2 }
                          )}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-right text-sm font-medium md:px-4">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/admin/finance/transactions/${transaction.transaction_id}`
                              );
                            }}
                            className="text-amber-600 hover:text-amber-900"
                            title="View Details"
                          >
                            <Eye size={20} weight="duotone" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/admin/finance/transactions/edit/${transaction.transaction_id}`
                              );
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
        </div>

        {/* Pagination */}
        {!loading && transactions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={transactions.length}
            itemsPerPage={transactionsPerPage}
            currentPageFirstItemIndex={indexOfFirstTransaction}
            currentPageLastItemIndex={indexOfLastTransaction - 1}
            onPageChange={setCurrentPage}
            itemName="transactions"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TransactionList;
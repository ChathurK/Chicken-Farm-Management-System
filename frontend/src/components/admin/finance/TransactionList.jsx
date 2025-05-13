import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MagnifyingGlass, CaretDown, ArrowUp, ArrowDown, DotsThree, Funnel, Export, Printer } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

const TransactionList = () => {
  const navigate = useNavigate();

  // State for transactions
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filtering and pagination
  const [filters, setFilters] = useState({
    transaction_type: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    description: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Prepare query string from filters
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        const response = await api.get(`/api/transactions?${queryParams}`);
        setTransactions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load transactions. Please try again.');
        setLoading(false);
        console.error('Error fetching transactions:', err);
      }
    };

    fetchTransactions();
  }, [filters]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      transaction_type: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      description: '',
    });
    // setShowFilters(false);
  };

  const handleAddTransaction = () => {
    navigate('/admin/finance/transactions/add');
  };

  const handleViewTransaction = (id) => {
    navigate(`/admin/finance/transactions/${id}`);
  };

  // Calculate pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Financial Transactions</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none`}
          >
            <Funnel size={20} className={showFilters ? 'text-amber-500' : ''} weight='duotone' />
            Filters
          </button>
          <button
            onClick={handleAddTransaction}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <Plus size={20} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <h2 className="mb-4 text-lg font-medium">Filter Transactions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Transaction Type
              </label>
              <select
                name="transaction_type"
                value={filters.transaction_type}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Min Amount
              </label>
              <input
                type="number"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Amount
              </label>
              <input
                type="number"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={filters.description}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Search in description"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="mr-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Transaction Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500"></div>
        </div>
      ) : error ? (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          <p>{error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <p className="text-gray-500">No transactions found.</p>
          <button
            onClick={handleAddTransaction}
            className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            Add Your First Transaction
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Related To
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
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
                      handleViewTransaction(transaction.transaction_id)
                    }
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(transaction.transaction_date)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          transaction.transaction_type === 'Income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.transaction_type === 'Income' ? (
                          <ArrowUp size={12} className="mr-1" />
                        ) : (
                          <ArrowDown size={12} className="mr-1" />
                        )}
                        {transaction.transaction_type.charAt(0).toUpperCase() +
                          transaction.transaction_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.buyer_name ||
                        transaction.seller_name ||
                        transaction.item_name ||
                        'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <span
                        className={
                          transaction.transaction_type === 'Income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTransaction(transaction.transaction_id);
                        }}
                        className="text-amber-600 hover:text-amber-900"
                      >
                        <DotsThree size={24} weight="bold" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {indexOfFirstTransaction + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {indexOfLastTransaction > transactions.length
                        ? transactions.length
                        : indexOfLastTransaction}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{transactions.length}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setCurrentPage((old) => Math.max(old - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      Previous
                    </button>
                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={`relative inline-flex items-center border ${
                          currentPage === number
                            ? 'z-10 border-amber-500 bg-amber-50 text-amber-600'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        } px-4 py-2 text-sm font-medium`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((old) => Math.min(old + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export and Print Options */}
      {transactions.length > 0 && (
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => console.log('Print functionality to be implemented')}
          >
            <Printer size={16} />
            Print
          </button>
          <button
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() =>
              console.log('Export functionality to be implemented')
            }
          >
            <Export size={16} />
            Export
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TransactionList;

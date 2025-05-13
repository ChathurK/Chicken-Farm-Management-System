import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, Coins , Clock, ChatText, UserCircle, ShoppingBag, ArrowUp, ArrowDown } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/transactions/${id}`);
        setTransaction(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setTransaction(false);
        } else {
          setError('Failed to load transaction details. Please try again.');
        }
        setLoading(false);
        console.error('Error fetching transaction details:', err);
      }
    };

    fetchTransactionDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/transactions/${id}`);
      navigate('/admin/finance/transactions');
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          'An error occurred while deleting the transaction.'
      );
      console.error('Error deleting transaction:', err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          <p>{error}</p>
          <button
            onClick={() => navigate('/admin/finance/transactions')}
            className="mt-2 text-red-700 underline hover:text-red-800"
          >
            Return to Transactions List
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!transaction) {
    return (
      <DashboardLayout>
        <div className="py-8 text-center">
          <p className="text-gray-500">Transaction not found.</p>
          <button
            onClick={() => navigate('/admin/finance/transactions')}
            className="mt-2 text-amber-500 hover:text-amber-600"
          >
            Return to Transactions List
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="rounded-lg bg-white p-6 shadow">
        {/* Header with back button and actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between">
          <div className="mb-2 flex items-center sm:mb-0">
            <button
              onClick={() => navigate('/admin/finance/transactions')}
              className="mr-4 text-gray-600 hover:text-amber-500"
            >
              <ArrowLeft size={24} weight="duotone" />
            </button>
            <h1 className="text-2xl font-bold">Transaction Details</h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/admin/finance/transactions/edit/${id}`)}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <Pencil size={18} weight="bold" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <Trash size={18} weight="bold" />
              Delete
            </button>
          </div>
        </div>

        {/* Transaction Type Badge */}
        <div className="mb-6">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              transaction.transaction_type === 'Income'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {transaction.transaction_type === 'Income' ? (
              <ArrowUp size={16} className="mr-1" />
            ) : (
              <ArrowDown size={16} className="mr-1" />
            )}
            {transaction.transaction_type.charAt(0).toUpperCase() +
              transaction.transaction_type.slice(1)}
          </span>
        </div>

        {/* Transaction details card */}
        <div className="mb-8 rounded-lg bg-gray-50 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Coins
                size={24}
                weight="duotone"
                className="mt-0.5 text-amber-500"
              />
              <div>
                <h3 className="text-sm text-gray-500">Amount</h3>
                <p
                  className={`text-lg font-medium ${
                    transaction.transaction_type === 'Income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock
                size={24}
                weight="duotone"
                className="mt-0.5 text-amber-500"
              />
              <div>
                <h3 className="text-sm text-gray-500">Transaction Date</h3>
                <p className="font-medium text-gray-800">
                  {formatDate(transaction.transaction_date)}
                </p>
              </div>
            </div>

            {transaction.buyer_name && (
              <div className="flex items-start gap-3">
                <UserCircle
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Buyer</h3>
                  <p className="font-medium text-gray-800">
                    {transaction.buyer_name}
                  </p>
                </div>
              </div>
            )}

            {transaction.seller_name && (
              <div className="flex items-start gap-3">
                <UserCircle
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Seller</h3>
                  <p className="font-medium text-gray-800">
                    {transaction.seller_name}
                  </p>
                </div>
              </div>
            )}

            {transaction.item_name && (
              <div className="flex items-start gap-3">
                <ShoppingBag
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Inventory Item</h3>
                  <p className="font-medium text-gray-800">
                    {transaction.item_name}
                    {transaction.category && (
                      <span className="ml-1 text-gray-500">
                        ({transaction.category})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 md:col-span-2">
              <ChatText
                size={24}
                weight="duotone"
                className="mt-0.5 text-amber-500"
              />
              <div>
                <h3 className="text-sm text-gray-500">Description</h3>
                <p className="font-medium text-gray-800">
                  {transaction.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="mb-3 text-sm font-medium text-gray-500">
            Transaction Information
          </h3>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
            <div>Transaction ID: {transaction.transaction_id}</div>
            <div>
              Created:{' '}
              {formatDate(
                transaction.created_at || transaction.transaction_date
              )}
            </div>
            {transaction.updated_at && (
              <div>Last Updated: {formatDate(transaction.updated_at)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Confirm Deletion
            </h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TransactionDetails;

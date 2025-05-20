import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, CalendarDots, ArrowsDownUp, ChatText, UserCircle, ShoppingBag, Bird, Egg, Tag, Receipt, ClockClockwise, CircleWavyCheck } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

const TransactionDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/transactions/${id}`);
        setTransaction(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading transaction. Please try again.');
        setLoading(false);
        console.error('Error fetching transaction details:', err);
      }
    };
    
    fetchTransaction();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/api/transactions/${id}`);
        navigate('/admin/finance/transactions');
      } catch (err) {
        setError('Error deleting transaction. Please try again.');
        console.error('Error deleting transaction:', err);
      }
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
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTransactionTypeColor = (type) => {
    return type === 'Income' ? 'text-green-600' : 'text-red-600';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Chicken Sale':
      case 'Chicken Purchase':
        return <Bird size={24} weight="duotone" className="text-amber-500" />;
      case 'Chick Sale':
      case 'Chick Purchase':
        return <Bird size={24} weight="duotone" className="text-amber-500" />;
      case 'Egg Sale':
      case 'Egg Purchase':
        return <Egg size={24} weight="duotone" className="text-amber-500" />;
      case 'Inventory Purchase':
        return <ShoppingBag size={24} weight="duotone" className="text-amber-500" />;
      default:
        return <Tag size={24} weight="duotone" className="text-amber-500" />;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/finance/transactions')}
            className="mr-4 text-gray-600 hover:text-amber-500"
          >
            <ArrowLeft size={24} weight="duotone" />
          </button>
          <h1 className="text-2xl font-bold">Transaction Details</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/admin/finance/transactions/edit/${id}`)}
            className="inline-flex items-center rounded-md border border-transparent bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <Pencil size={18} className="mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <Trash size={18} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      ) : transaction ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Transaction Information */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center">
                  <div className={`mr-3 rounded-full p-2 ${
                    transaction.transaction_type === 'Income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <ArrowsDownUp size={24} weight="bold" className={getTransactionTypeColor(transaction.transaction_type)} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      Transaction #{transaction.transaction_id}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {transaction.transaction_type} - {transaction.category}
                    </p>
                  </div>
                </div>
                <div>
                  <span className={`text-2xl font-bold ${getTransactionTypeColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type === 'Income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <CalendarDots size={20} className="mr-2 mt-1 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-700">Transaction Date</p>
                    <p>{formatDate(transaction.transaction_date)}</p>
                  </div>
                </div>

                {/* Transaction Category */}
                <div className="flex items-start">
                  {getCategoryIcon(transaction.category)}
                  <div className="ml-2">
                    <p className="font-medium text-gray-700">Category</p>
                    <p>{transaction.category}</p>
                  </div>
                </div>

                {/* Buyer/Seller Information */}
                {transaction.transaction_type === 'Income' && transaction.buyer_name && (
                  <div className="flex items-start">
                    <UserCircle size={20} className="mr-2 mt-1 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-700">Buyer</p>
                      <p>{transaction.buyer_name}</p>
                    </div>
                  </div>
                )}

                {transaction.transaction_type === 'Expense' && transaction.seller_name && (
                  <div className="flex items-start">
                    <UserCircle size={20} className="mr-2 mt-1 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-700">Seller</p>
                      <p>{transaction.seller_name}</p>
                    </div>
                  </div>
                )}

                {/* Inventory Information */}
                {transaction.inventory_id && (
                  <div className="flex items-start">
                    <ShoppingBag size={20} className="mr-2 mt-1 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-700">Inventory Item</p>
                      <p>{transaction.item_name} ({transaction.inventory_category})</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="flex items-start">
                  <ChatText size={20} className="mr-2 mt-1 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-700">Description</p>
                    <p className="whitespace-pre-wrap">{transaction.notes || 'No description provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Information */}
          <div className="space-y-6">
            {/* Transaction Status */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">Transaction Status</h2>
              <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 text-green-700">
                <CircleWavyCheck size={20} weight="duotone" />
                <span>Completed</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm font-medium">{formatDateTime(transaction.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm font-medium">{formatDateTime(transaction.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Livestock Details - Only show for livestock-related transactions */}
            {(transaction.chicken_record_id || transaction.chick_record_id || transaction.egg_record_id) && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold">Livestock Details</h2>
                <div className="space-y-4">
                  {/* Chicken Details */}
                  {transaction.chicken_record_id && (
                    <>
                      <div className="flex items-start">
                        <Bird size={20} className="mr-2 mt-1 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-700">Chicken Type</p>
                          <p>{transaction.chicken_type}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Tag size={20} className="mr-2 mt-1 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-700">Breed</p>
                          <p>{transaction.chicken_breed}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Chick Details */}
                  {transaction.chick_record_id && (
                    <>
                      <div className="flex items-start">
                        <Bird size={20} className="mr-2 mt-1 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-700">Chick Parent Breed</p>
                          <p>{transaction.chick_parent_breed}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CalendarDots size={20} className="mr-2 mt-1 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-700">Hatched Date</p>
                          <p>{transaction.hatched_date ? formatDate(transaction.hatched_date) : 'Not specified'}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Egg Details */}
                  {transaction.egg_record_id && (
                    <>
                      <div className="flex items-start">
                        <Egg size={20} className="mr-2 mt-1 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-700">Egg Size</p>
                          <p>{transaction.egg_size}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Tag size={20} className="mr-2 mt-1 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-700">Egg Color</p>
                          <p>{transaction.egg_color}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Related Actions */}
            {/* <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">Related Actions</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/admin/finance/reports')} 
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 p-3 text-left hover:bg-amber-50"
                >
                  <div className="flex items-center">
                    <Receipt size={20} className="mr-2 text-amber-500" />
                    <span>View Financial Reports</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/admin/finance/transactions')} 
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 p-3 text-left hover:bg-amber-50"
                >
                  <div className="flex items-center">
                    <ClockClockwise size={20} className="mr-2 text-amber-500" />
                    <span>Transaction History</span>
                  </div>
                </button>
              </div>
            </div> */}
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
          <p>Transaction not found.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TransactionDetails;
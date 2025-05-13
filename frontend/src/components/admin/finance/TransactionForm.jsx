import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FloppyDisk,
  CurrencyDollar,
  CalendarBlank,
  ChatText,
  UserCircle,
  ShoppingBag,
} from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

const TransactionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    transaction_type: 'expense',
    amount: '',
    description: '',
    buyer_id: '',
    seller_id: '',
    inventory_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  // Status states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Options for dropdowns
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  // Load transaction data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch buyers, sellers, and inventory for dropdowns
        const [buyersRes, sellersRes, inventoryRes] = await Promise.all([
          api.get('/api/buyers'),
          api.get('/api/sellers'),
          api.get('/api/inventory'),
        ]);

        setBuyers(buyersRes.data);
        setSellers(sellersRes.data);
        setInventoryItems(inventoryRes.data);

        // If in edit mode, fetch transaction data
        if (isEditMode) {
          const transactionRes = await api.get(`/api/transactions/${id}`);
          const transactionData = transactionRes.data;

          // Format transaction date
          if (transactionData.transaction_date) {
            transactionData.transaction_date = new Date(
              transactionData.transaction_date
            )
              .toISOString()
              .split('T')[0];
          }

          setFormData(transactionData);
        }

        setLoading(false);
      } catch (err) {
        setError('Error loading data. Please try again.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Handle input changes
  const handleChange = (e) => {
    setError(null); // Clear error when user types
    const { name, value } = e.target;

    // Clear related field values when transaction type changes
    if (name === 'transaction_type') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        buyer_id: value === 'income' ? '' : prev.buyer_id,
        seller_id: value === 'expense' ? '' : prev.seller_id,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear field-specific error when user types in that field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.transaction_type) {
      errors.transaction_type = 'Transaction type is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than zero';
    }

    if (!formData.description) {
      errors.description = 'Description is required';
    }

    // For income transactions, require buyer_id
    if (formData.transaction_type === 'income' && !formData.buyer_id) {
      errors.buyer_id = 'Buyer is required for income transactions';
    }

    // For expense transactions, require seller_id
    if (formData.transaction_type === 'expense' && !formData.seller_id) {
      errors.seller_id = 'Seller is required for expense transactions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Convert empty strings to null for the API
      const apiData = { ...formData };
      for (const key in apiData) {
        if (apiData[key] === '') {
          apiData[key] = null;
        }
      }

      if (isEditMode) {
        await api.put(`/api/transactions/${id}`, apiData);
      } else {
        await api.post('/api/transactions', apiData);
      }

      navigate('/admin/finance/transactions');
    } catch (err) {
      setError(
        err.response?.data?.msg || 'An error occurred. Please try again.'
      );
      setSubmitting(false);
      console.error('Error saving transaction:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/admin/finance/transactions')}
          className="mr-4 text-gray-600 hover:text-amber-500"
        >
          <ArrowLeft size={24} weight="duotone" />
        </button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Transaction' : 'Add New Transaction'}
        </h1>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-6 shadow">
          {error && (
            <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {/* Transaction Type */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Transaction Type <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="transaction_type"
                      value="income"
                      checked={formData.transaction_type === 'income'}
                      onChange={handleChange}
                      className="h-4 w-4 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="ml-2 text-sm text-gray-700">Income</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="transaction_type"
                      value="expense"
                      checked={formData.transaction_type === 'expense'}
                      onChange={handleChange}
                      className="h-4 w-4 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="ml-2 text-sm text-gray-700">Expense</span>
                  </label>
                </div>
                {formErrors.transaction_type && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.transaction_type}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <CurrencyDollar size={20} className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className={`block w-full rounded-md border ${
                      formErrors.amount ? 'border-red-300' : 'border-gray-300'
                    } py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    placeholder="0.00"
                  />
                </div>
                {formErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.amount}
                  </p>
                )}
              </div>

              {/* Transaction Date */}
              <div>
                <label
                  htmlFor="transaction_date"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Transaction Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <CalendarBlank size={20} className="text-gray-500" />
                  </div>
                  <input
                    type="date"
                    id="transaction_date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Buyer - only show for income transactions */}
              {formData.transaction_type === 'income' && (
                <div>
                  <label
                    htmlFor="buyer_id"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Buyer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <UserCircle size={20} className="text-gray-500" />
                    </div>
                    <select
                      id="buyer_id"
                      name="buyer_id"
                      value={formData.buyer_id}
                      onChange={handleChange}
                      className={`block w-full rounded-md border ${
                        formErrors.buyer_id
                          ? 'border-red-300'
                          : 'border-gray-300'
                      } py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    >
                      <option value="">Select a Buyer</option>
                      {buyers.map((buyer) => (
                        <option key={buyer.buyer_id} value={buyer.buyer_id}>
                          {buyer.first_name} {buyer.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formErrors.buyer_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.buyer_id}
                    </p>
                  )}
                </div>
              )}

              {/* Seller - only show for expense transactions */}
              {formData.transaction_type === 'expense' && (
                <div>
                  <label
                    htmlFor="seller_id"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Seller <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <UserCircle size={20} className="text-gray-500" />
                    </div>
                    <select
                      id="seller_id"
                      name="seller_id"
                      value={formData.seller_id}
                      onChange={handleChange}
                      className={`block w-full rounded-md border ${
                        formErrors.seller_id
                          ? 'border-red-300'
                          : 'border-gray-300'
                      } py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    >
                      <option value="">Select a Seller</option>
                      {sellers.map((seller) => (
                        <option key={seller.seller_id} value={seller.seller_id}>
                          {seller.first_name} {seller.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formErrors.seller_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.seller_id}
                    </p>
                  )}
                </div>
              )}

              {/* Inventory Item - optional for both transaction types */}
              <div>
                <label
                  htmlFor="inventory_id"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Related Inventory Item
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <ShoppingBag size={20} className="text-gray-500" />
                  </div>
                  <select
                    id="inventory_id"
                    name="inventory_id"
                    value={formData.inventory_id || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  >
                    <option value="">None</option>
                    {inventoryItems.map((item) => (
                      <option key={item.inventory_id} value={item.inventory_id}>
                        {item.item_name} - {item.category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <ChatText size={20} className="text-gray-500" />
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className={`block w-full rounded-md border ${
                      formErrors.description
                        ? 'border-red-300'
                        : 'border-gray-300'
                    } py-2 pl-10 pr-4 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    placeholder="Describe the transaction..."
                  ></textarea>
                </div>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/finance/transactions')}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FloppyDisk size={18} weight="bold" />
                    Save Transaction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TransactionForm;

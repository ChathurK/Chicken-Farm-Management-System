import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { ArrowLeft, Pencil, Tag, ShoppingCart, Calendar, CurrencyCircleDollar, Ruler, Package, ArrowsClockwise } from '@phosphor-icons/react';
import api from '../../../utils/api';
import TransactionTracker from './tracking/TransactionTracker';

const InventoryDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Fetch inventory item data
  useEffect(() => {
    const fetchInventoryItem = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/inventory/${id}`);
        setInventory(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load inventory item. Please try again.');
        setLoading(false);
        console.error('Error fetching inventory item:', err);
      }
    };

    fetchInventoryItem();
  }, [id]);

  // Update inventory after changes
  const handleInventoryUpdate = (updatedInventory) => {
    setInventory(updatedInventory);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Low':
        return 'bg-yellow-100 text-yellow-800';
      case 'Finished':
        return 'bg-red-100 text-red-800';
      case 'Expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="rounded-lg bg-white p-6 shadow">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={24} weight="duotone" />
            </button>
            <h1 className="text-2xl font-bold">Inventory Details</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/employee/inventory/update/${id}`)}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <Pencil size={18} weight="bold" />
              Update
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        {!loading && inventory && (
          <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              onClick={() => setShowTransactionModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-green-500 bg-green-50 px-3 py-2 text-sm text-green-700 hover:bg-green-100"
            >
              <ArrowsClockwise size={18} weight="duotone" />
              Record Transaction
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Loading spinner */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
          </div>
        ) : inventory ? (
          <div>
            {/* Status Badge */}
            <div className="mb-6">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${getStatusColor(
                  inventory.status
                )}`}
              >
                {inventory.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="mb-8 grid grid-cols-1 gap-6 rounded-lg bg-gray-50 p-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Package
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Category</h3>
                  <p className="font-medium text-gray-800">
                    {inventory.category}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Item Name</h3>
                  <p className="font-medium text-gray-800">
                    {inventory.item_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShoppingCart
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Quantity</h3>
                  <p className="font-medium text-gray-800">
                    {inventory.quantity} {inventory.unit}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Ruler
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Unit</h3>
                  <p className="font-medium text-gray-800">{inventory.unit}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CurrencyCircleDollar
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Cost per Unit</h3>
                  <p className="font-medium text-gray-800">
                    {formatCurrency(inventory.cost_per_unit)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Purchase Date</h3>
                  <p className="font-medium text-gray-800">
                    {formatDate(inventory.purchase_date)}
                  </p>
                </div>
              </div>

              {inventory.expiration_date && (
                <div className="flex items-start gap-3">
                  <Calendar
                    size={24}
                    weight="duotone"
                    className="mt-0.5 text-amber-500"
                  />
                  <div>
                    <h3 className="text-sm text-gray-500">Expiration Date</h3>
                    <p className="font-medium text-gray-800">
                      {formatDate(inventory.expiration_date)}
                    </p>
                  </div>
                </div>
              )}

              {inventory.threshold && (
                <div className="flex items-start gap-3">
                  <ShoppingCart
                    size={24}
                    weight="duotone"
                    className="mt-0.5 text-amber-500"
                  />
                  <div>
                    <h3 className="text-sm text-gray-500">Low Stock Threshold</h3>
                    <p className="font-medium text-gray-800">
                      {inventory.threshold} {inventory.unit}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-10">
            <p className="text-gray-500">Inventory item not found.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
            >
              Go Back
            </button>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionTracker 
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        inventoryItem={inventory}
        onTransaction={handleInventoryUpdate}
      />
    </DashboardLayout>
  );
};

export default InventoryDetails;

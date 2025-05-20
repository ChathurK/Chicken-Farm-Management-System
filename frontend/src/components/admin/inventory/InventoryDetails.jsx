import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { ArrowLeft, Pencil, Trash, Tag, ShoppingCart, ClockCounterClockwise, Calendar, Warning, CurrencyCircleDollar, Ruler, Package, ArrowsClockwise, Bell } from '@phosphor-icons/react';
import { ConfirmationModal } from './InventoryModal';
import api from '../../../utils/api';
import ThresholdSettings from './settings/ThresholdSettings';
import ExpirationTracker from './tracking/ExpirationTracker';
import TransactionTracker from './tracking/TransactionTracker';

const InventoryDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
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

  // Handle delete
  const handleDelete = async () => {
    try {
      await api.delete(`/api/inventory/${id}`);
      navigate(`/admin/inventory/${inventory.category.toLowerCase()}`);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          'Failed to delete inventory item. Please try again.'
      );
      console.error('Error deleting inventory item:', err);
    }
  };

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
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate days until expiration
  const getDaysUntilExpiration = (expirationDate) => {
    if (!expirationDate) return null;

    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
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
              onClick={() => navigate(`/admin/inventory/edit/${id}`)}
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

        {/* Quick Action Buttons */}
        {/* {!loading && inventory && (
          <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              onClick={() => setShowTransactionModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-green-500 bg-green-50 px-3 py-2 text-sm text-green-700 hover:bg-green-100"
            >
              <ArrowsClockwise size={18} weight="duotone" />
              Record Transaction
            </button>
            <button
              onClick={() => setShowThresholdModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-700 hover:bg-amber-100"
            >
              <Bell size={18} weight="duotone" />
              Set Low Stock Alert
            </button>
            <button
              onClick={() => setShowExpirationModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100"
            >
              <ClockCounterClockwise size={18} weight="duotone" />
              Track Expiration/Damage
            </button>
          </div>
        )} */}

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
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(inventory.status)}`}
              >
                {inventory.status}
              </span>

              {/* Expiration Warning */}
              {inventory.expiration_date && (
                <div className="mt-2">
                  {getDaysUntilExpiration(inventory.expiration_date) <= 0 ? (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                      <Warning size={16} weight="duotone" className="mr-1" />
                      Expired
                    </span>
                  ) : getDaysUntilExpiration(inventory.expiration_date) <=
                    30 ? (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                      <Warning size={16} weight="duotone" className="mr-1" />
                      Expires in{' '}
                      {getDaysUntilExpiration(inventory.expiration_date)} days
                    </span>
                  ) : null}
                </div>
              )}
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
                  <h3 className="text-sm text-gray-500">Cost Per Unit</h3>
                  <p className="font-medium text-gray-800">
                    {formatCurrency(inventory.cost_per_unit)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CurrencyCircleDollar
                  size={24}
                  weight="duotone"
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <h3 className="text-sm text-gray-500">Total Value</h3>
                  <p className="font-medium text-gray-800">
                    {formatCurrency(
                      inventory.cost_per_unit * inventory.quantity
                    )}
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

              <div className="flex items-start gap-3">
                <ClockCounterClockwise
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
            </div>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-500">No inventory item found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete the inventory item "${inventory?.item_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Threshold Settings Modal */}
      {inventory && (
        <ThresholdSettings
          isOpen={showThresholdModal}
          onClose={() => setShowThresholdModal(false)}
          inventoryItem={inventory}
          onSave={handleInventoryUpdate}
        />
      )}

      {/* Expiration Tracker Modal */}
      {inventory && (
        <ExpirationTracker
          isOpen={showExpirationModal}
          onClose={() => setShowExpirationModal(false)}
          inventoryItem={inventory}
          onSave={handleInventoryUpdate}
        />
      )}

      {/* Transaction Tracker Modal */}
      {inventory && (
        <TransactionTracker
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          inventoryItem={inventory}
          onTransaction={handleInventoryUpdate}
        />
      )}
    </DashboardLayout>
  );
};

export default InventoryDetails;

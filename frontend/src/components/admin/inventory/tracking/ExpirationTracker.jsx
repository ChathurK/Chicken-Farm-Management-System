import React, { useState } from 'react';
import {
  X,
  Trash,
  ClockCounterClockwise,
  NoteBlank,
  CalendarX,
} from '@phosphor-icons/react';
import InventoryAPI from '../../../../utils/InventoryAPI';

/**
 * Component for tracking inventory item expiration and recording damages
 */
const ExpirationTracker = ({ isOpen, onClose, inventoryItem, onSave }) => {
  const [notes, setNotes] = useState(inventoryItem?.damage_notes || '');
  const [damagedQuantity, setDamagedQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle recording damage to inventory item
  const handleRecordDamage = async () => {
    if (damagedQuantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (damagedQuantity > inventoryItem.quantity) {
      setError('Damaged quantity cannot exceed available quantity');
      return;
    }

    try {
      setLoading(true);

      // Calculate new quantity
      const newQuantity = inventoryItem.quantity - damagedQuantity;
      const newStatus =
        newQuantity <= 0
          ? 'Finished'
          : inventoryItem.threshold && newQuantity <= inventoryItem.threshold
            ? 'Low'
            : 'Available';

      // In a real implementation, we would update the inventory item
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update the inventory item with the new quantity and damage notes
      // await InventoryAPI.update(inventoryItem.inventory_id, {
      //   quantity: newQuantity,
      //   status: newStatus,
      //   damage_notes: notes
      // });

      setLoading(false);

      // Call onSave with the updated item
      onSave({
        ...inventoryItem,
        quantity: newQuantity,
        status: newStatus,
        damage_notes: notes,
      });

      onClose();
    } catch (err) {
      setError('Failed to record damage. Please try again.');
      setLoading(false);
      console.error('Error recording damage:', err);
    }
  };

  // Handle marking item as expired
  const handleMarkExpired = async () => {
    try {
      setLoading(true);

      // In a real implementation, we would update the inventory item status
      // await InventoryAPI.updateStatus(inventoryItem.inventory_id, 'Expired');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLoading(false);

      // Call onSave with the updated item
      onSave({
        ...inventoryItem,
        status: 'Expired',
      });

      onClose();
    } catch (err) {
      setError('Failed to mark as expired. Please try again.');
      setLoading(false);
      console.error('Error marking as expired:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Track Item Status
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Item Details */}
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <h4 className="mb-2 font-medium">{inventoryItem.item_name}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>{' '}
                {inventoryItem.category}
              </div>
              <div>
                <span className="text-gray-500">Available:</span>{' '}
                {inventoryItem.quantity} {inventoryItem.unit}
              </div>
              <div>
                <span className="text-gray-500">Status:</span>{' '}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    inventoryItem.status === 'Available'
                      ? 'bg-green-100 text-green-800'
                      : inventoryItem.status === 'Low'
                        ? 'bg-yellow-100 text-yellow-800'
                        : inventoryItem.status === 'Finished'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {inventoryItem.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Expiration:</span>{' '}
                {formatDate(inventoryItem.expiration_date)}
              </div>
            </div>
          </div>

          {/* Option 1: Record Damage/Loss */}
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="mb-2 flex items-center font-medium text-amber-800">
              <Trash
                size={20}
                weight="duotone"
                className="mr-2 text-amber-600"
              />
              Record Damage or Loss
            </h4>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Damaged/Lost Quantity:
              </label>
              <input
                type="number"
                min="1"
                max={inventoryItem.quantity}
                value={damagedQuantity}
                onChange={(e) =>
                  setDamagedQuantity(parseInt(e.target.value) || 0)
                }
                className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Notes:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the reason for damage or loss"
                className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                rows={3}
              ></textarea>
            </div>
            <button
              onClick={handleRecordDamage}
              disabled={loading || damagedQuantity <= 0}
              className="flex w-full items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-center text-white hover:bg-amber-600 disabled:opacity-70"
            >
              {loading ? 'Processing...' : 'Record Damage'}
            </button>
          </div>

          {/* Option 2: Mark as Expired */}
          {inventoryItem.expiration_date && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 flex items-center font-medium text-blue-800">
                <CalendarX
                  size={20}
                  weight="duotone"
                  className="mr-2 text-blue-600"
                />
                Expiration Status
              </h4>
              <div className="mb-3">
                {getDaysUntilExpiration(inventoryItem.expiration_date) <= 0 ? (
                  <div className="rounded-lg bg-red-100 p-2 text-red-800">
                    <p className="text-sm font-medium">
                      This item has expired.
                    </p>
                    <p className="text-xs">
                      Expiration date:{' '}
                      {formatDate(inventoryItem.expiration_date)}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`rounded-lg p-2 ${
                      getDaysUntilExpiration(inventoryItem.expiration_date) <=
                      30
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {getDaysUntilExpiration(inventoryItem.expiration_date) <=
                      30
                        ? `Expiring soon: ${getDaysUntilExpiration(inventoryItem.expiration_date)} days left`
                        : 'Not expiring soon'}
                    </p>
                    <p className="text-xs">
                      Expiration date:{' '}
                      {formatDate(inventoryItem.expiration_date)}
                    </p>
                  </div>
                )}
              </div>
              {inventoryItem.status !== 'Expired' &&
                getDaysUntilExpiration(inventoryItem.expiration_date) <= 0 && (
                  <button
                    onClick={handleMarkExpired}
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-center text-white hover:bg-red-600 disabled:opacity-70"
                  >
                    {loading ? 'Processing...' : 'Mark as Expired'}
                  </button>
                )}
            </div>
          )}

          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpirationTracker;

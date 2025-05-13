import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FloppyDisk,
  WarningOctagon,
  Bell,
} from '@phosphor-icons/react';
import api from '../../../../utils/api';
import InventoryAPI from '../../../../utils/InventoryAPI';
import InventoryModal from '../InventoryModal';

const ThresholdSettings = ({ isOpen, onClose, inventoryItem, onSave }) => {
  const [threshold, setThreshold] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (inventoryItem && inventoryItem.threshold) {
      setThreshold(inventoryItem.threshold.toString());
    } else {
      setThreshold('');
    }
  }, [inventoryItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!threshold || isNaN(parseInt(threshold))) {
      setError('Please enter a valid threshold value');
      return;
    }

    try {
      setLoading(true);

      // In a real implementation, this would update a threshold field in the database
      // For now, we'll simulate this by updating the inventory item's "threshold" property

      // Save the threshold
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

      // Check if the current quantity is below the new threshold
      if (inventoryItem.quantity < parseInt(threshold)) {
        // If below threshold, update status to "Low"
        await InventoryAPI.updateStatus(inventoryItem.inventory_id, 'Low');
      }

      setLoading(false);
      onSave({ ...inventoryItem, threshold: parseInt(threshold) });
      onClose();
    } catch (err) {
      setError('Failed to save threshold settings');
      setLoading(false);
      console.error('Error saving threshold:', err);
    }
  };

  return (
    <InventoryModal
      isOpen={isOpen}
      title="Set Low Stock Threshold"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex">
              <div className="mr-3 flex-shrink-0">
                <Bell size={24} weight="duotone" className="text-amber-500" />
              </div>
              <div>
                <h4 className="mb-1 font-medium text-amber-800">
                  About Low Stock Thresholds
                </h4>
                <p className="text-sm text-amber-700">
                  Set a quantity threshold below which this item will be marked
                  as "Low Stock" and generate alerts on your dashboard. This
                  helps you maintain adequate inventory levels.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-2 text-gray-700">
              <span className="font-medium">Item:</span>{' '}
              {inventoryItem?.item_name}
            </p>
            <p className="mb-2 text-gray-700">
              <span className="font-medium">Current Quantity:</span>{' '}
              {inventoryItem?.quantity} {inventoryItem?.unit}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Current Status:</span>{' '}
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  inventoryItem?.status === 'Available'
                    ? 'bg-green-100 text-green-800'
                    : inventoryItem?.status === 'Low'
                      ? 'bg-yellow-100 text-yellow-800'
                      : inventoryItem?.status === 'Finished'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {inventoryItem?.status}
              </span>
            </p>
          </div>

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Low Stock Threshold ({inventoryItem?.unit})
          </label>
          <div className="flex">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <WarningOctagon
                  size={20}
                  className="text-gray-400"
                  weight="duotone"
                />
              </div>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="Enter threshold quantity"
                min="1"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-12 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500">{inventoryItem?.unit}</span>
              </div>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            When quantity falls below this threshold, the item will be marked as
            "Low" and appear in your dashboard alerts.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 disabled:opacity-70"
          >
            <FloppyDisk size={20} weight="duotone" />
            {loading ? 'Saving...' : 'Save Threshold'}
          </button>
        </div>
      </form>
    </InventoryModal>
  );
};

export default ThresholdSettings;

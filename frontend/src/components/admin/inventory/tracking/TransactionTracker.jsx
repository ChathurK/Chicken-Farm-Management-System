import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Scales,
  Package,
  ArrowCircleRight,
  ArrowCircleLeft,
} from '@phosphor-icons/react';
import InventoryAPI from '../../../../utils/InventoryAPI';
import InventoryModal from '../InventoryModal';

/**
 * Component for tracking inventory transactions and automatic updates
 */
const TransactionTracker = ({
  isOpen,
  onClose,
  inventoryItem,
  onTransaction,
}) => {
  const [transactionType, setTransactionType] = useState('stockIn');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when inventory item changes
  useEffect(() => {
    setTransactionType('stockIn');
    setQuantity(1);
    setNotes('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
  }, [inventoryItem]);

  // Handle transaction submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (transactionType === 'stockOut' && quantity > inventoryItem.quantity) {
      setError('Stock out quantity cannot exceed available quantity');
      return;
    }

    try {
      setLoading(true);

      // Calculate new quantity based on transaction type
      const newQuantity =
        transactionType === 'stockIn'
          ? inventoryItem.quantity + quantity
          : inventoryItem.quantity - quantity;

      // Determine new status based on threshold
      const newStatus =
        newQuantity <= 0
          ? 'Finished'
          : inventoryItem.threshold && newQuantity <= inventoryItem.threshold
            ? 'Low'
            : 'Available';

      // In a real implementation, we would create a transaction record
      // and update the inventory item

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Create transaction record (in a real implementation)
      // const transactionData = {
      //   inventory_id: inventoryItem.inventory_id,
      //   transaction_type: transactionType,
      //   quantity: quantity,
      //   transaction_date: transactionDate,
      //   notes: notes
      // };
      // await api.post('/api/inventory/transactions', transactionData);

      // Update inventory quantity
      // await InventoryAPI.updateQuantity(inventoryItem.inventory_id, newQuantity);

      // If quantity is now 0, update status to Finished
      // if (newQuantity <= 0) {
      //   await InventoryAPI.updateStatus(inventoryItem.inventory_id, 'Finished');
      // } else if (inventoryItem.threshold && newQuantity <= inventoryItem.threshold) {
      //   await InventoryAPI.updateStatus(inventoryItem.inventory_id, 'Low');
      // } else {
      //   await InventoryAPI.updateStatus(inventoryItem.inventory_id, 'Available');
      // }

      setLoading(false);

      // Call the onTransaction callback with the updated item
      onTransaction({
        ...inventoryItem,
        quantity: newQuantity,
        status: newStatus,
      });

      onClose();
    } catch (err) {
      setError('Failed to record transaction. Please try again.');
      setLoading(false);
      console.error('Error recording transaction:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <InventoryModal
      isOpen={isOpen}
      title="Record Inventory Transaction"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
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
              <span className="text-gray-500">Current Stock:</span>{' '}
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
          </div>
        </div>

        {/* Transaction Type */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTransactionType('stockIn')}
              className={`flex items-center justify-center gap-2 rounded-lg p-3 ${
                transactionType === 'stockIn'
                  ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowCircleRight size={20} weight="duotone" />
              Stock In
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('stockOut')}
              className={`flex items-center justify-center gap-2 rounded-lg p-3 ${
                transactionType === 'stockOut'
                  ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowCircleLeft size={20} weight="duotone" />
              Stock Out
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Quantity ({inventoryItem.unit})
          </label>
          <div className="flex overflow-hidden rounded-lg border border-gray-300">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="bg-gray-100 px-3 py-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            >
              <Minus size={16} weight="bold" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full border-x border-gray-300 px-3 py-2 text-center focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((prev) => prev + 1)}
              className="bg-gray-100 px-3 py-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            >
              <Plus size={16} weight="bold" />
            </button>
          </div>
          {transactionType === 'stockOut' &&
            inventoryItem.quantity < quantity && (
              <p className="mt-1 text-sm text-red-500">
                Quantity exceeds available stock
              </p>
            )}
        </div>

        {/* Transaction Date */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Transaction Date
          </label>
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any additional information about this transaction"
            className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
            rows={3}
          ></textarea>
        </div>

        {/* Submit Button */}
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
            disabled={
              loading ||
              (transactionType === 'stockOut' &&
                quantity > inventoryItem.quantity)
            }
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-white ${
              transactionType === 'stockIn'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } disabled:opacity-70`}
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                {transactionType === 'stockIn' ? (
                  <>
                    <Plus size={20} weight="bold" />
                    Record Stock In
                  </>
                ) : (
                  <>
                    <Minus size={20} weight="bold" />
                    Record Stock Out
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </form>
    </InventoryModal>
  );
};

export default TransactionTracker;

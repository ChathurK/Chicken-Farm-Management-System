import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { ArrowLeft, FloppyDisk, WarningCircle } from '@phosphor-icons/react';
import InventoryAPI from '../../../utils/InventoryAPI';

/**
 * Component for employees to update inventory items
 * Restricted to only updating quantities and status
 */
const InventoryUpdateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    quantity: 0,
    unit: '',
    cost_per_unit: 0,
    purchase_date: '',
    expiration_date: '',
    status: 'Available',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fetchError, setFetchError] = useState('');

  // Fetch existing inventory item data
  useEffect(() => {
    const fetchInventoryItem = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const data = await InventoryAPI.getById(id);
          // console.log('Fetched inventory item:', data);
          setFormData({
            item_name: data.item_name || '',
            category: data.category || '',
            quantity: data.quantity || 0,
            unit: data.unit || '',
            cost_per_unit: data.cost_per_unit || 0,
            purchase_date: data.purchase_date ? data.purchase_date.split('T')[0] : '',
            expiration_date: data.expiration_date ? data.expiration_date.split('T')[0] : '',
            status: data.status || 'Available',
            threshold: data.threshold || '',
          });
          setLoading(false);
        } catch (err) {
          console.error('Error fetching inventory item:', err);
          setFetchError('Could not load inventory item. Please try again.');
          setLoading(false);
        }
      }
    };

    fetchInventoryItem();
  }, [id, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Only allow updates to quantity and status (employee restrictions)
    if (name === 'quantity' || name === 'status') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      setLoading(true);

      // Only update with allowed fields (quantity and status)
      const updateData = {
        quantity: formData.quantity,
        status: formData.status
      };

      await InventoryAPI.update(id, updateData);
      setLoading(false);
      navigate(`/employee/inventory/view/${id}`);
    } catch (err) {
      console.error('Error updating inventory:', err);
      setFormError('Failed to update inventory. Please try again.');
      setLoading(false);
    }
  };

  const formattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    const formatted = new Date(dateString).toLocaleDateString('en-CA');
    // console.log('Formatted date:', formatted);
    return formatted;
  }

  return (
    <DashboardLayout>
      <div className="h-full rounded-lg bg-white p-6 shadow">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={24} weight="duotone" />
            </button>
            <h1 className="text-2xl font-bold">Update Inventory</h1>
          </div>
        </div>

        {/* Error messages */}
        {fetchError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-center">
              <WarningCircle size={20} weight="bold" className="mr-2" />
              <p>{fetchError}</p>
            </div>
          </div>
        )}

        {formError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-center">
              <WarningCircle size={20} weight="bold" className="mr-2" />
              <p>{formError}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Item Name (Read-only) */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  name="item_name"
                  value={formData.item_name}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2.5 text-gray-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  readOnly
                />
              </div>

              {/* Category (Read-only) */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2.5 text-gray-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  readOnly
                />
              </div>

              {/* Quantity (Editable) */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Quantity*
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 text-gray-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Unit (Read-only) */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2.5 text-gray-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  readOnly
                />
              </div>

              {/* Cost per Unit (Read-only) */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Cost per Unit (LKR)
                </label>
                <input
                  type="number"
                  name="cost_per_unit"
                  value={formData.cost_per_unit}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2.5 text-gray-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  readOnly
                />
              </div>

              {/* Purchase Date (Read-only) */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Purchase Date
                </label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formattedDate(formData.purchase_date)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2.5 text-gray-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  readOnly
                />
              </div>

              {/* Expiration Date (Read-only, if exists) */}
              {formData.expiration_date && (
                <div className="col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    name="expiration_date"
                    value={formattedDate(formData.expiration_date)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2.5 text-gray-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    readOnly
                  />
                </div>
              )}

              {/* Status (Editable) */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status*
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 text-gray-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Low">Low</option>
                  <option value="Finished">Finished</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {/* Threshold (Read-only, if exists) */}
              {formData.threshold && (
                <div className="col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="threshold"
                    value={formData.threshold}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2.5 text-gray-700 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    readOnly
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1 rounded-md border border-transparent bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <FloppyDisk size={18} weight="bold" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InventoryUpdateForm;

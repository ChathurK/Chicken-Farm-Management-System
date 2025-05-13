import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import {
  ArrowLeft,
  FloppyDisk,
  Warning,
  Clock,
  Package,
  ShoppingCart,
  Tag,
  Calendar,
  Ruler,
} from '@phosphor-icons/react';
import api from '../../../utils/api';

const InventoryForm = () => {
  const navigate = useNavigate();
  const { id, category } = useParams();
  const isEditMode = !!id;

  // Form data state
  const [formData, setFormData] = useState({
    category: category || 'Feed',
    item_name: '',
    quantity: '',
    unit: '',
    purchase_date: '',
    expiration_date: '',
    cost_per_unit: '',
    status: 'Available',
    threshold: '', // For low stock alerts
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load inventory item data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchInventoryItem = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/inventory/${id}`);
          const item = response.data;

          // Format dates for the form
          const formattedItem = {
            ...item,
            purchase_date: item.purchase_date
              ? item.purchase_date.split('T')[0]
              : '',
            expiration_date: item.expiration_date
              ? item.expiration_date.split('T')[0]
              : '',
            threshold: item.threshold || '',
          };

          setFormData(formattedItem);
          setLoading(false);
        } catch (err) {
          setError('Failed to load inventory item. Please try again.');
          setLoading(false);
          console.error('Error fetching inventory item:', err);
        }
      };

      fetchInventoryItem();
    }
  }, [id, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.category) errors.category = 'Category is required';
    if (!formData.item_name) errors.item_name = 'Item name is required';
    if (!formData.quantity) errors.quantity = 'Quantity is required';
    if (formData.quantity <= 0)
      errors.quantity = 'Quantity must be greater than 0';
    if (!formData.unit) errors.unit = 'Unit is required';
    if (!formData.status) errors.status = 'Status is required';

    // If cost is provided, ensure it's a valid number
    if (formData.cost_per_unit && isNaN(parseFloat(formData.cost_per_unit))) {
      errors.cost_per_unit = 'Cost must be a valid number';
    }

    // Ensure threshold is a valid number if provided
    if (formData.threshold && isNaN(parseInt(formData.threshold))) {
      errors.threshold = 'Threshold must be a valid number';
    }

    // Ensure dates are valid
    if (
      formData.purchase_date &&
      new Date(formData.purchase_date) > new Date()
    ) {
      errors.purchase_date = 'Purchase date cannot be in the future';
    }

    if (
      formData.expiration_date &&
      new Date(formData.expiration_date) <= new Date(formData.purchase_date)
    ) {
      errors.expiration_date = 'Expiration date must be after purchase date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Prepare data for API
      const inventoryData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        cost_per_unit: formData.cost_per_unit
          ? parseFloat(formData.cost_per_unit)
          : 0,
      };

      // Remove threshold from API payload (we'll handle it separately if needed)
      const { threshold, ...apiPayload } = inventoryData;

      if (isEditMode) {
        await api.put(`/api/inventory/${id}`, apiPayload);
      } else {
        await api.post('/api/inventory', apiPayload);
      }

      setIsSubmitting(false);

      // Redirect based on category
      navigate(`/admin/inventory/${formData.category.toLowerCase()}`);
    } catch (err) {
      setIsSubmitting(false);
      setError(
        err.response?.data?.msg || 'An error occurred. Please try again.'
      );
      console.error('Error submitting form:', err);
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
            <h1 className="text-2xl font-bold">
              {isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h1>
          </div>
        </div>

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
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-8 grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Category */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Package
                        size={20}
                        className="text-gray-400"
                        weight="duotone"
                      />
                    </div>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full rounded-lg border ${
                        formErrors.category
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    >
                      <option value="Feed">Feed</option>
                      <option value="Medication">Medication</option>
                      <option value="Supplies">Supplies</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.category}
                    </p>
                  )}
                </div>

                {/* Item Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Tag
                        size={20}
                        className="text-gray-400"
                        weight="duotone"
                      />
                    </div>
                    <input
                      type="text"
                      name="item_name"
                      value={formData.item_name}
                      onChange={handleChange}
                      placeholder="Enter item name"
                      className={`w-full rounded-lg border ${
                        formErrors.item_name
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    />
                  </div>
                  {formErrors.item_name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.item_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Quantity */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <ShoppingCart
                        size={20}
                        className="text-gray-400"
                        weight="duotone"
                      />
                    </div>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="Enter quantity"
                      className={`w-full rounded-lg border ${
                        formErrors.quantity
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    />
                  </div>
                  {formErrors.quantity && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.quantity}
                    </p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Ruler
                        size={20}
                        className="text-gray-400"
                        weight="duotone"
                      />
                    </div>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      placeholder="E.g., kg, pcs, bottles"
                      className={`w-full rounded-lg border ${
                        formErrors.unit ? 'border-red-500' : 'border-gray-300'
                      } p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    />
                  </div>
                  {formErrors.unit && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.unit}
                    </p>
                  )}
                </div>

                {/* Cost per Unit */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Cost per Unit
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500">Rs</span>
                    </div>
                    <input
                      type="number"
                      name="cost_per_unit"
                      min="0"
                      step="0.01"
                      value={formData.cost_per_unit}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`w-full rounded-lg border ${
                        formErrors.cost_per_unit
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    />
                  </div>
                  {formErrors.cost_per_unit && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.cost_per_unit}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Purchase Date */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Purchase Date
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Calendar
                        size={20}
                        className="text-gray-400"
                        weight="duotone"
                      />
                    </div>
                    <input
                      type="date"
                      name="purchase_date"
                      value={formData.purchase_date}
                      onChange={handleChange}
                      className={`w-full rounded-lg border ${
                        formErrors.purchase_date
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    />
                  </div>
                  {formErrors.purchase_date && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.purchase_date}
                    </p>
                  )}
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Expiration Date
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Clock
                        size={20}
                        className="text-gray-400"
                        weight="duotone"
                      />
                    </div>
                    <input
                      type="date"
                      name="expiration_date"
                      value={formData.expiration_date}
                      onChange={handleChange}
                      className={`w-full rounded-lg border ${
                        formErrors.expiration_date
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    />
                  </div>
                  {formErrors.expiration_date && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.expiration_date}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Warning
                        size={20}
                        className="text-gray-400"
                        weight="duotone"
                      />
                    </div>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`w-full rounded-lg border ${
                        formErrors.status ? 'border-red-500' : 'border-gray-300'
                      } p-2.5 pl-10 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                    >
                      <option value="Available">Available</option>
                      <option value="Low">Low</option>
                      <option value="Finished">Finished</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                  {formErrors.status && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.status}
                    </p>
                  )}
                </div>
              </div>

              {/* Threshold for alerts */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Low Stock Threshold
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="threshold"
                    min="1"
                    value={formData.threshold}
                    onChange={handleChange}
                    placeholder="Quantity at which to show low stock alert"
                    className={`w-full rounded-lg border ${
                      formErrors.threshold
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                  />
                </div>
                {formErrors.threshold && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.threshold}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Set a quantity threshold for when this item should be marked
                  as "Low" and generate alerts.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 disabled:opacity-70"
              >
                <FloppyDisk size={20} weight="duotone" />
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InventoryForm;

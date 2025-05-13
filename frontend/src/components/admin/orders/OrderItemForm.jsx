import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

const OrderItemForm = () => {
  const navigate = useNavigate();
  const { id, itemId } = useParams();
  const isEditMode = !!itemId;

  // Form state
  const [formData, setFormData] = useState({
    livestock_id: '',
    product_type: '',
    quantity: '',
    unit_price: '',
  });

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get('/api/inventory');
        setInventory(response.data);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError(
          'Failed to load inventory items. Please refresh and try again.'
        );
      }
    };

    fetchInventory();

    // If editing, fetch the current item data
    if (isEditMode) {
      const fetchOrderItem = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/orders/${id}/items/${itemId}`);
          setFormData(response.data);
          setLoading(false);
        } catch (err) {
          setError('Error loading item data. Please try again.');
          setLoading(false);
          console.error('Error fetching order item:', err);
        }
      };

      fetchOrderItem();
    }
  }, [id, itemId, isEditMode]);

  // Handle input changes
  const handleChange = (e) => {
    setError(null); // Clear error when user types
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user types
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

    if (!formData.livestock_id.trim()) {
      errors.livestock_id = 'Please select an inventory item';
    }

    if (!formData.product_type.trim()) {
      errors.product_type = 'Product type is required';
    }

    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (formData.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.unit_price) {
      errors.unit_price = 'Unit price is required';
    } else if (formData.unit_price <= 0) {
      errors.unit_price = 'Unit price must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditMode) {
        await api.put(`/api/orders/${id}/items/${itemId}`, formData);
      } else {
        await api.post(`/api/orders/${id}/items`, formData);
      }

      setLoading(false);
      navigate(`/admin/orders/${id}`);
    } catch (err) {
      setLoading(false);

      // Check if error response exists
      if (err.response?.data) {
        // Handle field validation errors
        if (err.response.data.errors) {
          const backendErrors = {};
          err.response.data.errors.forEach((error) => {
            backendErrors[error.path] = error.msg;
          });
          setFormErrors(backendErrors);
          setError(null); // Clear general error when showing field-specific errors
        }
        // Handle general API error messages
        else if (err.response.data.msg) {
          setError(err.response.data.msg);
          setFormErrors({}); // Clear field-specific errors when showing general error
        }
        // Handle other unexpected error formats
        else {
          setError('An unexpected error occurred. Please try again.');
          setFormErrors({});
        }
      }
      // Handle network errors and other errors
      else if (err.request) {
        setError('Network error. Please check your connection and try again.');
        setFormErrors({});
      } else {
        setError('An error occurred. Please try again.');
        setFormErrors({});
      }
      // Log the error for debugging
      console.error('Error submitting form:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate(`/admin/orders/${id}`)}
            className="mr-4 text-gray-600 hover:text-amber-500"
          >
            <ArrowLeft size={24} weight="duotone" />
          </button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Order Item' : 'Add Order Item'}
          </h1>
        </div>

        {/* Display error message if any */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Inventory Item Selection */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Select Inventory Item <span className="text-red-600">*</span>
              </label>
              <select
                name="livestock_id"
                value={formData.livestock_id}
                onChange={handleChange}
                className={`border bg-gray-50 ${
                  formErrors.livestock_id ? 'border-red-500' : 'border-gray-300'
                } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              >
                <option value="">Select an item</option>
                {inventory.map((item) => (
                  <option key={item.inventory_id} value={item.inventory_id}>
                    {item.name} - {item.type} ({item.quantity_available}{' '}
                    available)
                  </option>
                ))}
              </select>
              {formErrors.livestock_id && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.livestock_id}
                </p>
              )}
            </div>

            {/* Product Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Product Type <span className="text-red-600">*</span>
              </label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleChange}
                className={`border bg-gray-50 ${
                  formErrors.product_type ? 'border-red-500' : 'border-gray-300'
                } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              >
                <option value="">Select product type</option>
                <option value="Eggs">Eggs</option>
                <option value="Chicks">Chicks</option>
                <option value="Chickens">Chickens</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.product_type && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.product_type}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quantity <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`border bg-gray-50 ${
                  formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                placeholder="Enter quantity"
              />
              {formErrors.quantity && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.quantity}
                </p>
              )}
            </div>

            {/* Unit Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Unit Price ($) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className={`border bg-gray-50 ${
                  formErrors.unit_price ? 'border-red-500' : 'border-gray-300'
                } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                placeholder="Enter unit price"
              />
              {formErrors.unit_price && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.unit_price}
                </p>
              )}
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/admin/orders/${id}`)}
              className="mr-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:bg-amber-300"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FloppyDisk size={20} weight="duotone" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default OrderItemForm;

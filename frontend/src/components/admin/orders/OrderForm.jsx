import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import DashboardLayout from '../DashboardLayout';
import api from '../../../utils/api';

const OrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    buyer_id: '',
    deadline_date: '',
    status: 'Ongoing'
  });

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [buyers, setBuyers] = useState([]);
  
  // Load order data if in edit mode
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const response = await api.get('/api/buyers');
        setBuyers(response.data);
      } catch (err) {
        console.error('Error fetching buyers:', err);
        setError('Failed to load buyers. Please refresh and try again.');
      }
    };

    fetchBuyers();

    if (isEditMode) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/orders/${id}`);
          
          // Format the date for input field
          const order = response.data;
          if (order.deadline_date) {
            const deadlineDate = new Date(order.deadline_date);
            // Format the date as YYYY-MM-DD for input field
            order.deadline_date = deadlineDate.toISOString().split('T')[0];
          }
          
          setFormData(order);
          setLoading(false);
        } catch (err) {
          setError('Error loading order data. Please try again.');
          setLoading(false);
          console.error('Error fetching order:', err);
        }
      };

      fetchOrder();
    }
  }, [id, isEditMode]);

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

    if (!formData.buyer_id) {
      errors.buyer_id = 'Buyer is required';
    }

    if (formData.deadline_date) {
      const currentDate = new Date();
      const selectedDate = new Date(formData.deadline_date);
      
      if (selectedDate <= currentDate) {
        errors.deadline_date = 'Deadline date must be in the future';
      }
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
        await api.put(`/api/orders/${id}`, formData);
      } else {
        await api.post('/api/orders', formData);
      }

      setLoading(false);
      navigate('/admin/orders');
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
            onClick={() => navigate('/admin/orders')}
            className="mr-4 text-gray-600 hover:text-amber-500"
          >
            <ArrowLeft size={24} weight="duotone" />
          </button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Order' : 'Create New Order'}
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
            {/* Buyer Selection */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Select Buyer <span className="text-red-600">*</span>
              </label>
              <select
                name="buyer_id"
                value={formData.buyer_id}
                onChange={handleChange}
                className={`border bg-gray-50 ${
                  formErrors.buyer_id ? 'border-red-500' : 'border-gray-300'
                } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              >
                <option value="">Select a buyer</option>
                {buyers.map((buyer) => (
                  <option key={buyer.buyer_id} value={buyer.buyer_id}>
                    {buyer.first_name} {buyer.last_name} - {buyer.contact_number}
                  </option>
                ))}
              </select>
              {formErrors.buyer_id && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.buyer_id}
                </p>
              )}
            </div>

            {/* Deadline Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Delivery Deadline Date
              </label>
              <input
                type="date"
                name="deadline_date"
                value={formData.deadline_date || ''}
                onChange={handleChange}
                className={`border bg-gray-50 ${
                  formErrors.deadline_date ? 'border-red-500' : 'border-gray-300'
                } block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              />
              {formErrors.deadline_date && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.deadline_date}
                </p>
              )}
            </div>

            {/* Status - Only show in edit mode */}
            {isEditMode && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Order Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/orders')}
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

export default OrderForm;

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import api from '../../../utils/api';

const BuyerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    contact_number: '',
    email: '',
    address: '',
  });

  const [loading, setLoading] = useState(false); // Handles BOTH fetching AND submitting
  const [error, setError] = useState(null); // For general errors
  const [validationErrors, setValidationErrors] = useState({}); // For field errors

  // Fetch buyer data if in edit mode
  useEffect(() => {
    if (isEditing) {
      fetchBuyerData();
    }
  }, [id]);

  const fetchBuyerData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/buyers/${id}`);

      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        contact_number: response.data.contact_number || '',
        email: response.data.email || '',
        address: response.data.address || '',
      });

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching buyer data');
      setLoading(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (!formData.contact_number.trim()) {
      errors.contact_number = 'Contact number is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditing) {
        await api.put(`/api/buyers/${id}`, formData);
      } else {
        await api.post('/api/buyers', formData);
      }

      setLoading(false);
      navigate('/admin/buyers');
    } catch (err) {
      setLoading(false);

      // check if error response exists
      if (err.response?.data) {
        // Handle field validation errors
        if (err.response.data.errors) {
          const apiErrors = {};
          err.response.data.errors.forEach((error) => {
            const field = error.path;
            apiErrors[field] = error.msg;
          });
          setValidationErrors(apiErrors);
          setError(null);
        }
        // Handle general API error messages
        else if (err.response.data.msg) {
          setError(err.response.data.msg);
          setValidationErrors({});
        }
        // Handle other errors
        else {
          setError('An unexpected error occurred. Please try again.');
          setValidationErrors({});
        }
      }
      // Handle network and other errors
      else if (err.request) {
        setError('Network error. Please check your connection and try again.');
        setValidationErrors({});
      } else {
        setError('An unexpected error occurred. Please try again.');
        setValidationErrors({});
      }
      // Log the error for debugging
      console.error('Error submitting form:', err);
    }
  };

  // Render loading state
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
            onClick={() => navigate('/admin/buyers')}
            className="mr-4 text-gray-600 hover:text-amber-600"
          >
            <ArrowLeft size={24} weight="duotone" />
          </button>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Buyer' : 'Add New Buyer'}
          </h1>
        </div>

        {/* Display error message if any */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`border bg-gray-50 ${validationErrors.first_name ? 'border-red-500' : 'border-gray-300'} block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                placeholder="Enter first name"
              />
              {validationErrors.first_name && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.first_name}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`border bg-gray-50 ${validationErrors.last_name ? 'border-red-500' : 'border-gray-300'} block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                placeholder="Enter last name"
              />
              {validationErrors.last_name && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.last_name}
                </p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Contact Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className={`border bg-gray-50 ${validationErrors.contact_number ? 'border-red-500' : 'border-gray-300'} block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                placeholder="Enter contact number"
              />
              {validationErrors.contact_number && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.contact_number}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`border bg-gray-50 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} block w-full rounded-lg p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                placeholder="Enter email (optional)"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Enter address (optional)"
                rows="3"
              ></textarea>
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/buyers')}
              className="mr-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
              disabled={loading}
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

export default BuyerForm;
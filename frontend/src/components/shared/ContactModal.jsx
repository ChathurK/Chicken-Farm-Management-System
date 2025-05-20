import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import api from '../../utils/api';

const ContactModal = ({ type, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    contact_number: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    setError(null);
    const { name, value } = e.target;
    setFormData(prev => ({
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

    if (!formData.first_name.trim())
      errors.first_name = 'First name is required';

    if (!formData.last_name.trim())
      errors.last_name = 'Last name is required';

    if (!formData.contact_number.trim())
      errors.contact_number = 'Contact number is required';

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      // Use appropriate API endpoint based on type (buyer or seller)
      const endpoint = type === 'buyer' ? '/api/buyers' : '/api/sellers';
      const response = await api.post(endpoint, formData);
      onSave(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log('Error response:', err.response?.data);
      
      // Check if error response exists
      if (err.response?.data) {
        if (err.response.data.msg) {
          setError(err.response.data.msg);
          // Handle field validation errors
        } else if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          const backendErrors = {};
          err.response.data.errors.forEach((error) => {
            backendErrors[error.path] = error.msg;
          });
          setFormErrors(backendErrors);
          setError(null);
        } 
        // Handle general API error messages
        else {
          setError(`Failed to create ${type}. Please check your input and try again.`);
        }
      }
      // Handle network errors and other errors
      else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`An error occurred. Please try again.`);
      }
      
      // Log the error for debugging
      console.error('Error submitting form:', err);
    }
  };

  // Determine title based on type
  const title = `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;

  return (
    <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={`block w-full rounded-md border ${formErrors.first_name ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-amber-500 focus:outline-none`}
              placeholder="Enter first name"
            />
            {formErrors.first_name && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.first_name}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`block w-full rounded-md border ${formErrors.last_name ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-amber-500 focus:outline-none`}
              placeholder="Enter last name"
            />
            {formErrors.last_name && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.last_name}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Contact Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="contact_number"
              value={formData.contact_number}
              onChange={(e) => {
                // Only allow digits, limit to 10 characters
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                handleChange({ target: { name: 'contact_number', value } });
              }}
              maxLength={10}
              pattern="\d{10}"
              placeholder="Enter 10 digit number"
              className={`block w-full rounded-md border ${formErrors.contact_number ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-amber-500 focus:outline-none`}
            />
            {formErrors.contact_number && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.contact_number}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`block w-full rounded-md border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-amber-500 focus:outline-none`}
              placeholder="Enter email address"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
              placeholder="Enter address"
            ></textarea>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={18} weight='bold' />
                  Add {type.charAt(0).toUpperCase() + type.slice(1)}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;

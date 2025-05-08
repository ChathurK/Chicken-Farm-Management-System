import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { ArrowLeft } from '@phosphor-icons/react';
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
    address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch buyer data if editing
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
        address: response.data.address || ''
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching buyer data');
      setLoading(false);
    }
  };

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
    const { name, value } = e.target;
    setError(null);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      if (isEditing) {
        await api.put(`/api/buyers/${id}`, formData);
      } else {
        await api.post('/api/buyers', formData);
      }
      
      setSubmitting(false);
      navigate('/admin/buyers');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Error saving buyer data';
      
      // Handle validation errors from API
      if (err.response?.data?.errors) {
        const apiErrors = {};
        err.response.data.errors.forEach(error => {
          const field = error.param;
          apiErrors[field] = error.msg;
        });
        setValidationErrors(apiErrors);
      }
      
      setError(errorMsg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/admin/buyers')}
            className="mr-4 text-gray-600 hover:text-amber-600"
          >
            <ArrowLeft size={24} weight="duotone" />
          </button>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Buyer' : 'Add New Buyer'}</h1>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* First Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                First Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`bg-gray-50 border ${validationErrors.first_name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5`}
                placeholder="Enter first name"
              />
              {validationErrors.first_name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.first_name}</p>
              )}
            </div>
            
            {/* Last Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Last Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`bg-gray-50 border ${validationErrors.last_name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5`}
                placeholder="Enter last name"
              />
              {validationErrors.last_name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.last_name}</p>
              )}
            </div>
            
            {/* Contact Number */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Contact Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className={`bg-gray-50 border ${validationErrors.contact_number ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5`}
                placeholder="Enter contact number"
              />
              {validationErrors.contact_number && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.contact_number}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`bg-gray-50 border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5`}
                placeholder="Enter email (optional)"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>
          </div>
          
          {/* Address */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
              placeholder="Enter address (optional)"
              rows="3"
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/buyers')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center justify-center min-w-[100px]"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Buyer' : 'Add Buyer'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default BuyerForm;
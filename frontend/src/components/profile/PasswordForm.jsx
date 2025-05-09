import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock } from '@phosphor-icons/react';
import api from '../../utils/api';

const PasswordForm = ({ userId }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setSuccess('');
    // Update form data
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.new_password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/api/users/${userId}/password`, {
        new_password: formData.new_password
      });
      
      setSuccess('Password updated successfully');
      
      // Reset form
      setFormData({
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Header */}
      <div className="flex items-center space-x-4">
        <div className="bg-amber-100 p-3 rounded-full">
          <Lock size={32} weight="duotone" className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-medium text-gray-800">Change Password</h2>
          <p className="text-gray-500">Update your password to keep your account secure</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            name="new_password"
            id="new_password"
            value={formData.new_password}
            onChange={handleChange}
            required
            minLength={6}
            className="mt-1 px-2 py-1 border rounded-md focus:outline-none focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300"
          />
          <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
        </div>
        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirm_password"
            id="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            className="mt-1 px-2 py-1 border rounded-md focus:outline-none focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordForm;
import React, { useState, useEffect } from 'react';
import { X, ClipboardText, Check, WarningCircle } from '@phosphor-icons/react';

const EmployeeModal = ({ show, onClose, onSave, employee, temporaryPassword, apiError }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    position: '',
    salary: '',
    hire_date: new Date().toISOString().split('T')[0],
    contact_number: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  // Reset form when modal opens/closes or employee changes
  useEffect(() => {
    if (show) {
      if (employee) {
        setFormData({
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          email: employee.email || '',
          department: employee.department || '',
          position: employee.position || '',
          salary: employee.salary || '',
          hire_date: employee.hire_date
            ? new Date(employee.hire_date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          contact_number: employee.contact_number || '',
          address: employee.address || '',
        });
      } else {
        // New employee - reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          department: '',
          position: '',
          salary: '',
          hire_date: new Date().toISOString().split('T')[0],
          contact_number: '',
          address: '',
        });
      }
      setErrors({});
      setGeneralError(null);
    }
  }, [show, employee]);

  // Parse API errors into field-specific errors
  useEffect(() => {
    if (apiError) {
      const errorMessage = apiError.toLowerCase();
      const newErrors = { ...errors };
      let isFieldSpecificError = false;

      // Map validation errors to specific fields
      if (errorMessage.includes('please include a valid email')) {
        newErrors.email = 'Please enter a valid email address';
        isFieldSpecificError = true;
      }

      if (errorMessage.includes('contact number must contain only digits')) {
        newErrors.contact_number =
          'Contact number must contain only digits, spaces, and the characters: +, -, ()';
        isFieldSpecificError = true;
      }

      // Set the field-specific errors
      setErrors(newErrors);

      // Handle general errors
      if (isFieldSpecificError) {
        setGeneralError(null);
      } else {
        // Extract the meaningful part of the error message
        if (errorMessage.includes('failed to')) {
          const colonIndex = apiError.indexOf(':');
          if (colonIndex !== -1 && colonIndex < apiError.length - 1) {
            setGeneralError(apiError.substring(colonIndex + 1).trim());
          } else {
            setGeneralError(apiError);
          }
        } else {
          setGeneralError(apiError);
        }
      }
    } else {
      setGeneralError(null);
    }
  }, [apiError, errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim())
      newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim())
      newErrors.last_name = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.department.trim())
      newErrors.department = 'Department is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';

    if (!formData.salary) {
      newErrors.salary = 'Salary is required';
    } else if (isNaN(formData.salary) || parseFloat(formData.salary) <= 0) {
      newErrors.salary = 'Salary must be a positive number';
    }

    if (!formData.hire_date) newErrors.hire_date = 'Hire date is required';
    if (!formData.contact_number)
      newErrors.contact_number = 'Contact number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Format data for API
      const employeeData = {
        ...formData,
        salary: parseFloat(formData.salary),
      };

      onSave(employeeData);
    }
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(temporaryPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 !m-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {temporaryPassword ? (
          <div className="p-6">
            <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
              {employee ? (
                <>
                  <p className="font-bold">Password Updated Successfully!</p>
                </>
              ) : (
                <>
                  <p className="font-bold">Employee Created Successfully!</p>
                </>
              )}
              <p>A temporary password has been generated for this employee:</p>
              <div className="mt-2 flex items-center justify-between rounded border bg-white p-2">
                <code className="font-mono">{temporaryPassword}</code>
                <button
                  onClick={copyPasswordToClipboard}
                  className="rounded bg-blue-500 p-1 text-white transition hover:bg-blue-600"
                  title="Copy to clipboard"
                >
                  {passwordCopied ? (
                    <Check size={18} />
                  ) : (
                    <ClipboardText size={18} />
                  )}
                </button>
              </div>
              {passwordCopied && (
                <p className="mt-1 text-xs text-green-600">
                  Password copied to clipboard!
                </p>
              )}
              <p className="mt-3 text-sm">
                Please provide this password to the employee. They will be able
                to log in and change their password.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="rounded bg-gray-300 px-4 py-2 text-gray-800 transition hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* General Error Messages */}
            {generalError && (
              <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
                <div className="flex items-center">
                  <WarningCircle size={20} className="mr-2" weight="fill" />
                  <p>{generalError}</p>
                </div>
              </div>
            )}

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 ${errors.first_name ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:outline-none`}
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 ${errors.last_name ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:outline-none`}
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:outline-none`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 ${errors.department ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:outline-none`}
                />
                {errors.department && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.department}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 ${errors.position ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:outline-none`}
                />
                {errors.position && (
                  <p className="mt-1 text-xs text-red-500">{errors.position}</p>
                )}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  step="1000"
                  min="0"
                  className={`w-full rounded-lg border px-3 py-2 ${errors.salary ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:outline-none`}
                />
                {errors.salary && (
                  <p className="mt-1 text-xs text-red-500">{errors.salary}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Hire Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 ${errors.hire_date ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:outline-none`}
                />
                {errors.hire_date && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.hire_date}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 ${errors.contact_number ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:outline-none`}
              />
              {errors.contact_number && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.contact_number}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-300 px-4 py-2 text-gray-800 transition hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-500 px-4 py-2 text-white transition hover:bg-amber-600"
              >
                {employee ? 'Update Employee' : 'Create Employee'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmployeeModal;

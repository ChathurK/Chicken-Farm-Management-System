import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { X, ClipboardText, Check, WarningCircle } from '@phosphor-icons/react';

// Form field component for reusability
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  ...props
}) => (
  <div>
    <label
      htmlFor={name}
      className="mb-1 block text-sm font-medium text-gray-700"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:outline-none`}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      ></textarea>
    ) : (
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'} focus:border-amber-500 focus:outline-none`}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required ? 'true' : 'false'}
        {...props}
      />
    )}
    {error && (
      <p className="mt-1 text-xs text-red-500" id={`${name}-error`}>
        {error}
      </p>
    )}
  </div>
);

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
};

const EmployeeModal = ({
  show,
  onClose,
  onSave,
  employee,
  temporaryPassword,
  apiError,
}) => {
  const initialFormState = {
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    position: '',
    salary: '',
    hire_date: new Date().toISOString().split('T')[0],
    contact_number: '',
    address: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  // Reset form when modal opens/closes or employee changes
  useEffect(() => {
    if (show) {
      if (employee) {
        // Fix timezone issues with dates by handling them properly
        let hireDate = '';
        if (employee.hire_date) {
          // Create a date with time part set to noon to avoid timezone issues
          const date = new Date(employee.hire_date);
          date.setHours(12, 0, 0, 0);
          hireDate = date.toISOString().split('T')[0];
        } else {
          hireDate = new Date().toISOString().split('T')[0];
        }

        setFormData({
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          email: employee.email || '',
          department: employee.department || '',
          position: employee.position || '',
          salary: employee.salary || '',
          hire_date: hireDate,
          contact_number: employee.contact_number || '',
          address: employee.address || '',
        });
      } else {
        // New employee - reset form
        setFormData(initialFormState);
      }
      setErrors({});
      setGeneralError(null);
    }
  }, [show, employee]);

  // Parse API errors into field-specific errors
  useEffect(() => {
    if (apiError) {
      const errorMessage = apiError.toLowerCase();
      const newErrors = {};
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
      setErrors((prev) => ({ ...prev, ...newErrors }));

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
  }, [apiError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }

    // Clear general error if it's related to this field
    if (generalError) {
      const errorMsg = generalError.toLowerCase();
      if (
        (name === 'email' && errorMsg.includes('email')) ||
        (name === 'contact_number' && errorMsg.includes('contact'))
      ) {
        setGeneralError(null);
      }
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
    else if (!/^\d{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Contact number must be 10 digits';
    }

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
        hire_date: formData.hire_date, // Ensure hire_date is explicitly included
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
                <p className="font-bold">Password Updated Successfully!</p>
              ) : (
                <p className="font-bold">Employee Created Successfully!</p>
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
              <FormField
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
              />

              <FormField
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
              />
            </div>

            <div className="mb-4">
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                error={errors.department}
                required
              />

              <FormField
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                error={errors.position}
                required
              />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                error={errors.salary}
                required
                step="1000"
                min="0"
              />

              <FormField
                label="Hire Date"
                name="hire_date"
                type="date"
                value={formData.hire_date}
                min={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                onChange={handleChange}
                error={errors.hire_date}
                required
              />
            </div>

            <div className="mb-4">
              <FormField
                label="Contact Number"
                name="contact_number"
                value={formData.contact_number}
                onChange={e => {
                  // Only allow digits, limit to 10 characters
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  handleChange({ target: { name: 'contact_number', value } });
                }}
                required
                maxLength={10}
                pattern="\d{10}"
                placeholder="Enter 10 digit number"
                error={errors.contact_number}
              />
            </div>

            <div className="mb-4">
              <FormField
                label="Address"
                name="address"
                type="textarea"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
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

EmployeeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  employee: PropTypes.object,
  temporaryPassword: PropTypes.string,
  apiError: PropTypes.string,
};

// Use memo to prevent unnecessary re-renders
export default memo(EmployeeModal);

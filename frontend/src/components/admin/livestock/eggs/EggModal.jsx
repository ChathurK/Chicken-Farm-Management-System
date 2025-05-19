import React, { useState, useEffect } from 'react';
import { X, FloppyDisk } from '@phosphor-icons/react';
import BuyerModal from '../../buyers/BuyerModal';

const EggModal = ({ isOpen, onClose, onSave, egg }) => {
  const initialFormData = {
    laid_date: '',
    expiration_date: '',
    quantity: '',
    size: 'Medium',
    color: 'White',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Set form data when modal opens with egg data
  useEffect(() => {
    if (egg) {
      // Format dates for input field using local time to avoid off-by-one errors
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      const formattedLaidDate = formatDate(egg.laid_date);
      const formattedExpirationDate = formatDate(egg.expiration_date);

      setFormData({
        laid_date: formattedLaidDate,
        expiration_date: formattedExpirationDate,
        quantity: egg.quantity,
        size: egg.size,
        color: egg.color,
        notes: egg.notes || '',
      });
    } else {
      // Set default values for new egg
      const today = new Date().toISOString().split('T')[0];
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30); // Default to 30 days expiration

      setFormData({
        ...initialFormData,
        laid_date: today,
        expiration_date: expirationDate.toISOString().split('T')[0],
      });
    }

    setFormErrors({});
  }, [egg, isOpen]);

  // Handle input changes
  const handleChange = (e) => {
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

    if (!formData.laid_date) errors.laid_date = 'Laid date is required';

    if (!formData.expiration_date)
      errors.expiration_date = 'Expiration date is required';

    if (new Date(formData.expiration_date) <= new Date(formData.laid_date))
      errors.expiration_date = 'Expiration date must be after laid date';

    if (!formData.quantity && formData.quantity !== 0) {
      errors.quantity = 'Quantity is required';
    } else if (
      egg ? parseInt(formData.quantity) < 0 : parseInt(formData.quantity) <= 0
    ) {
      errors.quantity = egg
        ? 'Quantity cannot be negative'
        : 'Quantity must be greater than 0';
    }

    if (!formData.size) errors.size = 'Size is required';

    if (!formData.color) errors.color = 'Color is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const success = await onSave(formData);
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  return (
    <BuyerModal
      isOpen={isOpen}
      title={egg ? 'Edit Egg Record' : 'Add New Egg Record'}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Laid Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="laid_date"
                value={formData.laid_date}
                max={new Date().toLocaleDateString('en-CA')}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  formErrors.laid_date ? 'border-red-500' : 'border-gray-300'
                } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              />
              {formErrors.laid_date && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.laid_date}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Expiration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiration_date"
                value={formData.expiration_date}
                min={new Date().toLocaleDateString('en-CA')}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  formErrors.expiration_date
                    ? 'border-red-500'
                    : 'border-gray-300'
                } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              />
              {formErrors.expiration_date && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.expiration_date}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              />
              {formErrors.quantity && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.quantity}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Size <span className="text-red-500">*</span>
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  formErrors.size ? 'border-red-500' : 'border-gray-300'
                } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
              {formErrors.size && (
                <p className="mt-1 text-sm text-red-500">{formErrors.size}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Color <span className="text-red-500">*</span>
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  formErrors.color ? 'border-red-500' : 'border-gray-300'
                } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              >
                <option value="White">White</option>
                <option value="Brown">Brown</option>
              </select>
              {formErrors.color && (
                <p className="mt-1 text-sm text-red-500">{formErrors.color}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="Additional information about this batch of eggs"
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <FloppyDisk size={18} weight="bold" />
            )}
            Save
          </button>
        </div>
      </form>
    </BuyerModal>
  );
};

export default EggModal;

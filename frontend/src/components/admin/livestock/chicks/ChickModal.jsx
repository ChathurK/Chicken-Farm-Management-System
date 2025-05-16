import React, { useState, useEffect } from 'react';
import { FloppyDisk } from '@phosphor-icons/react';
import BuyerModal from '../../buyers/BuyerModal';

const ChickModal = ({ isOpen, onClose, onSave, chick }) => {
  const initialFormData = {
    parent_breed: '',
    hatched_date: '',
    quantity: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Set form data when modal opens with chick data
  useEffect(() => {
    if (chick) {
      // Format dates for input field
      const formattedHatchedDate = chick.hatched_date
        ? new Date(chick.hatched_date).toISOString().split('T')[0]
        : '';

      setFormData({
        parent_breed: chick.parent_breed,
        hatched_date: formattedHatchedDate,
        quantity: chick.quantity,
        notes: chick.notes || '',
      });
    } else {
      // Set default values for new chick
      const today = new Date().toISOString().split('T')[0];

      setFormData({
        ...initialFormData,
        hatched_date: today,
      });
    }

    setFormErrors({});
  }, [chick, isOpen]);

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

    if (!formData.parent_breed || formData.parent_breed.trim() === '')
      errors.parent_breed = 'Parent breed is required';

    if (!formData.hatched_date)
      errors.hatched_date = 'Hatched date is required';

    if (!formData.quantity) errors.quantity = 'Quantity is required';
    else if (parseInt(formData.quantity) < 0)
      errors.quantity = 'Quantity must be 0 or a positive number';

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
      title={chick ? 'Edit Chick Record' : 'Add New Chick Record'}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Parent Breed <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="parent_breed"
                value={formData.parent_breed}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  formErrors.parent_breed ? 'border-red-500' : 'border-gray-300'
                } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                placeholder="e.g., Rhode Island Red"
              />
              {formErrors.parent_breed && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.parent_breed}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Hatched Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="hatched_date"
                value={formData.hatched_date}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  formErrors.hatched_date ? 'border-red-500' : 'border-gray-300'
                } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              />
              {formErrors.hatched_date && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.hatched_date}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className={`w-full rounded-lg border ${
                formErrors.quantity ? 'border-red-500' : 'border-gray-300'
              } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              placeholder="Number of chicks"
            />
            {formErrors.quantity && (
              <p className="mt-1 text-sm text-red-500">{formErrors.quantity}</p>
            )}
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
              placeholder="Additional information about this batch of chicks (health status, special care instructions, etc.)"
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

export default ChickModal;

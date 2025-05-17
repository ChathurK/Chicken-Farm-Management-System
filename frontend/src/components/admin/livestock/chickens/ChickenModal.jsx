import React, { useState, useEffect } from 'react';
import { FloppyDisk, Info } from '@phosphor-icons/react';
import BuyerModal from '../../buyers/BuyerModal';

const ChickenModal = ({ isOpen, onClose, onSave, chicken }) => {
  const initialFormData = {
    type: 'Layer',
    breed: '',
    quantity: '',
    age_weeks: '',
    acquisition_date: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Set form data when modal opens with chicken data
  useEffect(() => {
    if (chicken) {
      // Format dates for input field (use local date to avoid timezone issues)
      const formattedAcquisitionDate = chicken.acquisition_date
        ? (() => {
            const d = new Date(chicken.acquisition_date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()
        : '';

      setFormData({
        type: chicken.type,
        breed: chicken.breed,
        quantity: chicken.quantity,
        age_weeks: chicken.age_weeks || '',
        acquisition_date: formattedAcquisitionDate,
        notes: chicken.notes || '',
      });
    } else {
      // Set default values for new chicken record
      const today = new Date().toISOString().split('T')[0];

      setFormData({
        ...initialFormData,
        acquisition_date: today,
      });
    }

    setFormErrors({});
  }, [chicken, isOpen]);

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

    if (!formData.type) errors.type = 'Type is required';

    if (!formData.breed || formData.breed.trim() === '')
      errors.breed = 'Breed is required';

    if (!formData.quantity && formData.quantity !== 0) {
      errors.quantity = 'Quantity is required';
    } else if (
      (chicken ? parseInt(formData.quantity) < 0 : parseInt(formData.quantity) <= 0)
    ) {
      errors.quantity = chicken
      ? 'Quantity cannot be negative'
      : 'Quantity must be greater than 0';
    }
    
    if (formData.age_weeks && parseInt(formData.age_weeks) <= 0)
      errors.age_weeks = 'Initial age at acquisition must be a positive number';

    if (!formData.acquisition_date)
      errors.acquisition_date = 'Acquisition date is required';

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
      title={chicken ? 'Edit Chicken Record' : 'Add New Chicken Record'}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  formErrors.type ? 'border-red-500' : 'border-gray-300'
                } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              >
                <option value="Layer">Layer</option>
                <option value="Broiler">Broiler</option>
                <option value="Breeder">Breeder</option>
              </select>
              {formErrors.type && (
                <p className="mt-1 text-sm text-red-500">{formErrors.type}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Breed <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  formErrors.breed ? 'border-red-500' : 'border-gray-300'
                } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                placeholder="e.g., Rhode Island Red"
              />
              {formErrors.breed && (
                <p className="mt-1 text-sm text-red-500">{formErrors.breed}</p>
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
                placeholder="Number of chickens"
              />
              {formErrors.quantity && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.quantity}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                Age at Acquisition
                <div className="group relative inline-block">
                  <Info 
                    size={16} 
                    className="cursor-help text-gray-500" 
                    weight="duotone" 
                  />
                  <div className="invisible absolute left-0 top-full z-10 w-64 rounded-md bg-gray-800 p-2 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100">
                    This is the age of the chickens when they were acquired. The current age will be calculated automatically based on this value and the acquisition date.
                  </div>
                </div>
              </label>
              <input
                type="number"
                name="age_weeks"
                min="1"
                value={formData.age_weeks}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  formErrors.age_weeks ? 'border-red-500' : 'border-gray-300'
                } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
                placeholder="Age in weeks"
              />
              {formErrors.age_weeks && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.age_weeks}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Acquisition Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="acquisition_date"
                value={formData.acquisition_date}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  formErrors.acquisition_date
                    ? 'border-red-500'
                    : 'border-gray-300'
                } p-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-amber-500`}
              />
              {formErrors.acquisition_date && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.acquisition_date}
                </p>
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
              placeholder="Additional information about these chickens (health status, feeding schedule, etc.)"
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

export default ChickenModal;

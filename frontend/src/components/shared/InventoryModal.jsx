import React, { useEffect } from 'react';
import { X } from '@phosphor-icons/react';

/**
 * Reusable modal component for inventory-related operations
 */
const InventoryModal = ({ isOpen, title, onClose, children }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="h-full">{children}</div>
      </div>
    </div>
  );
};

export default InventoryModal;

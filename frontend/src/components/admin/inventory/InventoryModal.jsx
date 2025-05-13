import React from 'react';
import { X } from '@phosphor-icons/react';

// Main Modal Component
const InventoryModal = ({ isOpen, title, children, onClose, size = 'md' }) => {
  if (!isOpen) return null;

  // Size classes for different modal sizes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div
        className={`m-4 w-full rounded-lg bg-white shadow-xl ${sizeClasses[size]}`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={24} weight="bold" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmButtonClass,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div className="m-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={24} weight="bold" />
          </button>
        </div>
        <div className="p-4">
          <p className="mb-6 text-gray-700">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              {cancelText || 'Cancel'}
            </button>
            <button
              onClick={onConfirm}
              className={`rounded-lg px-4 py-2 text-white ${
                confirmButtonClass || 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;

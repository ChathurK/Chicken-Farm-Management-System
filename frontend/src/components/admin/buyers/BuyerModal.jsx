import { X } from '@phosphor-icons/react';

const BuyerModal = ({ isOpen, title, children, onClose, size = 'sm' }) => {
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
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Confirmation Dialog Component
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
  return (
    <BuyerModal isOpen={isOpen} title={title} onClose={onCancel} size="sm">
      <div className="mb-6">
        <p className="text-gray-700">{message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 ${confirmButtonClass}`}
        >
          {confirmText}
        </button>
      </div>
    </BuyerModal>
  );
};

export default BuyerModal;

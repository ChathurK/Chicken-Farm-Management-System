import React from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

/**
 * Reusable pagination component for displaying and navigating through paginated data
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (starting from 1)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items across all pages
 * @param {number} props.itemsPerPage - Number of items displayed per page
 * @param {number} props.currentPageFirstItemIndex - Index of the first item on the current page (0-based)
 * @param {number} props.currentPageLastItemIndex - Index of the last item on the current page (0-based)
 * @param {Function} props.onPageChange - Function to call when page changes, receives new page number
 * @param {boolean} props.showItemCount - Whether to show item count info (defaults to true)
 * @param {string} props.itemName - Name of the items being paginated (e.g., "buyers", "orders")
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  currentPageFirstItemIndex,
  currentPageLastItemIndex,
  onPageChange,
  showItemCount = true,
  itemName = 'items'
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      {showItemCount && (
        <div className="text-sm text-gray-500">
          Showing {currentPageFirstItemIndex + 1} to{' '}
          {Math.min(currentPageLastItemIndex + 1, totalItems)} of{' '}
          {totalItems} {itemName}
        </div>
      )}
      
      <div className="flex">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className={`flex items-center rounded-l-lg border bg-gray-100 px-3 py-1 text-gray-700 ${
            currentPage === 1
              ? 'cursor-not-allowed opacity-50'
              : 'hover:text-amber-500'
          }`}
        >
          <CaretLeft size={14} weight="duotone" />
          Prev
        </button>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`flex items-center rounded-r-lg border bg-gray-100 px-3 py-1 text-gray-700 ${
            currentPage === totalPages
              ? 'cursor-not-allowed opacity-50'
              : 'hover:text-amber-500'
          }`}
        >
          Next
          <CaretRight size={14} weight="duotone" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

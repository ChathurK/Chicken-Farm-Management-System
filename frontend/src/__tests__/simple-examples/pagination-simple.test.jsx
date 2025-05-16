// Simple test for the Pagination component
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../../components/shared/Pagination';

// Mock the phosphor icons
vi.mock('@phosphor-icons/react', () => ({
  CaretLeft: () => <span data-testid="prev-icon">←</span>,
  CaretRight: () => <span data-testid="next-icon">→</span>
}));

describe('Pagination Component - Simple Tests', () => {
  // The most basic test: does it render?
  it('renders the pagination component with prev and next buttons', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={100}
        itemsPerPage={20}
        currentPageFirstItemIndex={20}
        currentPageLastItemIndex={39}
        onPageChange={() => {}}
      />
    );
    
    // Check if prev and next buttons are there
    expect(screen.getByText('Prev')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    
    // Check if the item count info is displayed
    expect(screen.getByText(/Showing 21 to 40 of 100/)).toBeInTheDocument();
  });
  
  // Test that clicking works
  it('calls onPageChange when clicking Next button', () => {
    const mockOnPageChange = vi.fn();
    
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={100}
        itemsPerPage={20}
        currentPageFirstItemIndex={20}
        currentPageLastItemIndex={39}
        onPageChange={mockOnPageChange}
      />
    );
    
    // Click on the Next button
    fireEvent.click(screen.getByText('Next'));
    
    // Check if onPageChange was called with page 3
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });
  
  // Test disabled state
  it('disables the Prev button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={100}
        itemsPerPage={20}
        currentPageFirstItemIndex={0}
        currentPageLastItemIndex={19}
        onPageChange={() => {}}
      />
    );
    
    // Find the Prev button and check if it's disabled
    const prevButton = screen.getByText('Prev').closest('button');
    expect(prevButton).toHaveAttribute('disabled');
  });
  
  // Test that it doesn't render when there's only one page
  it('does not render pagination if totalPages is 1', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={10}
        itemsPerPage={10}
        currentPageFirstItemIndex={0}
        currentPageLastItemIndex={9}
        onPageChange={() => {}}
      />
    );
    
    // Check if nothing was rendered
    expect(container.firstChild).toBeNull();
  });
});

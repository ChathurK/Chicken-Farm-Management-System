// Test for Pagination component
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../../components/shared/Pagination';

describe('Pagination Component', () => {
  it('renders pagination with correct details', () => {
    const onPageChange = vi.fn();
    
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        currentPageFirstItemIndex={10}
        currentPageLastItemIndex={19}
        onPageChange={onPageChange}
        itemName="chickens"
      />
    );

    // Check if showing the right item count
    expect(screen.getByText('Showing 11 to 20 of 50 chickens')).toBeInTheDocument();
    
    // Check if page numbers are displayed
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onPageChange when clicking on page buttons', () => {
    const onPageChange = vi.fn();
    
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        currentPageFirstItemIndex={10}
        currentPageLastItemIndex={19}
        onPageChange={onPageChange}
      />
    );

    // Click on page 3
    fireEvent.click(screen.getByText('3'));
    
    // Assert onPageChange was called with page 3
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first page', () => {
    const onPageChange = vi.fn();
    
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        currentPageFirstItemIndex={0}
        currentPageLastItemIndex={9}
        onPageChange={onPageChange}
      />
    );

    // Find the previous button (assumes it has aria-label)
    const prevButton = screen.getByLabelText(/previous/i) || screen.getByRole('button', { name: /previous/i });
    
    // Check if it's disabled
    expect(prevButton).toHaveAttribute('disabled');
  });

  it('does not render pagination when totalPages is 1', () => {
    const onPageChange = vi.fn();
    
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={10}
        itemsPerPage={10}
        currentPageFirstItemIndex={0}
        currentPageLastItemIndex={9}
        onPageChange={onPageChange}
      />
    );

    // Component should not render anything
    expect(container.firstChild).toBeNull();
  });
});

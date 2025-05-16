// Example test for SignIn component with API mocking
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignIn from '../../components/SignIn';
import { AuthProvider } from '../../context/AuthContext';
import createMockServer, { apiMocks } from '../utils/mockServer';
import { BrowserRouter } from 'react-router-dom';

// Setup mock server
createMockServer([
  apiMocks.login(true)
]);

// Mock router
const MockRouter = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('SignIn Component', () => {
  const renderSignIn = () => {
    return render(
      <MockRouter>
        <AuthProvider>
          <SignIn />
        </AuthProvider>
      </MockRouter>
    );
  };

  it('renders the sign in form correctly', () => {
    renderSignIn();
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits the form with correct credentials', async () => {
    renderSignIn();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for the form submission and redirect
    await waitFor(() => {
      // This depends on your implementation, but typically you would
      // check if some loading state is set, or if redirect happened
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  it('shows error message for invalid credentials', async () => {
    // Override the mock to simulate login failure
    createMockServer([
      apiMocks.login(false)
    ]);
    
    renderSignIn();
    
    // Fill in the form with wrong credentials
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'wronguser' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});

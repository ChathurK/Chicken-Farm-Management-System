import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

// Create the context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check for existing token when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { 
        email, 
        password 
      });
      
      // Save token to localStorage and state
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || 'Login failed');
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      
      // Save token to localStorage and state
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || 'Registration failed');
    }
  };

  // Update user profile function
  const updateProfile = async (userId, updatedData) => {
    try {
      const response = await api.put(`/api/users/${userId}`, updatedData);
      
      // Update user data in state
      setUser(response.data);
      
      return response.data;
    } catch (error) {
      // Handle different error response formats
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
        // Express-validator format with array of errors
        throw new Error(error.response.data.errors[0].msg);
      } else if (error.response?.data?.msg) {
        // Simple message format
        throw new Error(error.response.data.msg);
      } else {
        // Fallback message
        throw new Error('Failed to update profile');
      }
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Clear user data from state
    setToken(null);
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token;
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
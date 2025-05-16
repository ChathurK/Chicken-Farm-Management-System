// Test utility for mocking API responses
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Setup MSW mock server
export const createMockServer = (handlers) => {
  const server = setupServer(...handlers);
  
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  
  return server;
};

// Common API mocks
export const apiMocks = {
  // Auth mocks
  login: (success = true, userData = {}) => {
    if (success) {
      return http.post('*/api/auth/login', () => {
        return HttpResponse.json({
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: 'admin',
            ...userData
          }
        });
      });
    }
    return http.post('*/api/auth/login', () => {
      return HttpResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    });
  },
  
  // Chicken data mocks
  getChickens: (chickens = []) => {
    return http.get('*/api/chickens', () => {
      return HttpResponse.json({
        success: true,
        data: chickens.length > 0 ? chickens : [
          { 
            chickId: 1, 
            breed: 'Leghorn', 
            birthDate: '2024-01-15', 
            status: 'healthy', 
            coopNumber: 'A1', 
            health: 'Good' 
          },
          { 
            chickId: 2, 
            breed: 'Rhode Island Red', 
            birthDate: '2024-02-01', 
            status: 'healthy', 
            coopNumber: 'B2', 
            health: 'Excellent' 
          }
        ],
        totalItems: chickens.length > 0 ? chickens.length : 2
      });
    });
  },
  
  // Error mocks
  serverError: (path) => {
    return http.get(path, () => {
      return HttpResponse.json({
        success: false,
        message: 'Internal server error'
      }, { status: 500 });
    });
  }
};

export default createMockServer;

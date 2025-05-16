// Simple test for the chickens API endpoint
const request = require('supertest');
const express = require('express');
const chickenController = require('../../controllers/chickenController');

// Mock database
jest.mock('../../config/database', () => ({
  execute: jest.fn()
}));

// Import the database after mocking
const db = require('../../config/database');

// Create a simple Express app for testing
const app = express();
app.use(express.json());
app.get('/api/chickens', chickenController.getAllChickens);

describe('Chicken API Endpoints', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/chickens', () => {
    it('should return all chickens', async () => {
      // Mock the database response
      const mockChickens = [
        { 
          id: 1, 
          breed: 'Leghorn', 
          type: 'Layer',
          health_status: 'Healthy'
        },
        { 
          id: 2, 
          breed: 'Rhode Island Red', 
          type: 'Layer',
          health_status: 'Healthy'
        }
      ];
      
      // Set up the mock to return our test data
      db.execute.mockResolvedValue([mockChickens]);
      
      // Make request to the endpoint
      const res = await request(app).get('/api/chickens');
      
      // Check status code
      expect(res.statusCode).toBe(200);
      
      // Check response body matches our mock data
      expect(res.body).toEqual(mockChickens);
      
      // Verify database was called with correct query
      expect(db.execute).toHaveBeenCalledWith('SELECT * FROM Chicken_Records');
    });

    it('should handle errors properly', async () => {
      // Make the database throw an error
      db.execute.mockRejectedValue(new Error('Database connection failed'));
      
      // Make request to the endpoint
      const res = await request(app).get('/api/chickens');
      
      // Check status code shows server error
      expect(res.statusCode).toBe(500);
      
      // Check error message
      expect(res.text).toBe('Server Error');
    });
  });
});

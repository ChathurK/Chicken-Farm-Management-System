// Example API test for chicken routes
const request = require('supertest');
const express = require('express');
const app = express();
const { getTestDatabase, setupTestDatabase, teardownTestDatabase } = require('../../config/testDatabase');

let pool;

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    // For testing purposes, we'll mock a user
    req.user = { 
      id: 1, 
      username: 'testadmin',
      role: 'admin'
    };
    next();
  }
}));

// Import routes after mocking the auth middleware
const chickenRoutes = require('../../routes/chickens');

// Setup Express app with routes
app.use(express.json());
app.use('/api/chickens', chickenRoutes);

describe('Chicken API Routes', () => {
  beforeAll(async () => {
    // Set up test database
    pool = await setupTestDatabase();
    
    // Insert test data
    await pool.query(`
      INSERT INTO Chickens (chickId, breed, birthDate, status, coopNumber, health)
      VALUES 
        (1, 'Leghorn', '2024-01-15', 'healthy', 'A1', 'Good'),
        (2, 'Rhode Island Red', '2024-02-01', 'healthy', 'B2', 'Excellent')
    `);
  });

  afterAll(async () => {
    await teardownTestDatabase(pool);
  });

  describe('GET /api/chickens', () => {
    it('should return all chickens', async () => {
      const res = await request(app).get('/api/chickens');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/chickens/:id', () => {
    it('should return a specific chicken', async () => {
      const res = await request(app).get('/api/chickens/1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('chickId', 1);
      expect(res.body.data).toHaveProperty('breed', 'Leghorn');
    });

    it('should return 404 for non-existent chicken', async () => {
      const res = await request(app).get('/api/chickens/999');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

// Example Unit test for User model
const User = require('../../models/User');
const { getTestDatabase, setupTestDatabase, teardownTestDatabase } = require('../../config/testDatabase');
const bcrypt = require('bcrypt');

let pool;

describe('User Model Tests', () => {
  beforeAll(async () => {
    pool = await setupTestDatabase();
    
    // Insert test data
    const hashedPassword = await bcrypt.hash('password123', 10);
    await pool.query(`
      INSERT INTO Users (userId, username, password, email, role, createdAt)
      VALUES (1, 'testuser', ?, 'test@example.com', 'user', NOW())
    `, [hashedPassword]);
  });

  afterAll(async () => {
    await teardownTestDatabase(pool);
  });

  describe('User.findById', () => {
    it('should return a user when given valid id', async () => {
      const user = await User.findById(1);
      
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('user');
      // Password should never be returned
      expect(user.password).toBeUndefined();
    });

    it('should return null for non-existent user id', async () => {
      const user = await User.findById(999);
      expect(user).toBeNull();
    });
  });

  describe('User.findByUsername', () => {
    it('should return a user when given valid username', async () => {
      const user = await User.findByUsername('testuser');
      
      expect(user).toBeDefined();
      expect(user.userId).toBe(1);
      expect(user.email).toBe('test@example.com');
    });

    it('should return null for non-existent username', async () => {
      const user = await User.findByUsername('nonexistent');
      expect(user).toBeNull();
    });
  });
});

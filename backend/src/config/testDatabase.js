// Test database configuration
const mysql = require('mysql2/promise');
require('dotenv').config();

const getTestDatabase = () => {
  const pool = mysql.createPool({
    host: process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || process.env.DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD || 'MYsql2023#',
    database: process.env.TEST_DB_NAME || 'ChickenFarmManagementSystemTest',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return pool;
};

const setupTestDatabase = async () => {
  const fs = require('fs');
  const path = require('path');
  const pool = getTestDatabase();

  try {
    // Drop the test database if it exists and create a new one
    await pool.query(`DROP DATABASE IF EXISTS ${process.env.TEST_DB_NAME || 'ChickenFarmManagementSystemTest'}`);
    await pool.query(`CREATE DATABASE ${process.env.TEST_DB_NAME || 'ChickenFarmManagementSystemTest'}`);
    await pool.query(`USE ${process.env.TEST_DB_NAME || 'ChickenFarmManagementSystemTest'}`);

    // Read schema file
    const sqlScript = fs.readFileSync(
      path.join(__dirname, '../utils/dbSetup.sql'), 
      'utf8'
    );
    
    // Split the script into individual statements
    const statements = sqlScript.split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('Test database initialized successfully');
    return pool;
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
};

const teardownTestDatabase = async (pool) => {
  try {
    await pool.end();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database connection:', error);
  }
};

module.exports = {
  getTestDatabase,
  setupTestDatabase,
  teardownTestDatabase
};

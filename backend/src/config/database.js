const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'MYsql2023#',
    database: process.env.DB_NAME || 'ChickenFarmManagementSystem',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        // process.exit(1); // Exit with failure
    }
};

// Call test connection function
testConnection();

const initializeDatabase = async () => {
  try {
    // Check if Employees table exists (as a test)
    const [tables] = await pool.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Employees'
    `, [process.env.DB_NAME]);
    
    // If tables don't exist, create them
    if (tables.length === 0) {
      console.log('Tables not found, creating database schema...');
      const fs = require('fs');
      const path = require('path');
      const sqlScript = fs.readFileSync(
        path.join(__dirname, '../utils/dbSetup.sql'), 
        'utf8'
      );
      
      // Split the script into individual statements
      const statements = sqlScript.split(';')
        .filter(statement => statement.trim() !== '');
      
      // Execute each statement
      for (const statement of statements) {
        await pool.query(statement);
      }
      
      console.log('Database schema created successfully');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exit(1);
  }
};

// Call this function when the application starts
initializeDatabase();

module.exports = pool;
const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    // Create a new user
    static async create(userData) {
        const { first_name, last_name, email, password, role } = userData;
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const query = 'INSERT INTO Users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [first_name, last_name, email, password_hash, role]);
        
        return { user_id: result.insertId, first_name, last_name, email, role };
    }
    
    // Find user by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM Users WHERE email = ?';
        const [rows] = await db.execute(query, [email]);
        return rows[0];
    }
    
    // Find user by ID
    static async findById(id) {
        const query = 'SELECT user_id, first_name, last_name, email, role, created_at FROM Users WHERE user_id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }
    
    // Get all users
    static async findAll() {
        const query = 'SELECT user_id, first_name, last_name, email, role, created_at FROM Users';
        const [rows] = await db.execute(query);
        return rows;
    }
    
    // Update user
    static async update(id, userData) {
        const { first_name, last_name, email, role } = userData;
        
        // Update query without password
        const query = 'UPDATE Users SET first_name = ?, last_name = ?, email = ?, role = ? WHERE user_id = ?';
        await db.execute(query, [first_name, last_name, email, role, id]);
        
        return { user_id: id, first_name, last_name, email, role };
    }
    
    // Update password
    static async updatePassword(id, newPassword) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);
        
        const query = 'UPDATE Users SET password_hash = ? WHERE user_id = ?';
        await db.execute(query, [password_hash, id]);
        
        return true;
    }
    
    // Delete user
    static async delete(id) {
        const query = 'DELETE FROM Users WHERE user_id = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Compare password
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = User;
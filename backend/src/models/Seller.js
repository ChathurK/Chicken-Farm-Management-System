const db = require('../config/database');

class Seller {
    // Create a new seller
    static async create(sellerData) {
        const { first_name, last_name, contact_number, email, address } = sellerData;
        
        const query = 'INSERT INTO Sellers (first_name, last_name, contact_number, email, address) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [first_name, last_name, contact_number, email, address]);
        
        return { seller_id: result.insertId, ...sellerData };
    }
    
    // Find seller by ID
    static async findById(id) {
        const query = 'SELECT * FROM Sellers WHERE seller_id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }
    
    // Find seller by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM Sellers WHERE email = ?';
        const [rows] = await db.execute(query, [email]);
        return rows[0];
    }
    
    // Get all sellers
    static async findAll() {
        const query = 'SELECT * FROM Sellers ORDER BY first_name ASC, last_name ASC';
        const [rows] = await db.execute(query);
        return rows;
    }
    
    // Update seller
    static async update(id, sellerData) {
        const { first_name, last_name, contact_number, email, address } = sellerData;
        
        const query = 'UPDATE Sellers SET first_name = ?, last_name = ?, contact_number = ?, email = ?, address = ? WHERE seller_id = ?';
        await db.execute(query, [first_name, last_name, contact_number, email, address, id]);
        
        return { seller_id: id, ...sellerData };
    }
    
    // Delete seller
    static async delete(id) {
        const query = 'DELETE FROM Sellers WHERE seller_id = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Get transaction history with this seller
    static async getTransactionHistory(sellerId) {
        const query = `
            SELECT t.*, i.item_name, i.category
            FROM Transactions t
            LEFT JOIN Inventory i ON t.inventory_id = i.inventory_id
            WHERE t.seller_id = ?
            ORDER BY t.transaction_date DESC
        `;
        
        const [rows] = await db.execute(query, [sellerId]);
        return rows;
    }
}

module.exports = Seller;
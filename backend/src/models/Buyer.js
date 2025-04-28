const db = require('../config/database');

class Buyer {
    // Create a new buyer
    static async create(buyerData) {
        const { first_name, last_name, contact_number, email, address } = buyerData;
        
        const query = 'INSERT INTO Buyers (first_name, last_name, contact_number, email, address) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [first_name, last_name, contact_number, email, address]);
        
        return { buyer_id: result.insertId, ...buyerData };
    }
    
    // Find buyer by ID
    static async findById(id) {
        const query = 'SELECT * FROM Buyers WHERE buyer_id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }
    
    // Find buyer by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM Buyers WHERE email = ?';
        const [rows] = await db.execute(query, [email]);
        return rows[0];
    }
    
    // Get all buyers
    static async findAll() {
        const query = 'SELECT * FROM Buyers ORDER BY last_name ASC, first_name ASC';
        const [rows] = await db.execute(query);
        return rows;
    }
    
    // Update buyer
    static async update(id, buyerData) {
        const { first_name, last_name, contact_number, email, address } = buyerData;
        
        const query = 'UPDATE Buyers SET first_name = ?, last_name = ?, contact_number = ?, email = ?, address = ? WHERE buyer_id = ?';
        await db.execute(query, [first_name, last_name, contact_number, email, address, id]);
        
        return { buyer_id: id, ...buyerData };
    }
    
    // Delete buyer
    static async delete(id) {
        const query = 'DELETE FROM Buyers WHERE buyer_id = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Get buyer's order history
    static async getOrderHistory(buyerId) {
        const query = `
            SELECT o.*, 
                   COUNT(oi.order_item_id) as total_items,
                   SUM(oi.total_price) as order_total
            FROM Orders o
            LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
            WHERE o.buyer_id = ?
            GROUP BY o.order_id
            ORDER BY o.order_date DESC
        `;
        
        const [rows] = await db.execute(query, [buyerId]);
        return rows;
    }
}

module.exports = Buyer;